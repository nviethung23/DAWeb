from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client["pn_movie"]

admin = {
    "username": "admin",
    "password": generate_password_hash("123456"),
    "email": "admin@yourdomain.com",
    "role": "admin",
    "created_at": datetime.datetime.utcnow()
}

db.users.insert_one(admin)
print("Tạo admin thành công!")
