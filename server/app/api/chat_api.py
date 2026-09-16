from typing import Dict, Any, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.gemini_service import gemini_service

router = APIRouter(prefix="", tags=["chat"])

class AssistantChatRequest(BaseModel):
    message: str
    current_page: str = "/"
    page_context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = None

class AssistantChatResponse(BaseModel):
    reply: str
    action_links: List[Dict[str, str]] = []
    source: str = "gemini"

class ExplainComparisonRequest(BaseModel):
    image_a_meta: Dict[str, Any]
    image_b_meta: Dict[str, Any]
    change_stats: Dict[str, Any]
    location_name: str = "Target AOI"

@router.post("/chat/assistant", response_model=AssistantChatResponse)
async def chat_assistant(req: AssistantChatRequest):
    result = await gemini_service.assistant_chat(
        user_message=req.message,
        current_page=req.current_page,
        page_context=req.page_context,
        history=req.history
    )
    return AssistantChatResponse(**result)

@router.post("/compare/explain")
async def explain_comparison_endpoint(req: ExplainComparisonRequest):
    result = await gemini_service.explain_comparison(
        image_a_meta=req.image_a_meta,
        image_b_meta=req.image_b_meta,
        change_stats=req.change_stats,
        location_name=req.location_name
    )
    return result
