from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.entities import News, Company, Technology
from app.schemas.entities import NewsOut

router = APIRouter(prefix="/news", tags=["News & Sentiment"])

@router.get("", response_model=List[NewsOut])
def get_news(
    company_id: Optional[int] = Query(None),
    technology_id: Optional[int] = Query(None),
    sentiment: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(News)
    if company_id:
        query = query.filter(News.company_id == company_id)
    if technology_id:
        query = query.filter(News.technology_id == technology_id)
    if sentiment:
        query = query.filter(News.sentiment.ilike(sentiment))

    news_records = query.order_by(News.published_at.desc()).offset(skip).limit(limit).all()

    results = []
    for n in news_records:
        comp_name = n.company.name if n.company else None
        tech_name = n.technology.name if n.technology else None
        results.append(NewsOut(
            id=n.id,
            title=n.title,
            source=n.source,
            url=n.url,
            published_at=n.published_at,
            sentiment=n.sentiment,
            sentiment_score=n.sentiment_score,
            company_name=comp_name,
            technology_name=tech_name
        ))
    return results
