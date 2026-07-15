from fastapi import APIRouter, Depends, HTTPException, Request, Path
from starlette import status
from sqlalchemy.orm import Session
from typing import Annotated
from .auth import get_current_user, get_db
from ..database import SessionLocal
from ..models import TriageRequest
from ..schemas import TriageRequestCreate, TriageRequestResponse, TriageRequestUpdate

router = APIRouter(
    prefix='/requests',
    tags=['requests']
)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TriageRequestResponse)
async def create_requests(request: TriageRequestCreate, user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    request_model = TriageRequest(
        title=request.title,
        description=request.description,
        category=request.category,
        priority=request.priority,
        owner_id=user.get("id")
    )
    db.add(request_model)
    db.commit()
    db.refresh(request_model)
    return request_model

@router.get("/", status_code=status.HTTP_200_OK)
async def get_requests(user: user_dependency, db: db_dependency, status: str | None = None, priority: str | None = None):
    query = db.query(TriageRequest).filter(TriageRequest.owner_id==user.get("id"))
    if status is not None:
        query = query.filter(TriageRequest.status==status)
    if priority is not None:
        query = query.filter(TriageRequest.priority==priority)
    return query.all()

@router.get("/{request_id}", status_code=status.HTTP_200_OK)
async def read_request(user: user_dependency, db: db_dependency, request_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    request_model = db.query(TriageRequest).filter(TriageRequest.id==request_id).filter(TriageRequest.owner_id==user.get('id')).first()
    if request_model is not None:
        return request_model
    raise HTTPException(status_code=404, detail='Request todo not found.')
    
@router.put("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_request(user: user_dependency, db: db_dependency, request: TriageRequestUpdate, request_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    request_model = db.query(TriageRequest).filter(TriageRequest.id==request_id).filter(TriageRequest.owner_id==user.get("id")).first()
    if request_model is None:
        raise HTTPException(status_code=404, detail='Request not found.')
    
    update_data = request.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(request_model, field, value)

    db.commit()

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(user: user_dependency, db: db_dependency, request_id: int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    request_model = db.query(TriageRequest).filter(TriageRequest.id==request_id).filter(TriageRequest.owner_id==user.get('id')).first()
    if request_model is None:
        raise HTTPException(status_code=404, detail='Request not found.')
    db.query(TriageRequest).filter(TriageRequest.id==request_id).filter(TriageRequest.owner_id==user.get('id')).delete()
    db.commit()