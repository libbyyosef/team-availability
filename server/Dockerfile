FROM python:3.11-slim

WORKDIR /app

# Build deps (for psycopg etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# ⬇️ requirements.txt is under server/
COPY server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Bring the whole repo in so /app/server exists in the image
COPY . .

# Let 'python -m server.scripts.create_db' work
ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
