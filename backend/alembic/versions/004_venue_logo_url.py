"""venue logo url

Revision ID: 004
Revises: 003
Create Date: 2026-05-29
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("logo_url", sa.String(1000), nullable=True))


def downgrade() -> None:
    op.drop_column("venues", "logo_url")
