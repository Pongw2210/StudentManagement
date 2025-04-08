from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy.orm import relationship
from StudentManagement import app,db
from enum import Enum as RoleEnum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from datetime import datetime
from flask_login import UserMixin
import hashlib

class UserEnum(RoleEnum):
    GIAOVIEN = "Giáo viên"
    GIAOVU = "Giáo vụ"
    PHUHUYNH = "Phụ huynh"
    ADMIN = "Người quản trị"

class GradeEnum(RoleEnum):
    KHOI_10 = "Khối 10"
    KHOI_11 = "Khối 11"
    KHOI_12 = "Khối 12"

class Base(db.Model):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)

class Teacher_Class(db.Model):
    __tablename__="teacher_class"
    __table_args__ = {'extend_existing': True}
    teacher_id = Column(Integer, ForeignKey('teacher.id'), primary_key=True)
    class_id = Column(Integer, ForeignKey('class.id'), primary_key=True)
    time = Column(DateTime, nullable=False)


class Teacher(Base):
    __tablename__="teacher"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    classes = relationship(Teacher_Class, backref="teacher", lazy=True)

class Staff(Base):
    __tablename__="staff"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)

class Admin(Base):
    __tablename__="admin"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)

class Parent(Base):
    __tablename__="parent"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    address=Column(String(300),nullable=False)
    phone=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)

class User(Base, UserMixin):
    __tablename__="user"
    __table_args__ = {'extend_existing': True}
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50), nullable=False)
    avatar = Column(String(300), default="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg")
    role = Column(Enum(UserEnum), default=UserEnum.GIAOVU)
    teacher = relationship(Teacher, uselist=False, backref="user", cascade="all, delete")
    staff = relationship(Staff, uselist=False, backref="user", cascade="all, delete")
    admin = relationship(Admin, uselist=False, backref="user", cascade="all, delete")
    parent = relationship(Parent, uselist=False, backref="user", cascade="all, delete")

class Student_Class(db.Model):
    __tablename__="student_class"
    __table_args__ = {'extend_existing': True}
    student_id = Column(Integer, ForeignKey('student.id'), primary_key=True)
    class_id = Column(Integer, ForeignKey('class.id'), primary_key=True)
    date_of_join = Column(DateTime, nullable=False)

class Student(Base):
    __tablename__="student"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    dob = Column(DateTime, nullable=False)
    gender=Column(String(10),nullable=False)
    address=Column(String(300),nullable=False)
    phone=Column(String(10),nullable=False)
    email=Column(String(100),nullable=True)
    classes = relationship(Student_Class, backref="student", lazy=True)

class Class(Base):
    __tablename__="class"
    __table_args__ = {'extend_existing': True}
    name = Column(String(50),unique=True, nullable=False)
    number_of_students= Column(Integer,default=0)
    grade=Column(Enum(GradeEnum))
    students = relationship(Student_Class, backref="class", lazy=True)
    teachers = relationship(Teacher_Class, backref="class", lazy=True)




if __name__ =="__main__":
    with app.app_context():
        # db.drop_all()
        db.create_all()

        teacher1=Teacher(fullname="Nguyễn Ngọc Anh",email="nna@gmail.com",gender="Nữ")
        db.session.add(teacher1)
        uTeacher1 = User(username="userGVien", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()),
                  avatar="https://static.vecteezy.com/system/resources/previews/019/896/012/large_2x/female-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png",
                  role=UserEnum.GIAOVIEN)
        uTeacher1.teacher = teacher1
        db.session.add(uTeacher1)
        db.session.commit()


        staff1 = Staff(fullname="Trần Bảo Ngọc", email="tbn@gmail.com", gender="Nữ")
        db.session.add(staff1)
        uStaff1 = User(username="userGVu", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()))
        uStaff1.staff=staff1
        db.session.add(uStaff1)
        db.session.commit()

        parent1 = Parent(fullname="Ngô Khánh Ngân", email="nkn@gmail.com", gender="Nữ", address="Nhà Bè",phone="0123456789")
        db.session.add(parent1)
        uParent1 = User(username="userPHuynh", password=str(hashlib.md5("123".encode('utf-8')).hexdigest()),
                        avatar="https://www.pngmart.com/files/22/User-Avatar-Profile-PNG-Isolated-Clipart.png",
                        role=UserEnum.PHUHUYNH)
        uParent1.parent=parent1
        db.session.add(uParent1)
        db.session.commit()


        student1=Student(fullname="Bùi Thiên Ân",dob="2008-10-22",gender="Nam",address="123,abc",phone="0978123456",email="bta1@gmail.com")
        db.session.add(student1)
        db.session.commit()

        teacher2=Teacher(fullname="Tần Minh Ngọc",email="tmn@gmail.com",gender="Nam")
        teacher3 = Teacher(fullname="Phạm Ái Linh", email="pal@gmail.com", gender="Nữ")
        teacher4 = Teacher(fullname="Lê Bảo An", email="lba@gmail.com", gender="Nam")
        teacher5 = Teacher(fullname="Đỗ Quang Khải", email="dqk@gmail.com", gender="Nam")
        db.session.add_all([teacher2,teacher3,teacher4,teacher5])
        db.session.commit()

        class1 = Class(name="10A1", number_of_students=40, grade=GradeEnum.KHOI_10)
        db.session.add(class1)
        class2 = Class(name="11A1", number_of_students=40, grade=GradeEnum.KHOI_11)
        db.session.add(class2)
        class3 = Class(name="12A1", number_of_students=40, grade=GradeEnum.KHOI_12)
        db.session.add(class3)
        db.session.commit()

        # Liên kết học sinh với lớp
        student_class = Student_Class(student_id=student1.id, class_id=class1.id,date_of_join=datetime.now())
        db.session.add(student_class)
        db.session.commit()

        teacher_class = Teacher_Class(teacher_id=teacher2.id, class_id=class1.id,time=datetime.now())
        db.session.add(teacher_class)
        db.session.commit()

        teacher = Teacher(fullname="Tần Minh Thư", email="tmn@gmail.com", gender="Nam")
        db.session.add(teacher)
        db.session.commit()