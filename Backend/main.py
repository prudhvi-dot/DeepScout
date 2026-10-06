from app.agents.ResearchGraph import research_graph
from app.schemas import ResearchTask

task = ResearchTask(
    question="What is the impact of climate change on polar bear populations in the Arctic region?",
    objective="To understand how climate change affects polar bear populations, including their habitat, food sources, and overall survival.",
)

result = research_graph.invoke(
    {"query": task.question, "tasks": [task], "findings": []}
)

print(result["findings"])
