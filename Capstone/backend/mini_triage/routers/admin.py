from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated
from sqlalchemy.orm import Session
from starlette import status
from ..models import  User, TriageRequest
from ..schemas import TriageRequestResponse, UserResponse
from .auth import get_current_user, get_db

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get("/requests", status_code=status.HTTP_200_OK, response_model=list[TriageRequestResponse])
async def read_all_requests(user: user_dependency, db: db_dependency):
    # print(user)
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return db.query(TriageRequest).all()

@router.get("/users", status_code=status.HTTP_200_OK, response_model=list[UserResponse])
async def read_all_users(user: user_dependency, db: db_dependency):
    # print(user)
    if user is None or user.get('role')!='admin':
        raise HTTPException(status_code=403, detail='Admin access required')
    return db.query(User).all()