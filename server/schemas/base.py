from __future__ import annotations
from pydantic import BaseModel

class AppModel(BaseModel):
    """Project-wide Pydantic v2 base with sensible defaults."""
    model_config = {
        "extra": "forbid",             # reject unknown fields
        "str_strip_whitespace": True,  # auto-trim string fields
        "validate_assignment": True,   # re-validate on attribute assignment
        "from_attributes": False,      # opt-in per model that needs ORM support
    }
