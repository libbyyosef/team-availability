from sqlalchemy.orm import declarative_base
from sqlalchemy.inspection import inspect
from datetime import datetime

class BaseModel:
    def to_dict(self):
        result = {}
        for c in inspect(self).mapper.column_attrs:
            value = getattr(self, c.key)
            if isinstance(value, datetime):
                result[c.key] = value.isoformat()
            else:
                result[c.key] = value
        return result

Base = declarative_base(cls=BaseModel)

