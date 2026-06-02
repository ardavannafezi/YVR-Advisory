"""blog_posts: add external_id for n8n upsert

Revision ID: 011
Revises: 010
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa

revision = "011"
down_revision = "010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("blog_posts", sa.Column("external_id", sa.String(500), nullable=True))
    op.create_index("ix_blog_posts_external_id", "blog_posts", ["external_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_blog_posts_external_id", table_name="blog_posts")
    op.drop_column("blog_posts", "external_id")
