"""venue guestlist and bottle service flags

Revision ID: 013
Revises: 012
Create Date: 2026-06-02
"""
from alembic import op
import sqlalchemy as sa

revision = "013"
down_revision = "012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("guestlist_enabled", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("venues", sa.Column("bottle_service_enabled", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("venues", sa.Column("guestlist_close_time", sa.String(10), nullable=True))


def downgrade() -> None:
    op.drop_column("venues", "guestlist_close_time")
    op.drop_column("venues", "bottle_service_enabled")
    op.drop_column("venues", "guestlist_enabled")
