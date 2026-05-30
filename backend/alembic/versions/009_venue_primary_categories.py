"""rename primary_category to primary_categories array

Revision ID: 009
Revises: 008
Create Date: 2026-05-30
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "009"
down_revision = "008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_venues_primary_category", table_name="venues")
    op.drop_column("venues", "primary_category")
    op.add_column(
        "venues",
        sa.Column("primary_categories", postgresql.ARRAY(sa.String()), nullable=True),
    )
    op.execute(
        "CREATE INDEX ix_venues_primary_categories ON venues USING gin(primary_categories)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_venues_primary_categories")
    op.drop_column("venues", "primary_categories")
    op.add_column("venues", sa.Column("primary_category", sa.String(), nullable=True))
    op.create_index("ix_venues_primary_category", "venues", ["primary_category"])
