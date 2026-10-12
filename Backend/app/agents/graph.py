from typing import Annotated

from app.config.config import settings
from app.schemas import ResearchFinding, ResearchTask
from langchain_core.messages import AnyMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from typing_extensions import TypedDict

search_tool = TavilySearch(
    tavily_api_key=settings.TAVILY_API_KEY,
    max_results=8,
)

llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
llm_with_tools = llm.bind_tools([search_tool])  # for the search loop
structured_llm = llm.with_structured_output(ResearchFinding)  # for the final step

tool_node = ToolNode(tools=[search_tool])


class ResearcherState(TypedDict):
    task: ResearchTask
    messages: Annotated[list[AnyMessage], add_messages]
    finding: ResearchFinding | None


SYSTEM_PROMPT = """
You are a research agent.

Your job is to investigate a specific research task
and produce accurate, evidence-based findings.

Follow these rules:

- Focus only on the assigned research task.
- Use the provided search tool to gather relevant information.
- Prefer reliable and authoritative sources.
- Do not invent facts, sources, or URLs.
- Cross-check important claims when possible.
- Ignore information that is irrelevant to the task.
- Clearly distinguish factual findings from uncertainty.
- Do not write the final research report.
- Return concise, structured findings that another agent
  can use for verification and synthesis.

Research task:
Question: {question}

Objective: {objective}
"""


def _base_messages(task: ResearchTask) -> list[AnyMessage]:
    return [
        SystemMessage(
            SYSTEM_PROMPT.format(question=task.question, objective=task.objective)
        ),
        HumanMessage("Begin the research."),
    ]


def research(state: ResearcherState):
    """Agent step: decide whether to search again or stop."""
    messages = _base_messages(state["task"]) + state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


def finalize(state: ResearcherState):
    """Turn the gathered evidence into a structured ResearchFinding."""
    messages = (
        _base_messages(state["task"])
        + state["messages"]
        + [
            HumanMessage(
                "Using only the evidence gathered above, produce the final "
                "structured finding. Do not add unsupported claims."
            )
        ]
    )
    finding = structured_llm.invoke(messages)
    return {"finding": finding}


builder = StateGraph(ResearcherState)

builder.add_node("research", research)
builder.add_node("tools", tool_node)
builder.add_node("finalize", finalize)

builder.add_edge(START, "research")
builder.add_conditional_edges(
    "research",
    tools_condition,
    {"tools": "tools", END: "finalize"},
)
builder.add_edge("tools", "research")
builder.add_edge("finalize", END)

researcher_graph = builder.compile()
