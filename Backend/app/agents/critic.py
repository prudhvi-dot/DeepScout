from app.config.config import settings
from app.schemas import CriticResult, ResearchFinding
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=settings.OPENAI_API_KEY,
)

structured_llm = llm.with_structured_output(CriticResult)


critic_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
You are a research critic.

Your job is to evaluate the research findings collected
by multiple research agents.

Compare the findings against the original research question.

Check for:

- Unsupported or questionable claims
- Contradictions between findings
- Important missing information
- Duplicate or irrelevant information
- Whether the collected research is sufficient for a reliable final report

Important rules:

- Do not perform new research.
- Do not write the final report.
- Do not invent information.
- Be conservative when deciding whether research is sufficient.
- Only identify an issue when there is a reasonable basis for it.

Return a structured evaluation.
""",
        ),
        (
            "human",
            """
Original research question:
{query}

Research findings:
{findings}
""",
        ),
    ]
)


critic_chain = critic_prompt | structured_llm


def Critic(
    query: str,
    findings: list[ResearchFinding],
) -> CriticResult:

    return critic_chain.invoke(
        {
            "query": query,
            "findings": findings,
        }
    )
