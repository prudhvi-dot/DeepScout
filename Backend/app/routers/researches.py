from typing import Annotated

from app.agents.ResearchGraph import research_graph
from app.auth import CurrentUser
from app.config.database import get_db
from app.models import models
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("")
def get_research_sessions(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    result = db.execute(
        select(models.ResearchSession).where(
            models.ResearchSession.user_id == current_user.id
        )
    )
    research_sessions = result.scalars().all()

    return {"research_sessions": research_sessions}


@router.post("/{research_id}/research")
def research(
    research_id: str,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    topic: Annotated[str | None, Form()] = None,
):

    topic = (topic or "").strip()

    if not topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Send a topic.",
        )

    result = db.execute(
        select(models.ResearchSession).where(
            models.ResearchSession.id == research_id,
            models.ResearchSession.user_id == current_user.id,
        )
    )

    research_session = result.scalars().first()

    if not research_session:
        research_session = models.ResearchSession(
            id=research_id,
            user_id=current_user.id,
            query=topic,
        )
        db.add(research_session)
        db.commit()
        db.refresh(research_session)

    result = research_graph.invoke(
        {
            "query": topic,
            "iteration": 0,
            "findings": [],
            "critic_result": None,
            "research_gaps": [],
        }
    )

    research_report = result["report"]
    research_session.report_content = research_report
    research_session.status = "completed"
    db.commit()

    return {"Report": research_report}


@router.get("/{research_id}/report")
def get_research_report(
    research_id: str,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    result = db.execute(
        select(models.ResearchSession).where(
            models.ResearchSession.id == research_id,
            models.ResearchSession.user_id == current_user.id,
        )
    )

    research_session = result.scalars().first()

    if not research_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research session not found.",
        )

    # if research_session.status != "completed":
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Research session is not completed yet.",
    #     )

    return {"report": research_session}
