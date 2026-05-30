"""add primary_category to venues

Revision ID: 008
Revises: 007
Create Date: 2026-05-30
"""

import sqlalchemy as sa
from alembic import op

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("primary_category", sa.String(), nullable=True))
    op.create_index("ix_venues_primary_category", "venues", ["primary_category"])


def downgrade() -> None:
    op.drop_index("ix_venues_primary_category", table_name="venues")
    op.drop_column("venues", "primary_category")
