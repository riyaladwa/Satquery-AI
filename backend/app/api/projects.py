from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Project, Image
from app.schemas.api_schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    results = []
    for p in projects:
        img_count = db.query(Image).filter(Image.project_id == p.id).count()
        results.append(ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            created_at=p.created_at.isoformat() if p.created_at else "",
            image_count=img_count
        ))
    return results

@router.post("", response_model=ProjectResponse)
def create_project(req: ProjectCreate, db: Session = Depends(get_db)):
    proj = Project(name=req.name, description=req.description)
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return ProjectResponse(
        id=proj.id,
        name=proj.name,
        description=proj.description,
        created_at=proj.created_at.isoformat() if proj.created_at else "",
        image_count=0
    )
