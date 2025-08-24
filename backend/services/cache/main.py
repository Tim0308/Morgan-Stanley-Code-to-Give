from fastapi import FastAPI
import aioredis
import os

app = FastAPI()

REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")

@app.on_event("startup")
async def startup_event():
    # create a connection pool (mock - not fully integrated elsewhere)
    app.state.redis = await aioredis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)

@app.on_event("shutdown")
async def shutdown_event():
    try:
        await app.state.redis.close()
    except Exception:
        pass

@app.get("/health")
async def health():
    try:
        pong = await app.state.redis.ping()
        return {"redis": pong}
    except Exception as e:
        return {"redis_error": str(e)}

@app.get("/cache/set")
async def cache_set(key: str, value: str):
    await app.state.redis.set(key, value)
    return {"ok": True}

@app.get("/cache/get")
async def cache_get(key: str):
    val = await app.state.redis.get(key)
    return {"value": val}
