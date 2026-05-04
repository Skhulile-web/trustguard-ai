"""In-memory rate limiter. TODO[INTEGRATION]: replace with Redis token bucket."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.core.config import settings

_buckets: dict[str, deque[float]] = defaultdict(deque)


async def rate_limit(request: Request) -> None:
    key = request.client.host if request.client else "anon"
    now = time.time()
    bucket = _buckets[key]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= settings.RATE_LIMIT_PER_MIN:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
    bucket.append(now)
