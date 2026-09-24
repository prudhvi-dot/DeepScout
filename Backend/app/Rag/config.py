from functools import lru_cache

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

from app.config.config import settings

load_dotenv()


@lru_cache
def get_embedding_model():
    return OpenAIEmbeddings(
        model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY
    )


@lru_cache
def get_pinecone_index():
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    index = pc.Index("deepscout")
    return index


@lru_cache
def get_vectorstore():
    vector_store = PineconeVectorStore(
        index=get_pinecone_index(), embedding=get_embedding_model()
    )
    return vector_store
