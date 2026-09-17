"""
Gaming Portal – Auth Routes
POST /auth/register       – create a new user account
POST /auth/login          – return a JWT access token (OAuth2 password flow)
GET  /auth/me             – return the current user's profile
PATCH /auth/me            – update display_name / avatar_emoji
POST /auth/me/avatar      – upload a profile photo (multipart); broadcasts WS event
"""
import os
import shutil
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from auth import create_access_token, hash_password, verify_password
from database import get_session
from dependencies import get_current_user
from models import CoinAdjust, User, UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

RENAME_COST = 60

# Allowed image MIME types
_ALLOWED = {"image/jpeg", "image/png", "image/gif", "image/webp"}
_EXT_MAP  = {"image/jpeg": ".jpg", "image/png": ".png", "image/gif": ".gif", "image/webp": ".webp"}


# ─── Register ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserRead, status_code=201)
def register(body: UserCreate, session: Session = Depends(get_session)):
    """Create a new user. Raises 409 if the username is already taken."""
    existing = session.exec(select(User).where(User.username == body.username)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = User(
        username=body.username,
        display_name=body.display_name or body.username,
        avatar_emoji=body.avatar_emoji,
        hashed_password=hash_password(body.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# ─── Login (OAuth2 password flow) ────────────────────────────────────────────

@router.post("/login")
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session),
):
    """Return a Bearer JWT token on successful credentials."""
    user = session.exec(select(User).where(User.username == form.username)).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


# ─── Current user ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update display_name or avatar_emoji. Renaming costs 60 coins."""
    if body.display_name is not None:
        trimmed = body.display_name.strip()
        if not trimmed:
            raise HTTPException(status_code=400, detail="Display name cannot be empty")
        # Check if actually renaming to a different name
        if trimmed != current_user.display_name and trimmed != current_user.username:
            if (current_user.coins or 0) < RENAME_COST:
                raise HTTPException(
                    status_code=400,
                    detail=f"Renaming costs {RENAME_COST} coins — you only have {current_user.coins or 0}",
                )
            current_user.coins = (current_user.coins or 0) - RENAME_COST
            current_user.display_name = trimmed
        else:
            current_user.display_name = trimmed

    if body.avatar_emoji is not None:
        current_user.avatar_emoji = body.avatar_emoji
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    try:
        from main import manager
        await manager.broadcast({
            "type": "profile_update",
            "user_id": current_user.id,
            "display_name": current_user.display_name,
            "coins": current_user.coins,
            "avatar_url": current_user.avatar_url,
        })
    except Exception:
        pass

    return current_user


@router.post("/me/coins", response_model=UserRead)
async def adjust_coins(
    body: CoinAdjust,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Adjust current user coins in the database (+ to increase, - to decrease)."""
    new_coins = (current_user.coins or 0) + body.amount
    if new_coins < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient coins. Cannot deduct {-body.amount} from balance of {current_user.coins or 0}",
        )
    current_user.coins = new_coins
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    try:
        from main import manager
        await manager.broadcast({
            "type": "profile_update",
            "user_id": current_user.id,
            "coins": current_user.coins,
        })
    except Exception:
        pass

    return current_user


# ─── Avatar upload ────────────────────────────────────────────────────────────

@router.post("/me/avatar", response_model=UserRead)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Accept a multipart image upload, save it under uploads/{user_id}{ext},
    persist the URL on the user, and broadcast a WebSocket profile_update event.
    """
    # Validate content type
    content_type = file.content_type or ""
    if content_type not in _ALLOWED:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{content_type}'. Use JPEG, PNG, GIF, or WebP.",
        )

    ext = _EXT_MAP[content_type]

    # Resolve upload directory relative to this file's location
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Remove any old avatar files for this user (different extension)
    for old in os.listdir(upload_dir):
        if old.startswith(f"{current_user.id}."):
            os.remove(os.path.join(upload_dir, old))

    filename = f"{current_user.id}{ext}"
    dest = os.path.join(upload_dir, filename)

    with open(dest, "wb") as out:
        shutil.copyfileobj(file.file, out)

    # Persist URL (relative path served by StaticFiles)
    avatar_url = f"http://localhost:8000/uploads/{filename}"
    current_user.avatar_url = avatar_url
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    # Broadcast the update to all connected WebSocket clients
    try:
        from main import manager
        await manager.broadcast({
            "type": "profile_update",
            "user_id": current_user.id,
            "avatar_url": avatar_url,
        })
    except Exception:
        pass  # Never fail the HTTP response because of a WS issue

    return current_user
