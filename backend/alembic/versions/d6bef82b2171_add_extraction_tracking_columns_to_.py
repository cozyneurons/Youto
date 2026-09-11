"""add extraction tracking columns to lesson

Revision ID: d6bef82b2171
Revises: e029c30e124e
Create Date: 2026-09-11 22:43:54.832363

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6bef82b2171'
down_revision: Union[str, None] = 'e029c30e124e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('lessons', sa.Column('extraction_status', sa.String(), server_default='pending', nullable=True))
    op.add_column('lessons', sa.Column('extraction_attempts', sa.Integer(), server_default='0', nullable=True))
    op.add_column('lessons', sa.Column('extraction_error', sa.Text(), nullable=True))
    op.add_column('lessons', sa.Column('processing_started_at', sa.DateTime(), nullable=True))

def downgrade() -> None:
    op.drop_column('lessons', 'processing_started_at')
    op.drop_column('lessons', 'extraction_error')
    op.drop_column('lessons', 'extraction_attempts')
    op.drop_column('lessons', 'extraction_status')
