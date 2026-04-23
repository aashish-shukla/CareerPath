from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class ParseResumeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=200_000)


class ParseResumeResponse(BaseModel):
    extracted_text: str
    skills: list[str]


class RecommendCareerRequest(BaseModel):
    education: dict[str, Any] = Field(default_factory=dict)
    skills: list[str] = Field(default_factory=list)
    experience: dict[str, Any] = Field(default_factory=dict)
    resume_text: str = ""


class RecommendationItem(BaseModel):
    career_id: str
    career_title: str
    confidence: float = Field(..., ge=0, le=1)


class RecommendCareerResponse(BaseModel):
    career_match_score: float = Field(..., ge=0, le=100)
    top: dict[str, Any]
    recommendations: list[RecommendationItem]


class SkillGapRequest(RecommendCareerRequest):
    target_career_id: Optional[str] = None


class MissingSkill(BaseModel):
    skill: str
    priority: Literal["High", "Medium", "Low"]
    difficulty: Literal["Easy", "Medium", "Hard"]
    estimated_weeks: int = Field(..., ge=1, le=52)


class SkillGapResponse(BaseModel):
    readiness_score: float = Field(..., ge=0, le=100)
    missing: list[MissingSkill]


class MarketInsightsResponse(BaseModel):
    market_insights: dict[str, Any]

