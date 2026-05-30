"""venue maps gallery faq

Revision ID: 003
Revises: 002
Create Date: 2026-05-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("establishment_type", sa.String(100)))
    op.add_column("venues", sa.Column("gallery_urls", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"))
    op.add_column("venues", sa.Column("latitude", sa.Float()))
    op.add_column("venues", sa.Column("longitude", sa.Float()))
    op.add_column("venues", sa.Column("faqs", postgresql.JSONB()))


def downgrade() -> None:
    op.drop_column("venues", "establishment_type")
    op.drop_column("venues", "gallery_urls")
    op.drop_column("venues", "latitude")
    op.drop_column("venues", "longitude")
    op.drop_column("venues", "faqs")
