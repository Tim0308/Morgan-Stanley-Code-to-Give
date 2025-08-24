# Dockerfile - content microservice (stub)
FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8003

RUN pip install --no-cache-dir fastapi uvicorn pillow || true
COPY . /app
EXPOSE ${PORT}
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
