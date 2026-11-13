from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient

from app.auth import CurrentUser, get_current_user
from app.main import app
from app.routers.projects import get_service

USER = "11111111-1111-1111-1111-111111111111"
PID = "22222222-2222-2222-2222-222222222222"
NOW = datetime.now(timezone.utc).isoformat()


class FakeService:
    """In-memory stand-in for ProjectService. Tests routing/validation, not Supabase."""

    def __init__(self):
        self.rows = {}

    def _row(self, data, pid=PID):
        return {"id": pid, "user_id": USER, "description": None, "status": "draft",
                "created_at": NOW, "updated_at": NOW, **data}

    async def list(self):
        return list(self.rows.values())

    async def get(self, pid):
        from fastapi import HTTPException
        if pid not in self.rows:
            raise HTTPException(404, "Project not found")
        return self.rows[pid]

    async def create(self, data):
        self.rows[PID] = self._row(data)
        return self.rows[PID]

    async def update(self, pid, data):
        row = await self.get(pid)
        row.update(data)
        return row

    async def delete(self, pid):
        await self.get(pid)
        del self.rows[pid]


@pytest.fixture
def client():
    svc = FakeService()
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id=USER, token="t")
    app.dependency_overrides[get_service] = lambda: svc
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health():
    assert TestClient(app).get("/health").json() == {"status": "ok"}


def test_requires_auth():
    assert TestClient(app).get("/api/projects").status_code == 401


def test_crud_flow(client):
    body = {"title": "  Launch teaser ", "video_type": "youtube_short", "aspect_ratio": "9:16"}
    r = client.post("/api/projects", json=body)
    assert r.status_code == 201 and r.json()["title"] == "Launch teaser"
    assert len(client.get("/api/projects").json()) == 1
    assert client.get(f"/api/projects/{PID}").status_code == 200
    r = client.patch(f"/api/projects/{PID}", json={"status": "in_progress"})
    assert r.json()["status"] == "in_progress"
    assert client.delete(f"/api/projects/{PID}").status_code == 204
    assert client.get(f"/api/projects/{PID}").status_code == 404


@pytest.mark.parametrize("body", [
    {"title": "   ", "video_type": "tiktok", "aspect_ratio": "9:16"},
    {"title": "x", "video_type": "nope", "aspect_ratio": "9:16"},
    {"title": "x", "video_type": "tiktok", "aspect_ratio": "4:3"},
    {"video_type": "tiktok", "aspect_ratio": "9:16"},
])
def test_validation(client, body):
    assert client.post("/api/projects", json=body).status_code == 422


def test_bad_uuid(client):
    assert client.get("/api/projects/not-a-uuid").status_code == 422


@pytest.mark.asyncio
async def test_service_uses_user_jwt_and_sets_owner():
    import httpx
    from app.config import get_settings
    from app.services.projects import ProjectService

    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["auth"] = request.headers["authorization"]
        seen["body"] = request.content.decode()
        return httpx.Response(201, json=[{"id": PID}])

    svc = ProjectService(get_settings(), CurrentUser(id=USER, token="user-jwt"), httpx.MockTransport(handler))
    await svc.create({"title": "x"})
    assert seen["auth"] == "Bearer user-jwt"
    assert USER in seen["body"]
