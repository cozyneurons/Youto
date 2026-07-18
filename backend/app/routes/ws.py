import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from jose import jwt

from app.services.database import get_db
from app.services.auth_service import verify_token
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.models.course_share import CourseShare
from app.config import settings

router = APIRouter()

@router.post("/ticket")
def generate_ws_ticket(current_user: User = Depends(get_current_user)):
    """Generate a short-lived ticket for WebSocket authentication."""
    expire = datetime.now(timezone.utc) + timedelta(seconds=30)
    payload = {"sub": str(current_user.id), "type": "ws_ticket", "exp": expire}
    ticket = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return {"ticket": ticket}

class ConnectionManager:
    def __init__(self):
        # Maps course_id -> dict mapping websocket -> user_id
        self.active_connections: Dict[int, Dict[WebSocket, int]] = {}

    async def connect(self, websocket: WebSocket, course_id: int, user_id: int):
        await websocket.accept()
        if course_id not in self.active_connections:
            self.active_connections[course_id] = {}
        self.active_connections[course_id][websocket] = user_id

    def disconnect(self, websocket: WebSocket, course_id: int):
        if course_id in self.active_connections:
            self.active_connections[course_id].pop(websocket, None)
            if not self.active_connections[course_id]:
                del self.active_connections[course_id]

    async def broadcast_course_update(self, course_id: int, message: dict, allowed_recipients: Set[int]):
        if course_id not in self.active_connections:
            return

        # Bounded concurrency wrapper for send
        async def safe_send(ws: WebSocket):
            try:
                # Add timeout to prevent hanging on a stale connection
                async with asyncio.timeout(2.0):
                    await ws.send_json(message)
            except Exception:
                return ws
            return None

        tasks = []
        connections_to_message = []
        
        # Snapshot the dictionary to safely iterate
        current_conns = list(self.active_connections[course_id].items())
        
        for ws, user_id in current_conns:
            if user_id in allowed_recipients:
                connections_to_message.append(ws)
                tasks.append(safe_send(ws))
                
        if not tasks:
            return
            
        # Run sends concurrently with bounded concurrency to prevent overload if many clients exist
        failed_websockets = []
        chunk_size = 50
        for i in range(0, len(tasks), chunk_size):
            chunk = tasks[i:i + chunk_size]
            results = await asyncio.gather(*chunk, return_exceptions=True)
            for ws_result in results:
                if isinstance(ws_result, WebSocket):
                    failed_websockets.append(ws_result)

        # Cleanup failed connections safely
        for ws in failed_websockets:
            self.disconnect(ws, course_id)


manager = ConnectionManager()


@router.websocket("/courses/{course_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    course_id: int,
    ticket: str = Query(None),
    db: Session = Depends(get_db)
):
    # Authenticate the socket using the short-lived ticket
    if not ticket:
        await websocket.close(code=1008, reason="Missing ticket")
        return
        
    payload = verify_token(ticket)
    if not payload or payload.get("type") != "ws_ticket":
        await websocket.close(code=1008, reason="Invalid or expired ticket")
        return
        
    user_id_str = payload.get("sub")
    if not user_id_str or not user_id_str.isdigit():
        await websocket.close(code=1008, reason="Invalid token payload")
        return
        
    user_id = int(user_id_str)
    
    # Verify the referenced user remains valid without blocking the event loop
    from starlette.concurrency import run_in_threadpool
    
    def check_user_exists(session: Session, uid: int):
        return session.query(User).filter(User.id == uid).first()
        
    user = await run_in_threadpool(check_user_exists, db, user_id)
    if not user:
        await websocket.close(code=1008, reason="User no longer exists")
        return
    
    await manager.connect(websocket, course_id, user_id)
    try:
        while True:
            # We don't expect messages from client for now, just keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, course_id)

