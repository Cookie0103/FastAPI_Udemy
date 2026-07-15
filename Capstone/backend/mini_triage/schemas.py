from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional

class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)
    role: Literal["user", "admin"]

class Token(BaseModel):
    access_token: str
    token_type: str

CategoryType = Literal["bug", "feature", "question", "billing", "other"]
PriorityType = Literal["low", "medium", "high"]
StatusType = Literal["open", "in_progress", "closed"]

class TriageRequestCreate(BaseModel):
    title: str = Field(min_length=3)
    description: str = Field(min_length=3)
    category: CategoryType
    priority: PriorityType

class TriageRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[CategoryType] = None
    priority: Optional[PriorityType] = None
    status: Optional[StatusType] = None

class TriageRequestResponse(BaseModel):
    id: int
    title: str
    description: str
    category: CategoryType
    priority: PriorityType
    status: StatusType
    owner_id: int
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    
    model_config = ConfigDict(from_attributes=True)