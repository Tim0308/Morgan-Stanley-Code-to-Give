# Dockerfile - analytics microservice (stub)
# Purpose: lightweight container to simulate a microservice for analytics
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install a minimal stack (non-fatal if networking is restricted)
RUN pip install --no-cache-dir fastapi uvicorn || true

# Copy service code into container
COPY . /app

EXPOSE ${PORT}

# Default command is a placeholder - replace with actual service entrypoint as needed
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
