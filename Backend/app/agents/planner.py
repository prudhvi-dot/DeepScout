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
            "Research question:\n{query}",
        ),
    ]
)

prompt_chain = prompt_template | structured_llm


def Planner(query: str):
    return prompt_chain.invoke({"query": query})
