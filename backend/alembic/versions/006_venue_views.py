"""venue views table

Revision ID: 006
Revises: 005
Create Date: 2026-05-29
"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "venue_views",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "venue_id",
            sa.Integer(),
            sa.ForeignKey("venues.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("view_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_venue_views_venue_id", "venue_views", ["venue_id"])


def downgrade() -> None:
    op.drop_index("ix_venue_views_venue_id", table_name="venue_views")
    op.drop_table("venue_views")
