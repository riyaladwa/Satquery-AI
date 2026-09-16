import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import (
    Project,
    Image,
    AnalysisSession,
    AnalysisResult,
    QueryLog,
    Report,
    ProjectCollaborator,
    ProjectActivity
)

router = APIRouter(prefix="/projects", tags=["projects"])

# Request / Response Schemas
class ProjectCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    satellite_data: Optional[str] = "Sentinel-2 MSI"
    period: Optional[str] = "2023 → 2026"
    aoi: Optional[str] = "Selected Region"
    owner_name: Optional[str] = "Project Owner"
    owner_email: Optional[str] = "owner@satquery.ai"

class ProjectUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    satellite_data: Optional[str] = None
    period: Optional[str] = None
    aoi: Optional[str] = None

class AddCollaboratorRequest(BaseModel):
    email: str
    name: Optional[str] = None
    role: str = "collaborator"  # owner, collaborator, viewer
    added_by: Optional[str] = "Project Owner"

class SaveAnalysisRequest(BaseModel):
    session_id: str
    title: Optional[str] = None
    added_by: Optional[str] = "Analyst"

class RecordActivityRequest(BaseModel):
    user_name: str = "Analyst"
    action: str
    details: Optional[str] = None

@router.get("")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    results = []

    # Pre-seed default projects if table is empty
    if not projects:
        default_p1 = Project(name="Urban Expansion Study", description="Tracking residential and road infrastructure expansion across eastern growth corridors.")
        default_p2 = Project(name="Civic Flood Investigation", description="Multi-temporal radar flood inundation and reservoir monitoring using Sentinel-1 C-SAR.")
        default_p3 = Project(name="Agriculture Monitoring", description="Crop canopy vigor and irrigation health tracking using NDVI vegetation anomalies.")
        db.add_all([default_p1, default_p2, default_p3])
        db.commit()
        db.refresh(default_p1)
        db.refresh(default_p2)
        db.refresh(default_p3)

        # Seed initial activities
        db.add(ProjectActivity(project_id=default_p1.id, user_name="Riya", action="Created urban growth study", details="Linked Sentinel-2 baseline and 2026 observation"))
        db.add(ProjectActivity(project_id=default_p1.id, user_name="Rahul", action="Added difference comparison", details="Identified 184 new built-up structures"))
        db.add(ProjectActivity(project_id=default_p1.id, user_name="Ananya", action="Generated intelligence report", details="Compiled official summary PDF"))

        db.add(ProjectCollaborator(project_id=default_p1.id, user_email="riya@satquery.ai", user_name="Riya", role="owner"))
        db.add(ProjectCollaborator(project_id=default_p1.id, user_email="rahul@satquery.ai", user_name="Rahul", role="collaborator"))
        db.add(ProjectCollaborator(project_id=default_p1.id, user_email="ananya@satquery.ai", user_name="Ananya", role="collaborator"))

        db.commit()
        projects = [default_p1, default_p2, default_p3]

    for p in projects:
        img_count = db.query(Image).filter(Image.project_id == p.id).count()
        sess_count = db.query(AnalysisSession).filter(AnalysisSession.project_id == p.id).count()
        collab_count = db.query(ProjectCollaborator).filter(ProjectCollaborator.project_id == p.id).count()
        if collab_count == 0:
            collab_count = 1  # At least the owner

        results.append({
            "id": p.id,
            "name": p.name,
            "description": p.description or "Satellite Earth observation and change monitoring study.",
            "created_at": p.created_at.isoformat() if p.created_at else datetime.utcnow().isoformat(),
            "updated_at": p.updated_at.isoformat() if p.updated_at else datetime.utcnow().isoformat(),
            "image_count": img_count,
            "analysis_count": sess_count,
            "collaborator_count": collab_count,
            "satellite_data": "Sentinel-2 MSI (10m)" if "Urban" in p.name else "Sentinel-1 C-SAR / Sentinel-2",
            "period": "2023 → 2026",
            "aoi": "Dublin Urban Region" if "Urban" in p.name else "Karnataka / Coastal Zone",
            "status": "Active"
        })
    return results

