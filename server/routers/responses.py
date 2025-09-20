import yaml
from pathlib import Path

def load_responses(filename: str):
    responses_dir = Path(__file__).parent.parent / "api_responses"
    with open(responses_dir / filename) as f:
        return yaml.safe_load(f)