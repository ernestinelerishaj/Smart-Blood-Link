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
    # Add additional user fields
    blood_group: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[str] = None
    medical_history: Optional[str] = None
    biometric_data: Optional[str] = None

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
    # Common fields
    phone_number: Optional[str] = None
    address: Optional[str] = None
    
    # User specific fields
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[str] = None
    biometric_data: Optional[str] = None
    
    # Hospital specific fields
    hospital_name: Optional[str] = None
    hospital_registration_number: Optional[str] = None
    emergency_contact: Optional[str] = None
    available_facilities: Optional[List[str]] = None
    
    # Paramedic specific fields
    license_number: Optional[str] = None
    certification: Optional[str] = None
    years_of_experience: Optional[int] = None
    specialization: Optional[str] = None

    # Blood Bank specific fields
    blood_bank_name: Optional[str] = None
    storage_capacity: Optional[int] = None
    blood_types_available: Optional[List[str]] = None
    operating_hours: Optional[str] = None
    emergency_service: Optional[bool] = None
    certification_details: Optional[str] = None

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
        disabled=user.get("disabled", False),
        blood_group=user.get("blood_group"),
        phone_number=user.get("phone_number"),
        address=user.get("address"),
        date_of_birth=user.get("date_of_birth"),
        medical_history=user.get("medical_history"),
        biometric_data=user.get("biometric_data")
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
        "phone_number": user.phone_number,
        "address": user.address,
        "disabled": False
    }

    # Add role-specific fields
    if user.role == "user":
        user_dict.update({
            "date_of_birth": user.date_of_birth,
            "blood_group": user.blood_group,
            "medical_history": user.medical_history,
            "biometric_data": user.biometric_data
        })
    elif user.role == "hospital":
        if not all([user.hospital_name, user.hospital_registration_number]):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Hospital name and registration number are required for hospital registration"
            )
        user_dict.update({
            "hospital_name": user.hospital_name,
            "hospital_registration_number": user.hospital_registration_number,
            "emergency_contact": user.emergency_contact,
            "available_facilities": user.available_facilities
        })
    elif user.role == "paramedic":
        if not all([user.license_number, user.certification, user.years_of_experience is not None]):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="License number, certification, and years of experience are required for paramedic registration"
            )
        user_dict.update({
            "license_number": user.license_number,
            "certification": user.certification,
            "years_of_experience": user.years_of_experience,
            "specialization": user.specialization
        })
    elif user.role == "blood_bank":
        if not all([user.blood_bank_name, user.license_number]):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Blood bank name and license number are required for blood bank registration"
            )
        user_dict.update({
            "blood_bank_name": user.blood_bank_name,
            "license_number": user.license_number,
            "storage_capacity": user.storage_capacity,
            "operating_hours": user.operating_hours,
            "emergency_service": user.emergency_service,
            "certification_details": user.certification_details
        })
    
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

@app.put("/users/me", response_model=User)
async def update_user(
    user_data: dict,
    current_user: User = Depends(get_current_user)
):
    try:
        # Remove fields that shouldn't be updated
        if "id" in user_data:
            del user_data["id"]
        if "username" in user_data:
            del user_data["username"]
        if "email" in user_data:
            del user_data["email"]
        if "role" in user_data:
            del user_data["role"]

        # Update user in database
        result = await db.users.update_one(
            {"_id": current_user.id},
            {"$set": user_data}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not updated"
            )

        # Get updated user
        updated_user = await db.users.find_one({"_id": current_user.id})
        return User(**updated_user)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@app.post("/blood-requests/", response_model=BloodRequest)
async def create_blood_request(
    request: BloodRequest,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["hospital", "blood_bank"]:
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