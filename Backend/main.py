from app.agents.ResearchGraph import research_graph

final_state = research_graph.invoke(
    {
        "query": "What are the effects of climate change on global temperatures and extreme weather events?",
        "iteration": 0,
        "findings": [],
        "critic_result": None,
        "research_gaps": [],
    }
)

print("Final report:")
print(final_state["report"])
