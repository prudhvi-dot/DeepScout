from pydantic import BaseModel


class ResearchTask(BaseModel):
    # id: str
    question: str
    objective: str


class ResearchPlan(BaseModel):
    tasks: list[ResearchTask]


class Source(BaseModel):
    title: str
    url: str
    relevance: str


class ResearchFinding(BaseModel):
    task_id: str
    summary: str
    key_points: list[str]
    sources: list[Source]


class CriticResult(BaseModel):
    sufficient: bool
    issues: list[str]
    missing_information: list[str]
