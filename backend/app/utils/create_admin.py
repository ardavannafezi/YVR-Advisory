"""Run via Railway shell: python -c "import asyncio; from app.utils.create_admin import create; asyncio.run(create('email@example.com', 'password'))" """
import asyncio

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.utils.security import hash_password


async def create(email: str, password: str) -> None:
    async with AsyncSessionLocal() as session:
        existing = await session.scalar(select(AdminUser).where(AdminUser.email == email))
        if existing:
            print(f"Admin {email} already exists.")
            return
        admin = AdminUser(email=email, hashed_password=hash_password(password))
        session.add(admin)
        await session.commit()
        print(f"Admin {email} created successfully.")


if __name__ == "__main__":
    import sys
    asyncio.run(create(sys.argv[1], sys.argv[2]))
