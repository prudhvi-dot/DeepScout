from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from app.Rag.config import get_vectorstore


@tool
def retrieve_context(query: str, config: RunnableConfig):
    """
    Search the documents uploaded in the current chat thread and return
    relevant information to answer the user's question.

    Use this tool when the user asks a question that requires information
    from their uploaded documents or PDFs.

    Do not use this tool for general knowledge questions that do not depend
    on the user's uploaded documents.

    Args:
        query: The user's question or information to search for.
        config: Runtime configuration containing the current chat thread ID.

    Returns:
        Relevant text extracted from the user's uploaded documents.
    """
    vector_store = get_vectorstore()

    thread_id = config["configurable"]["thread_id"]

    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={
            "namespace": thread_id,
            "k": 5,
            "lambda_mult": 0.25,
        },
    )

    docs = retriever.invoke(query)

    return "\n\n".join(d.page_content for d in docs)
