"""event extended fields: lineup, gallery, video, entry types, closing times, social proof

Revision ID: 010
Revises: 009
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "010"
down_revision = "009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("events", sa.Column("lineup", postgresql.JSONB(), nullable=True))
    op.add_column("events", sa.Column("gallery", postgresql.ARRAY(sa.Text()), nullable=True))
    op.add_column("events", sa.Column("video_url", sa.String(1000), nullable=True))
    op.add_column("events", sa.Column("entry_types", postgresql.ARRAY(sa.Text()), nullable=True))
    op.add_column("events", sa.Column("our_guestlist", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("events", sa.Column("our_reservation", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("events", sa.Column("guestlist_closes_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("events", sa.Column("entry_closes_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("events", sa.Column("social_proof_count", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("events", "lineup")
    op.drop_column("events", "gallery")
    op.drop_column("events", "video_url")
    op.drop_column("events", "entry_types")
    op.drop_column("events", "our_guestlist")
    op.drop_column("events", "our_reservation")
    op.drop_column("events", "guestlist_closes_at")
    op.drop_column("events", "entry_closes_at")
    op.drop_column("events", "social_proof_count")
