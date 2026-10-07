from app.config.config import settings
from app.schemas import ResearchPlan
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)

structured_llm = llm.with_structured_output(ResearchPlan)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a research planning agent.

Your job is to break a complex research question
into independent research tasks.

You may or may not receive research gaps from a
previous research iteration.

If research gaps are provided:
- Prioritize the research gaps when creating tasks.
- Create tasks specifically designed to investigate
  and fill those gaps.
- Avoid repeating research that does not address the gaps.
- Ensure the tasks collectively cover the missing information.

If no research gaps are provided:
- Create a broad and comprehensive initial research plan
  based on the research question.
- Break the question into independent research tasks
  covering the important aspects needed for the final report.

Each task should:
- investigate a specific aspect of the question
- have a clear objective
- be independently researchable
- contribute meaningful information to the final report

Do not perform the research yourself.
Do not provide the final answer.
Only create the research plan.
""",
        ),
        (
            "human",
            """
Research question:
{query}

Research gaps from previous iterations:
{research_gaps}
""",
        ),
    ]
)

prompt_chain = prompt_template | structured_llm


def Planner(query: str, research_gaps: list[str] = None):  # noqa: RUF013
    return prompt_chain.invoke({"query": query, "research_gaps": research_gaps})
