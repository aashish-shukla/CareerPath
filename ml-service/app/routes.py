from fastapi import APIRouter

from .schemas import (
    ParseResumeRequest,
    ParseResumeResponse,
    RecommendCareerRequest,
    RecommendCareerResponse,
    SkillGapRequest,
    SkillGapResponse,
    MarketInsightsResponse,
)
from .services.resume_parser import parse_resume_text
from .services.recommender import recommend_careers
from .services.skill_gap import compute_skill_gap
from .services.market_insights import get_market_insights

router = APIRouter()


@router.post("/parse-resume", response_model=ParseResumeResponse)
def parse_resume(payload: ParseResumeRequest):
    return parse_resume_text(payload.text)


@router.post("/recommend-career", response_model=RecommendCareerResponse)
def recommend(payload: RecommendCareerRequest):
    return recommend_careers(payload)


@router.post("/skill-gap", response_model=SkillGapResponse)
def skill_gap(payload: SkillGapRequest):
    return compute_skill_gap(payload)


@router.get("/market-insights", response_model=MarketInsightsResponse)
def market_insights():
    return {"market_insights": get_market_insights()}

