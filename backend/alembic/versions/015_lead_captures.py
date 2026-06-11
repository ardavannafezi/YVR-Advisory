"""add lead_captures table

Revision ID: 015
Revises: 014
Create Date: 2026-06-10
"""
from alembic import op
import sqlalchemy as sa

revision = "015"
down_revision = "014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "lead_captures",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("email", sa.String(320), nullable=False, index=True),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("venue_name", sa.String(300), nullable=True),
        sa.Column("venue_type", sa.String(100), nullable=True),
        sa.Column("music_type", sa.String(100), nullable=True),
        sa.Column("event_name", sa.String(300), nullable=True),
        sa.Column("redirect_url", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("lead_captures")
