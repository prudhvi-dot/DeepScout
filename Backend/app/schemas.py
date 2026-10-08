from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr = Field(max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserPrivate(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


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
