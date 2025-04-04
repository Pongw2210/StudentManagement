from StudentManagement import app,db
from enum import Enum as RoleEnum
from sqlalchemy import Column,Integer,String,Enum
from flask_login import UserMixin

class UserEnum(RoleEnum):
    GIAOVIEN = 1
    GIAOVU = 2
    PHUHUYNH = 3
    ADMIN = 4

class Base(db.Model):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)

class User(Base, UserMixin):
    name = Column(String(100))
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50), nullable=False)
    avatar = Column(String(300), default="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg")
    role = Column(Enum(UserEnum), default=UserEnum.GIAOVU)

    def __str__(self):
        return self.username

if __name__ =="__main__":
    with app.app_context():
        db.create_all()
        import hashlib
        u = User(name="Nguyen Van A", username="userA", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()))

        db.session.add(u)
        db.session.commit()