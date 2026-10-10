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
        select(
            models.ResearchSession.id,
            models.ResearchSession.title,
            models.ResearchSession.query,
            models.ResearchSession.status,
            models.ResearchSession.created_at,
            models.ResearchSession.updated_at,
        ).where(models.ResearchSession.user_id == current_user.id)
    )

    research_sessions = result.mappings().all()

    return {"research_sessions": research_sessions}


import json
import logging
from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Form, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


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
            title=topic,
            status="in_progress",
        )
        db.add(research_session)
    else:
        research_session.query = topic
        research_session.title = topic
        research_session.status = "in_progress"

    db.commit()
    db.refresh(research_session)

    def generate() -> Iterator[str]:
        try:
            yield (
                json.dumps(
                    {
                        "type": "status",
                        "message": "Research started",
                    }
                )
                + "\n"
            )

            final_report = None

            for chunk in research_graph.stream(
                {
                    "query": topic,
                    "iteration": 0,
                    "findings": [],
                    "critic_result": None,
                    "research_gaps": [],
                },
                stream_mode="updates",
            ):
                for node_name, node_output in chunk.items():
                    yield (
                        json.dumps(
                            {
                                "type": "status",
                                "message": f"Completed step: {node_name}",
                            }
                        )
                        + "\n"
                    )

                    if isinstance(node_output, dict) and node_output.get("report"):
                        final_report = node_output["report"]

            if not final_report:
                raise RuntimeError("Research graph did not produce a report.")

            research_session.report_content = final_report
            research_session.status = "completed"

            db.commit()

            yield (
                json.dumps(
                    {
                        "type": "final",
                        "report": final_report,
                    }
                )
                + "\n"
            )

        except Exception:
            logger.exception(
                "Research failed for session %s",
                research_id,
            )

            db.rollback()

            try:
                research_session.status = "failed"
                db.commit()
            except Exception:
                db.rollback()

            yield (
                json.dumps(
                    {
                        "type": "error",
                        "message": "Research failed. Please try again.",
                    }
                )
                + "\n"
            )

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


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


@router.delete("/{research_id}")
def delete_research_session(
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

    db.delete(research_session)
    db.commit()

    return {"message": "Research session deleted successfully."}
