from app.config.config import settings
from app.schemas import ResearchFinding, ResearchTask
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_tavily import TavilySearch

llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)

search_tool = TavilySearch(
    tavily_api_key=settings.TAVILY_API_KEY,
    max_results=8,
)

structured_llm = llm.with_structured_output(ResearchFinding)

research_prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
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

Search results:
{search_results}
""",
        ),
    ]
)

research_chain = research_prompt_template | structured_llm


def Researcher(task: ResearchTask):
    search_results = search_tool.invoke(task.question)

    return research_chain.invoke(
        {
            "question": task.question,
            "objective": task.objective,
            "search_results": search_results,
        }
    )
