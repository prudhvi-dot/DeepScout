import operator
from typing import Annotated

from app.agents.critic import Critic
from app.agents.graph import researcher_graph
from app.agents.planner import Planner
from app.config.config import settings
from app.schemas import CriticResult, ResearchFinding, ResearchTask
from langchain_openai import ChatOpenAI
from langgraph.constants import Send
from langgraph.graph import END, START, StateGraph
from app.agents.synthesizer import Synthesizer
from typing_extensions import TypedDict


class ResearchState(TypedDict):
    query: str
    tasks: list[ResearchTask]
    findings: Annotated[list[ResearchFinding], operator.add]
    critic_result: CriticResult | None
    research_gaps: list[str]
    iteration: int
    report: str | None


llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=settings.OPENAI_API_KEY,
)

planner = Planner


def plan_research(state: ResearchState):
    print("Planning")
    plan = Planner(state["query"], state["research_gaps"])

    return {"tasks": plan.tasks}


def dispatch_research(state: ResearchState):
    print("Dispatching research")
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


def critic_node(state: ResearchState):
    print("Critiquing")

    result = Critic(
        state["query"],
        state["findings"],
    )

    return {
        "critic_result": result,
        "research_gaps": result.missing_information,
    }


def route_after_critic(state: ResearchState):
    if state["critic_result"].sufficient or state["iteration"] >= 2:
        return "synthesizer"

    return "rewrite_query"


def rewrite_query(state: ResearchState):
    print("Preparing next research iteration")

    return {
        "iteration": state["iteration"] + 1,
    }


def synthesizer_node(state: ResearchState):
    print("Synthesizing final report")

    report = Synthesizer(
        state["query"],
        state["findings"],
    )

    return {"report": report}


def research(state):
    print("Conducting research")
    result = researcher_graph.invoke(state)

    return {"findings": [result["finding"]]}


builder = StateGraph(ResearchState)

builder.add_node("planner", plan_research)
builder.add_node("research", research)
builder.add_node("critic", critic_node)
builder.add_node("rewrite_query", rewrite_query)
builder.add_node("synthesizer", synthesizer_node)

builder.add_edge(START, "planner")

builder.add_conditional_edges(
    "planner",
    dispatch_research,
)

builder.add_edge("research", "critic")
builder.add_conditional_edges(
    "critic",
    route_after_critic,
)
builder.add_edge("rewrite_query", "planner")
builder.add_edge("synthesizer", END)
research_graph = builder.compile()
