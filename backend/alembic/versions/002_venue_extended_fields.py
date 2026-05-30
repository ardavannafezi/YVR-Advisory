"""venue extended fields

Revision ID: 002
Revises: 001
Create Date: 2026-05-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("venues", sa.Column("phone", sa.String(50)))
    op.add_column("venues", sa.Column("primary_nights", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"))
    op.add_column("venues", sa.Column("hours", postgresql.JSONB()))
    op.add_column("venues", sa.Column("special_nights", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"))
    op.add_column("venues", sa.Column("price_tier", sa.String(10)))
    op.add_column("venues", sa.Column("cover_charge_info", sa.String(500)))
    op.add_column("venues", sa.Column("bottle_minimum", sa.Integer()))
    op.add_column("venues", sa.Column("dress_code", sa.String(200)))
    op.add_column("venues", sa.Column("age_restriction", sa.Integer()))
    op.add_column("venues", sa.Column("hospitality_company", sa.String(200)))
    op.add_column("venues", sa.Column("reservation_link", sa.String(1000)))


def downgrade() -> None:
    op.drop_column("venues", "phone")
    op.drop_column("venues", "primary_nights")
    op.drop_column("venues", "hours")
    op.drop_column("venues", "special_nights")
    op.drop_column("venues", "price_tier")
    op.drop_column("venues", "cover_charge_info")
    op.drop_column("venues", "bottle_minimum")
    op.drop_column("venues", "dress_code")
    op.drop_column("venues", "age_restriction")
    op.drop_column("venues", "hospitality_company")
    op.drop_column("venues", "reservation_link")
