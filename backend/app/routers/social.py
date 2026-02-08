from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from datetime import datetime, timezone
from ..core.database import db
from ..core.auth import get_current_user, add_points
from ..models.extras import PostCreate, PostResponse, CommentCreate, CommentResponse, ReactionCreate

router = APIRouter(prefix="/posts", tags=["social"])

@router.post("", response_model=PostResponse)
async def create_post(data: PostCreate, user: dict = Depends(get_current_user)):
    post_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": post_id,
        "content": data.content,
        "post_type": data.post_type,
        "user_id": user["id"],
        "reactions": {"like": 0, "love": 0, "useful": 0, "warning": 0},
        "user_reactions": {},
        "created_at": now
    }
    await db.posts.insert_one(doc)
    await add_points(user["id"], 5, "Publicación creada")

    return PostResponse(
        id=post_id,
        content=data.content,
        post_type=data.post_type,
        user_id=user["id"],
        user_name=user["name"],
        reactions=doc["reactions"],
        comments_count=0,
        created_at=now
    )

@router.get("", response_model=List[PostResponse])
async def get_posts(limit: int = 50, user: dict = Depends(get_current_user)):
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    users = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}

    result = []
    for p in posts:
        comments_count = await db.comments.count_documents({"post_id": p["id"]})
        result.append(PostResponse(
            id=p["id"],
            content=p["content"],
            post_type=p.get("post_type", "update"),
            user_id=p["user_id"],
            user_name=users.get(p["user_id"], "Unknown"),
            reactions=p.get("reactions", {"like": 0, "love": 0, "useful": 0, "warning": 0}),
            comments_count=comments_count,
            created_at=p["created_at"]
        ))
    return result

@router.post("/{post_id}/react")
async def react_to_post(post_id: str, data: ReactionCreate, user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    user_reactions = post.get("user_reactions", {})
    reactions = post.get("reactions", {"like": 0, "love": 0, "useful": 0, "warning": 0})

    previous_reaction = user_reactions.get(user["id"])
    if previous_reaction:
        reactions[previous_reaction] = max(0, reactions.get(previous_reaction, 0) - 1)

    if previous_reaction != data.reaction_type:
        reactions[data.reaction_type] = reactions.get(data.reaction_type, 0) + 1
        user_reactions[user["id"]] = data.reaction_type
    else:
        user_reactions.pop(user["id"], None)

    await db.posts.update_one({"id": post_id}, {"$set": {"reactions": reactions, "user_reactions": user_reactions}})
    return {"reactions": reactions}

@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: str, data: CommentCreate, user: dict = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": comment_id,
        "post_id": post_id,
        "content": data.content,
        "user_id": user["id"],
        "created_at": now
    }
    await db.comments.insert_one(doc)
    await add_points(user["id"], 2, "Comentario añadido")

    return CommentResponse(
        id=comment_id,
        post_id=post_id,
        content=data.content,
        user_id=user["id"],
        user_name=user["name"],
        created_at=now
    )

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str, user: dict = Depends(get_current_user)):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(100)
    users = {u["id"]: u["name"] for u in await db.users.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}

    return [CommentResponse(
        id=c["id"],
        post_id=c["post_id"],
        content=c["content"],
        user_id=c["user_id"],
        user_name=users.get(c["user_id"], "Unknown"),
        created_at=c["created_at"]
    ) for c in comments]
