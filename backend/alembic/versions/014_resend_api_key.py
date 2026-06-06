"""switch email from SMTP to Resend

Revision ID: 014
Revises: 013
Create Date: 2026-06-05
"""
from alembic import op
import sqlalchemy as sa

revision = "014"
down_revision = "013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("notification_settings", sa.Column("resend_api_key", sa.String(), nullable=True))
    op.drop_column("notification_settings", "smtp_host")
    op.drop_column("notification_settings", "smtp_port")
    op.drop_column("notification_settings", "smtp_user")
    op.drop_column("notification_settings", "smtp_password")


def downgrade() -> None:
    op.add_column("notification_settings", sa.Column("smtp_password", sa.String(), nullable=True))
    op.add_column("notification_settings", sa.Column("smtp_user", sa.String(), nullable=True))
    op.add_column("notification_settings", sa.Column("smtp_port", sa.Integer(), nullable=True))
    op.add_column("notification_settings", sa.Column("smtp_host", sa.String(), nullable=True))
    op.drop_column("notification_settings", "resend_api_key")
