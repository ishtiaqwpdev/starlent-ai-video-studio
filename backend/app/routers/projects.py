from uuid import UUID

from fastapi import APIRouter, Depends, Response, status

from app.auth import CurrentUser, get_current_user
from app.config import Settings, get_settings
from app.schemas import ProjectCreate, ProjectOut, ProjectUpdate
from app.services.projects import ProjectService

router = APIRouter(prefix="/api/projects", tags=["projects"])


def get_service(
    user: CurrentUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> ProjectService:
    return ProjectService(settings, user)


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(body: ProjectCreate, svc: ProjectService = Depends(get_service)):
    return await svc.create(body.model_dump(mode="json"))


@router.get("", response_model=list[ProjectOut])
async def list_projects(svc: ProjectService = Depends(get_service)):
    return await svc.list()


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: UUID, svc: ProjectService = Depends(get_service)):
    return await svc.get(str(project_id))


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: UUID, body: ProjectUpdate, svc: ProjectService = Depends(get_service)):
    return await svc.update(str(project_id), body.model_dump(mode="json", exclude_unset=True))


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: UUID, svc: ProjectService = Depends(get_service)):
    await svc.delete(str(project_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
