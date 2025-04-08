from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from typing import List, Optional, Annotated
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# MongoDB setup
MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.bloodbank

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _schema_generator: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string"}

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    username: str
    email: str
    full_name: str
    role: str
    disabled: bool = False

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class UserInDB(User):
    hashed_password: str

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: str

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class BloodRequest(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    blood_type: str
    units: int
    hospital: str
    location: str
    status: str = "pending"
    date: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class Donation(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    user_id: PyObjectId
    blood_type: str
    units: int
    location: str
    verified_by: str
    status: str = "pending"
    date: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

# Security functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    
    return User(
        id=user["_id"],
        username=user["username"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        disabled=user.get("disabled", False)
    )

# Routes
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=User)
async def create_user(user: UserCreate):
    # Check if username or email already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email}
        ]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "role": user.role,
        "disabled": False
    }
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return User(
        id=str(created_user["_id"]),
        username=created_user["username"],
        email=created_user["email"],
        full_name=created_user["full_name"],
        role=created_user["role"]
    )

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/blood-requests/", response_model=BloodRequest)
async def create_blood_request(
    request: BloodRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["hospital", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create blood requests"
        )
    
    request_dict = request.dict(exclude={"id"})
    result = await db.blood_requests.insert_one(request_dict)
    created_request = await db.blood_requests.find_one({"_id": result.inserted_id})
    
    return BloodRequest(
        id=created_request["_id"],
        blood_type=created_request["blood_type"],
        units=created_request["units"],
        hospital=created_request["hospital"],
        location=created_request["location"],
        status=created_request["status"],
        date=created_request["date"]
    )

@app.get("/blood-requests/", response_model=List[BloodRequest])
async def read_blood_requests(current_user: User = Depends(get_current_user)):
    requests = []
    async for request in db.blood_requests.find():
        requests.append(BloodRequest(
            id=request["_id"],
            blood_type=request["blood_type"],
            units=request["units"],
            hospital=request["hospital"],
            location=request["location"],
            status=request["status"],
            date=request["date"]
        ))
    return requests

@app.post("/donations/", response_model=Donation)
async def create_donation(
    donation: Donation,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["paramedic", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create donation records"
        )
    
    donation_dict = donation.dict(exclude={"id"})
    result = await db.donations.insert_one(donation_dict)
    created_donation = await db.donations.find_one({"_id": result.inserted_id})
    
    return Donation(
        id=created_donation["_id"],
        user_id=created_donation["user_id"],
        blood_type=created_donation["blood_type"],
        units=created_donation["units"],
        location=created_donation["location"],
        verified_by=created_donation["verified_by"],
        status=created_donation["status"],
        date=created_donation["date"]
    )

@app.get("/donations/", response_model=List[Donation])
async def read_donations(current_user: User = Depends(get_current_user)):
    donations = []
    async for donation in db.donations.find():
        donations.append(Donation(
            id=donation["_id"],
            user_id=donation["user_id"],
            blood_type=donation["blood_type"],
            units=donation["units"],
            location=donation["location"],
            verified_by=donation["verified_by"],
            status=donation["status"],
            date=donation["date"]
        ))
    return donations

# Initialize database indexes on startup
@app.on_event("startup")
async def startup_event():
    # Create indexes for better query performance
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True)
    await db.blood_requests.create_index("status")
    await db.donations.create_index("user_id")
    await db.donations.create_index("status")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 