@router.post("")
def create_project(req: ProjectCreateRequest, db: Session = Depends(get_db)):
    proj = Project(name=req.name, description=req.description)
    db.add(proj)
    db.commit()
    db.refresh(proj)

    # Add owner collaborator
    owner = ProjectCollaborator(
        project_id=proj.id,
        user_email=req.owner_email or "owner@satquery.ai",
        user_name=req.owner_name or "Project Owner",
        role="owner"
    )
    db.add(owner)

    # Add initial activity
    act = ProjectActivity(
        project_id=proj.id,
        user_name=req.owner_name or "Project Owner",
        action="Created project",
        details=f"Initialized study: {req.name}"
    )
    db.add(act)
    db.commit()

    return {
        "id": proj.id,
        "name": proj.name,
        "description": proj.description,
        "created_at": proj.created_at.isoformat() if proj.created_at else datetime.utcnow().isoformat(),
        "image_count": 0,
        "analysis_count": 0,
        "collaborator_count": 1,
        "satellite_data": req.satellite_data or "Sentinel-2 MSI",
        "period": req.period or "2023 → 2026",
        "aoi": req.aoi or "Selected AOI",
        "status": "Active"
    }

@router.get("/{project_id}")
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    # Associated images
    images = db.query(Image).filter(Image.project_id == proj.id).all()
    img_list = [{
        "id": img.id,
        "filename": img.filename,
        "modality": img.modality,
        "sensor": img.sensor,
        "acquisition_date": img.acquisition_date,
        "preview_url": img.preview_path
    } for img in images]

    # Associated analysis sessions
    sessions = db.query(AnalysisSession).filter(AnalysisSession.project_id == proj.id).all()
    sess_list = []
    for s in sessions:
        latest_res = db.query(AnalysisResult).filter(AnalysisResult.session_id == s.id).order_by(AnalysisResult.created_at.desc()).first()
        sess_list.append({
            "id": s.id,
            "title": s.title,
            "analysis_type": s.analysis_type,
            "created_at": s.created_at.isoformat() if s.created_at else "",
            "summary": latest_res.answer_text if latest_res else "Analysis recorded",
            "confidence": latest_res.confidence_score if latest_res else 90.0,
            "model_name": latest_res.model_name if latest_res else "SatQuery RS-VLM"
        })

    # Collaborators
    collabs = db.query(ProjectCollaborator).filter(ProjectCollaborator.project_id == proj.id).all()
    if not collabs:
        # Default owner
        collabs_list = [{
            "id": 1,
            "user_email": "owner@satquery.ai",
            "user_name": "Project Owner",
            "role": "owner",
            "created_at": proj.created_at.isoformat() if proj.created_at else ""
        }]
    else:
        collabs_list = [{
            "id": c.id,
            "user_email": c.user_email,
            "user_name": c.user_name or c.user_email.split("@")[0],
            "role": c.role,
            "created_at": c.created_at.isoformat() if c.created_at else ""
        } for c in collabs]

    # Activities
    activities = db.query(ProjectActivity).filter(ProjectActivity.project_id == proj.id).order_by(ProjectActivity.created_at.desc()).all()
    act_list = [{
        "id": a.id,
        "user_name": a.user_name,
        "action": a.action,
        "details": a.details,
        "created_at": a.created_at.isoformat() if a.created_at else ""
    } for a in activities]

    return {
        "id": proj.id,
        "name": proj.name,
        "description": proj.description or "Satellite Earth observation and change monitoring study.",
        "created_at": proj.created_at.isoformat() if proj.created_at else "",
        "updated_at": proj.updated_at.isoformat() if proj.updated_at else "",
        "satellite_data": "Sentinel-2 MSI & Sentinel-1 C-SAR",
        "period": "2023 → 2026",
        "aoi": "Dublin Urban Region" if "Dublin" in proj.name or "Urban" in proj.name else "Selected Region",
        "images": img_list,
        "analyses": sess_list,
        "collaborators": collabs_list,
        "activities": act_list,
        "share_token": f"sq-proj-{proj.id}-{uuid.uuid4().hex[:8]}"
    }

