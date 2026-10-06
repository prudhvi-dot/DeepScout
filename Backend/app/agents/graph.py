from app.agents.researcher import Researcher
from app.schemas import ResearchFinding, ResearchTask
from langgraph.graph import END, START, StateGraph
from typing_extensions import TypedDict


class ResearcherState(TypedDict):
    task: ResearchTask
    finding: ResearchFinding | None


def research(state: ResearcherState):
    finding = Researcher(state["task"])

    return {"finding": finding}


builder = StateGraph(ResearcherState)

builder.add_node("research", research)

builder.add_edge(START, "research")
builder.add_edge("research", END)

researcher_graph = builder.compile()
