from typing import Annotated

from app.agent.agent import chatbot
from app.auth import CurrentUser
from app.config.database import get_db
from app.models import models
from app.Rag.ingestion import ingest
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from langchain_core.messages import HumanMessage
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_chat(current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    new_chat = models.Chat(user_id=current_user.id, title="New Chat")
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return {"chat_id": new_chat.id}


@router.get("/", status_code=status.HTTP_200_OK)
def get_all_chats(current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    return current_user.chats


@router.get("/{chat_id}/messages", status_code=status.HTTP_200_OK)
def get_chat_messages(
    chat_id: str, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]
):

    result = db.execute(select(models.Message).where(models.Message.chat_id == chat_id))
    messages = result.scalars().all()
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )
    return messages


@router.delete("/{chat_id}", status_code=status.HTTP_200_OK)
def delete_chat(
    chat_id: str, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]
):
    result = db.execute(select(models.Chat).where(models.Chat.id == chat_id))
    chat = result.scalars().first()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )

    if not chat.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="you are not Authorized to access this chat",
        )

    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully"}


@router.post("/{chat_id}/send", status_code=status.HTTP_200_OK)
def send_message(
    chat_id: str,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    message: Annotated[str, Form()],
    file: Annotated[UploadFile | None, File()] = None,
):

    result = db.execute(select(models.Chat).where(models.Chat.id == chat_id))
    chat = result.scalars().first()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found"
        )

    if not chat.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="you are not Authorized to access this chat",
        )

    if file:
        file_bytes = file.file.read()

        ingest(file_bytes, chat_id)

    new_message = models.Message(chat_id=chat_id, role="human", message=message)

    result = chatbot.invoke(
        {"messages": [HumanMessage(content=message)]},
        config={"configurable": {"thread_id": chat_id}},
    )

    ai_message = result["messages"][-1].content

    new_message_ai = models.Message(chat_id=chat_id, role="ai", message=ai_message)

    db.add_all([new_message, new_message_ai])
    db.commit()

    return {"ai_message": ai_message}
