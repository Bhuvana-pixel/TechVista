from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.entities import DataSource
from app.schemas.entities import DataSourceOut

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])

@router.get("", response_model=List[DataSourceOut])
def get_data_sources(db: Session = Depends(get_db)):
    sources = db.query(DataSource).all()
    return sources
