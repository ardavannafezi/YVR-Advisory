"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "venues",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False, unique=True),
        sa.Column("slug", sa.String(220), nullable=False, unique=True),
        sa.Column("description", sa.Text()),
        sa.Column("address", sa.String(500)),
        sa.Column("neighbourhood", sa.String(100)),
        sa.Column("music_types", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("vibe_tags", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("capacity", sa.Integer()),
        sa.Column("image_url", sa.String(1000)),
        sa.Column("website_url", sa.String(1000)),
        sa.Column("instagram_url", sa.String(1000)),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_venues_name", "venues", ["name"])
    op.create_index("ix_venues_slug", "venues", ["slug"])

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(300), nullable=False),
        sa.Column("slug", sa.String(320), nullable=False, unique=True),
        sa.Column("venue_id", sa.Integer(), sa.ForeignKey("venues.id")),
        sa.Column("date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("category", sa.String(100)),
        sa.Column("music_type", sa.String(100)),
        sa.Column("description", sa.Text()),
        sa.Column("image_url", sa.String(1000)),
        sa.Column("ticket_url", sa.String(1000)),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("source", sa.String(50), nullable=False, server_default="manual"),
        sa.Column("external_id", sa.String(200)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_events_name", "events", ["name"])
    op.create_index("ix_events_slug", "events", ["slug"])
    op.create_index("ix_events_music_type", "events", ["music_type"])
    op.create_index("ix_events_external_id", "events", ["external_id"])
    op.create_index("ix_events_venue_id", "events", ["venue_id"])

    op.create_table(
        "blog_posts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("slug", sa.String(520), nullable=False, unique=True),
        sa.Column("summary", sa.String(300)),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("cover_image_url", sa.String(1000)),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("music_type", sa.String(100)),
        sa.Column("author", sa.String(200)),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_blog_posts_slug", "blog_posts", ["slug"])

    op.create_table(
        "guestlist_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("full_name", sa.String(300), nullable=False),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="SET NULL")),
        sa.Column("venue_id", sa.Integer(), sa.ForeignKey("venues.id", ondelete="SET NULL")),
        sa.Column("music_type", sa.String(100)),
        sa.Column("party_size", sa.Integer()),
        sa.Column("source_page", sa.String(200)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_guestlist_entries_email", "guestlist_entries", ["email"])

    op.create_table(
        "table_reservations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("full_name", sa.String(300), nullable=False),
        sa.Column("phone", sa.String(50)),
        sa.Column("venue_id", sa.Integer(), sa.ForeignKey("venues.id", ondelete="SET NULL")),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="SET NULL")),
        sa.Column("date_requested", sa.DateTime(timezone=True)),
        sa.Column("party_size", sa.Integer(), nullable=False),
        sa.Column("occasion", sa.String(200)),
        sa.Column("preferences", sa.Text()),
        sa.Column("budget_range", sa.String(100)),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_table_reservations_email", "table_reservations", ["email"])

    op.create_table(
        "user_preferences",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.String(128), nullable=False, unique=True),
        sa.Column("email", sa.String(320)),
        sa.Column("music_types_viewed", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("venue_types_viewed", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("venue_names_viewed", postgresql.ARRAY(sa.String()), nullable=False, server_default="{}"),
        sa.Column("quiz_answers", postgresql.JSON()),
        sa.Column("last_seen", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_user_preferences_session_id", "user_preferences", ["session_id"])
    op.create_index("ix_user_preferences_email", "user_preferences", ["email"])

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(256), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_admin_users_email", "admin_users", ["email"])


def downgrade() -> None:
    op.drop_table("admin_users")
    op.drop_table("user_preferences")
    op.drop_table("table_reservations")
    op.drop_table("guestlist_entries")
    op.drop_table("blog_posts")
    op.drop_table("events")
    op.drop_table("venues")
