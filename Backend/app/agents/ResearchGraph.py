import operator
from typing import Annotated

from app.agents.graph import researcher_graph
from app.agents.planner import Planner
from app.config.config import settings
from app.schemas import ResearchFinding, ResearchTask
from langchain_openai import ChatOpenAI
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class ResearchState(TypedDict):
    query: str
    tasks: list[ResearchTask]
    findings: Annotated[list[ResearchFinding], operator.add]


llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=settings.OPENAI_API_KEY,
)

planner = Planner


def plan_research(state: ResearchState):
    plan = Planner(state["query"])

    return {"tasks": plan.tasks}


def dispatch_research(state: ResearchState):
    return [
        Send(
            "research",
            {
                "task": task,
                "finding": None,
            },
        )
        for task in state["tasks"]
    ]


def research(state):
    result = researcher_graph.invoke(state)

    return {"findings": [result["finding"]]}


builder = StateGraph(ResearchState)

builder.add_node("planner", plan_research)
builder.add_node("research", research)

builder.add_edge(START, "planner")

builder.add_conditional_edges(
    "planner",
    dispatch_research,
)

builder.add_edge("research", END)

research_graph = builder.compile()