@router.put("/{project_id}")
def update_project(project_id: int, req: ProjectUpdateRequest, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if req.name is not None:
        proj.name = req.name
    if req.description is not None:
        proj.description = req.description
    proj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(proj)

    db.add(ProjectActivity(
        project_id=proj.id,
        user_name="Project Owner",
        action="Updated project details",
        details=f"Updated metadata for {proj.name}"
    ))
    db.commit()

    return {"status": "SUCCESS", "id": proj.id, "name": proj.name}

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    db.query(ProjectActivity).filter(ProjectActivity.project_id == proj.id).delete()
    db.query(ProjectCollaborator).filter(ProjectCollaborator.project_id == proj.id).delete()
    db.delete(proj)
    db.commit()
    return {"status": "SUCCESS", "deleted_id": project_id}

@router.post("/{project_id}/collaborators")
def add_collaborator(project_id: int, req: AddCollaboratorRequest, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    collab = ProjectCollaborator(
        project_id=proj.id,
        user_email=req.email,
        user_name=req.name or req.email.split("@")[0],
        role=req.role
    )
    db.add(collab)

    act = ProjectActivity(
        project_id=proj.id,
        user_name=req.added_by or "Project Owner",
        action=f"Invited {collab.user_name} as {req.role.upper()}",
        details=f"Access granted: {req.role} permissions on {proj.name}"
    )
    db.add(act)
    db.commit()
    db.refresh(collab)

    return {
        "id": collab.id,
        "user_email": collab.user_email,
        "user_name": collab.user_name,
        "role": collab.role,
        "created_at": collab.created_at.isoformat()
    }

@router.post("/{project_id}/analyses")
def link_analysis_to_project(project_id: int, req: SaveAnalysisRequest, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    sess = db.query(AnalysisSession).filter(AnalysisSession.id == req.session_id).first()
    if not sess:
        # Create lightweight session record if not found
        sess = AnalysisSession(
            id=req.session_id,
            project_id=proj.id,
            title=req.title or "Saved Analysis",
            analysis_type="Saved Investigation"
        )
        db.add(sess)
    else:
        sess.project_id = proj.id
        if req.title:
            sess.title = req.title

    act = ProjectActivity(
        project_id=proj.id,
        user_name=req.added_by or "Analyst",
        action="Saved analysis to project",
        details=f"Attached session '{sess.title}'"
    )
    db.add(act)
    proj.updated_at = datetime.utcnow()
    db.commit()

    return {"status": "SUCCESS", "session_id": sess.id, "project_id": proj.id}

@router.get("/{project_id}/activity")
def get_project_activities(project_id: int, db: Session = Depends(get_db)):
    acts = db.query(ProjectActivity).filter(ProjectActivity.project_id == project_id).order_by(ProjectActivity.created_at.desc()).all()
    return [{
        "id": a.id,
        "user_name": a.user_name,
        "action": a.action,
        "details": a.details,
        "created_at": a.created_at.isoformat() if a.created_at else ""
    } for a in acts]

@router.get("/shared/{share_token}")
def get_shared_project(share_token: str, db: Session = Depends(get_db)):
    # Look up project or return demo shared project
    proj = db.query(Project).first()
    if not proj:
        proj = Project(name="Urban Expansion Study", description="Demonstration shared project for remote sensing collaboration.")
        db.add(proj)
        db.commit()

    return {
        "share_token": share_token,
        "project_id": proj.id,
        "name": proj.name,
        "description": proj.description,
        "satellite_data": "Sentinel-2 MSI Surface Reflectance",
        "period": "2023 → 2026",
        "aoi": "Dublin Urban Region",
        "owner_name": "Riya (Lead GIS Analyst)",
        "collaborator_count": 3,
        "analysis_count": 4,
        "created_at": proj.created_at.isoformat() if proj.created_at else datetime.utcnow().isoformat(),
        "is_shared": True
    }
