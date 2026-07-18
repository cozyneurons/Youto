import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.middleware.auth_middleware import get_current_user
from app.models.course import Course
from app.models.course_share import CourseShare
from app.models.lesson import Lesson
from app.models.progress import Progress
from app.models.user import User
from app.schemas.course import CourseCreate, CourseUpdate, CourseDetailResponse, CourseResponse
from app.schemas.course_share import CourseShareResponse, FriendProgress
from app.services.database import get_db

router = APIRouter()


@router.get("/", response_model=List[CourseResponse])
def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    created_courses = db.query(Course).filter(Course.created_by == current_user.id).all()
    
    joined_shares = db.query(CourseShare).filter(
        CourseShare.friend_id == current_user.id,
        CourseShare.friend_id.isnot(None)
    ).all()
    joined_course_ids = [share.course_id for share in joined_shares]
    
    joined_courses = []
    if joined_course_ids:
        joined_courses = db.query(Course).filter(Course.id.in_(joined_course_ids)).all()
        
    all_courses = list({c.id: c for c in (created_courses + joined_courses)}.values())
    return all_courses


@router.get("/{course_id}", response_model=CourseDetailResponse)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/", response_model=CourseResponse)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = Course(**payload.model_dump(), created_by=current_user.id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id, Course.created_by == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id, Course.created_by == current_user.id
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"deleted": True}


@router.post("/{course_id}/share", response_model=CourseShareResponse)
def share_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Limit to 5 friends: count how many shares already exist for this course + owner where friend_id is NOT null
    active_shares = db.query(CourseShare).filter(
        CourseShare.course_id == course_id,
        CourseShare.owner_id == current_user.id,
        CourseShare.friend_id.isnot(None)
    ).count()

    if active_shares >= 5:
        raise HTTPException(status_code=400, detail="Maximum of 5 friends can be added to a course path.")

    # Create a new share link
    token = str(uuid.uuid4())
    share = CourseShare(
        token=token,
        course_id=course_id,
        owner_id=current_user.id,
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


@router.post("/join/{token}")
def join_course(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Lock the specific share row to prevent concurrent double-claims of the same token
    share = db.query(CourseShare).filter(CourseShare.token == token).with_for_update().first()
    if not share:
        raise HTTPException(status_code=404, detail="Invite link not found or invalid.")

    if share.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot join your own share link.")

    if share.friend_id is not None:
        if share.friend_id == current_user.id:
            return {"course_id": share.course_id, "message": "Already joined"}
        raise HTTPException(status_code=400, detail="This invite link has already been used.")

    # Lock the owner's User row to serialize the quota check across multiple concurrent join requests for different tokens
    db.query(User).filter(User.id == share.owner_id).with_for_update().first()

    # Enforce limit of 5 friends for this owner + course combo atomically
    active_shares = db.query(CourseShare).filter(
        CourseShare.course_id == share.course_id,
        CourseShare.owner_id == share.owner_id,
        CourseShare.friend_id.isnot(None)
    ).count()

    if active_shares >= 5:
        raise HTTPException(status_code=400, detail="This user has already reached the maximum of 5 friends for this course.")

    from sqlalchemy.exc import IntegrityError
    
    try:
        share.friend_id = current_user.id
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # Verify if the conflict is indeed the expected duplicate friendship
        existing = db.query(CourseShare).filter(
            CourseShare.course_id == share.course_id,
            CourseShare.owner_id == share.owner_id,
            CourseShare.friend_id == current_user.id
        ).first()
        if existing:
            return {"course_id": share.course_id, "message": "Already joined"}
        raise e
        
    return {"course_id": share.course_id, "message": "Successfully joined the course path."}


@router.get("/{course_id}/friends", response_model=List[FriendProgress])
def get_course_friends(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find all users sharing this course with the current user
    # Either current user is owner and they have a friend, or current user is the friend and they have an owner.
    # Additionally, we can also link all friends of the owner if requested, but for now we'll do direct relationships.
    # Actually, if User A shares with B and C. Should B see C? The requirement is "add a friend on their path", which implies User A sees B & C, and B sees A. B doesn't necessarily see C. We'll stick to a star topology (everyone sees the owner, owner sees everyone).
    
    shares_as_owner = db.query(CourseShare).filter(
        CourseShare.course_id == course_id,
        CourseShare.owner_id == current_user.id,
        CourseShare.friend_id.isnot(None)
    ).all()

    shares_as_friend = db.query(CourseShare).filter(
        CourseShare.course_id == course_id,
        CourseShare.friend_id == current_user.id
    ).all()

    friend_user_ids = set()
    for s in shares_as_owner:
        friend_user_ids.add(s.friend_id)
    for s in shares_as_friend:
        friend_user_ids.add(s.owner_id)

    if not friend_user_ids:
        return []

    friends = db.query(User).filter(User.id.in_(friend_user_ids)).all()
    
    # Calculate active_index for each friend
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()
    lesson_ids = [l.id for l in lessons]

    results = []
    for friend in friends:
        completed_lessons = db.query(Progress.lesson_id).filter(
            Progress.user_id == friend.id,
            Progress.lesson_id.in_(lesson_ids),
            Progress.completed == True
        ).all()
        completed_set = {r[0] for r in completed_lessons}

        active_index = len(lessons)
        for i, l in enumerate(lessons):
            if l.id not in completed_set:
                active_index = i
                break
        
        results.append(FriendProgress(
            user_id=friend.id,
            name=friend.name,
            avatar_url=friend.avatar_url,
            active_index=active_index
        ))

    return results
