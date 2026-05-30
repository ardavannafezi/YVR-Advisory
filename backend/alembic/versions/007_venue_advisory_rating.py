"""venue advisory rating table

Revision ID: 007
Revises: 006
Create Date: 2026-05-29
"""

import sqlalchemy as sa
from alembic import op

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "venue_advisory_ratings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "venue_id",
            sa.Integer(),
            sa.ForeignKey("venues.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("rating", sa.Numeric(precision=4, scale=1), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_venue_advisory_ratings_venue_id",
        "venue_advisory_ratings",
        ["venue_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_venue_advisory_ratings_venue_id",
        table_name="venue_advisory_ratings",
    )
    op.drop_table("venue_advisory_ratings")
