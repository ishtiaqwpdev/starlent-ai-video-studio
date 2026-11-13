"""Project data access through Supabase PostgREST.

Every request carries the signed-in user's JWT, so Postgres Row Level Security
decides what the user can see. The service-role key is never used here.
"""
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.auth import CurrentUser
from app.config import Settings


class ProjectService:
    def __init__(self, settings: Settings, user: CurrentUser, transport: httpx.AsyncBaseTransport | None = None):
        self._url = f"{settings.supabase_url}/rest/v1/projects"
        self._user = user
        self._headers = {
            "apikey": settings.supabase_anon_key,
            "Authorization": f"Bearer {user.token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self._transport = transport

    async def _request(self, method: str, **kwargs: Any) -> httpx.Response:
        try:
            async with httpx.AsyncClient(timeout=15, transport=self._transport) as client:
                resp = await client.request(method, self._url, headers=self._headers, **kwargs)
        except httpx.HTTPError:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not reach the database")
        if resp.status_code >= 400:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Database request failed")
        return resp

    async def list(self) -> list[dict]:
        resp = await self._request("GET", params={"select": "*", "order": "updated_at.desc"})
        return resp.json()

    async def get(self, project_id: str) -> dict:
        resp = await self._request("GET", params={"select": "*", "id": f"eq.{project_id}"})
        rows = resp.json()
        if not rows:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
        return rows[0]

    async def create(self, data: dict) -> dict:
        resp = await self._request("POST", json={**data, "user_id": self._user.id})
        return resp.json()[0]

    async def update(self, project_id: str, data: dict) -> dict:
        if not data:
            return await self.get(project_id)
        resp = await self._request("PATCH", params={"id": f"eq.{project_id}"}, json=data)
        rows = resp.json()
        if not rows:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
        return rows[0]

    async def delete(self, project_id: str) -> None:
        resp = await self._request("DELETE", params={"id": f"eq.{project_id}"})
        if not resp.json():
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")
