from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy.orm import relationship
from StudentManagement import app,db
from enum import Enum as RoleEnum
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, CheckConstraint,Float
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

class ActiveEnum(RoleEnum):
    DANGDAY = "Đang dạy"
    DADAY = "Đã dạy"

class ScoreTypeEnum(RoleEnum):
    DIEM_15="Điểm 15 phút"
    DIEM_45="Điểm 45 phút"
    DIEM_THI="Điểm thi cuối kỳ"

class SchoolYearEnum(RoleEnum):
    N23_24 = "2023-2024"
    N24_25="2024-2025"

class Base(db.Model):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)

class Teacher_Class(db.Model):
    __tablename__="teacher_class"
    __table_args__ = {'extend_existing': True}
    teacher_id = Column(Integer, ForeignKey('teacher.id'), primary_key=True)
    class_id = Column(Integer, ForeignKey('class.id'), primary_key=True)
    time = Column(DateTime, default=datetime.now())

class Subject_Teacher_Class(db.Model):
    __tablename__="subject_teacher_class"
    __table_args__ = {'extend_existing': True}
    teacher_id = Column(Integer, ForeignKey('teacher.id'), primary_key=True)
    class_id = Column(Integer, ForeignKey('class.id'), primary_key=True)
    subject_id=Column(Integer,ForeignKey('subject.id'),primary_key=True)
    active= Column(Enum(ActiveEnum), default=ActiveEnum.DANGDAY)
    start_date = Column(DateTime, default=datetime.now())
    end_date = Column(DateTime, nullable=True)

class Score(Base):
    __tablename__="score"
    student_id = Column(Integer, ForeignKey('student.id'))
    semester_id = Column(Integer, ForeignKey('semester.id'))
    subject_id=Column(Integer,ForeignKey('subject.id'))
    score=Column(Float,nullable=True)
    score_type=Column(Enum(ScoreTypeEnum),default=ScoreTypeEnum.DIEM_15)
    __table_args__ = (
        CheckConstraint('0 <= score <= 10', name='check_score'),
        {'extend_existing': True}
    )

class Teacher(Base):
    __tablename__="teacher"
    __table_args__ = {'extend_existing': True}
    fullname = Column(String(100),nullable=False)
    email = Column(String(100), nullable=True)
    gender=Column(String(10),nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    classes = relationship(Teacher_Class, backref="teacher", lazy=True)
    subjects = relationship(Subject_Teacher_Class, backref="teacher", lazy=True)

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
    date_of_join = Column(DateTime, default=datetime.now())

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
    scores=relationship(Score,backref="student",lazy=True)

class Class(Base):
    __tablename__="class"
    __table_args__ = (
        CheckConstraint('number_of_students <= 40', name='check_max_students'),
        {'extend_existing': True}
    )
    name = Column(String(50),unique=True, nullable=False)
    number_of_students= Column(Integer,default=0)
    grade=Column(Enum(GradeEnum))
    students = relationship(Student_Class, backref="class", lazy=True)
    teachers = relationship(Teacher_Class, backref="class", lazy=True)
    subjects=relationship(Subject_Teacher_Class,backref="class",lazy=True)

class Subject(Base):
    __tablename__ = "subject"
    name = Column(String(50), unique=True, nullable=False)
    subject_teachers = relationship(Subject_Teacher_Class, backref="subject", lazy=True)

class Semester(Base):
    __tablename__ = "semester"
    name = Column(String(50), nullable=False)
    school_year = Column(Enum(SchoolYearEnum),nullable=False)

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

        students = [
            Student(fullname="Nguyễn Văn An", dob="2008-01-15", gender="Nam", address="123 Lê Lợi", phone="0901000001",
                    email="an1@gmail.com"),
            Student(fullname="Trần Thị Bích", dob="2008-02-20", gender="Nữ", address="234 Nguyễn Trãi",
                    phone="0901000002", email="bich2@gmail.com"),
            Student(fullname="Lê Minh Khoa", dob="2008-03-05", gender="Nam", address="345 Lý Thường Kiệt",
                    phone="0901000003", email="khoa3@gmail.com"),
            Student(fullname="Phạm Ngọc Hân", dob="2008-04-12", gender="Nữ", address="456 Trần Hưng Đạo",
                    phone="0901000004", email="han4@gmail.com"),
            Student(fullname="Hoàng Đức Tài", dob="2008-05-25", gender="Nam", address="567 CMT8", phone="0901000005",
                    email="tai5@gmail.com"),
            Student(fullname="Đinh Thị Hằng", dob="2008-06-30", gender="Nữ", address="678 Nguyễn Du",
                    phone="0901000006", email="hang6@gmail.com"),
            Student(fullname="Bùi Quốc Dũng", dob="2008-07-18", gender="Nam", address="789 Hùng Vương",
                    phone="0901000007", email="dung7@gmail.com"),
            Student(fullname="Ngô Thị Yến", dob="2008-08-22", gender="Nữ", address="890 Điện Biên Phủ",
                    phone="0901000008", email="yen8@gmail.com"),
            Student(fullname="Đoàn Anh Tuấn", dob="2008-09-10", gender="Nam", address="901 Võ Thị Sáu",
                    phone="0901000009", email="tuan9@gmail.com"),
            Student(fullname="Trịnh Thị Mai", dob="2008-10-05", gender="Nữ", address="101 Nguyễn Huệ",
                    phone="0901000010", email="mai10@gmail.com"),
        ]
        db.session.add_all(students)
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
        student_class = Student_Class(student_id=students[0].id, class_id=class1.id,date_of_join=datetime.now())
        db.session.add(student_class)
        db.session.commit()

        teacher_class = Teacher_Class(teacher_id=teacher2.id, class_id=class1.id,time=datetime.now())
        db.session.add(teacher_class)
        db.session.commit()

        teacher = Teacher(fullname="Tần Minh Thư", email="tmn@gmail.com", gender="Nam")
        db.session.add(teacher)
        db.session.commit()

        subjects = [
            Subject(name="Toán"),
            Subject(name="Ngữ Văn"),
            Subject(name="Vật Lý"),
            Subject(name="Hóa Học"),
            Subject(name="Sinh Học"),
            Subject(name="Lịch Sử"),
            Subject(name="Địa Lý"),
            Subject(name="Tiếng Anh"),
            Subject(name="Giáo dục công dân"),
            Subject(name="Tin học")
        ]

        db.session.add_all(subjects)
        db.session.commit()

        # Lấy danh sách các lớp, giáo viên và môn học
        classes = {c.name: c for c in Class.query.all()}
        teachers = {t.fullname: t for t in Teacher.query.all()}
        subjects = {s.name: s for s in Subject.query.all()}

        assignments = [
            # Lớp 10A1
            {"teacher": "Nguyễn Ngọc Anh", "subject": "Toán", "class": "10A1"},
            {"teacher": "Phạm Ái Linh", "subject": "Ngữ Văn", "class": "10A1"},
            {"teacher": "Lê Bảo An", "subject": "Vật Lý", "class": "10A1"},
            {"teacher": "Đỗ Quang Khải", "subject": "Hóa Học", "class": "10A1"},
            {"teacher": "Nguyễn Ngọc Anh", "subject": "Sinh Học", "class": "10A1"},

            # Lớp 11A1
            {"teacher": "Tần Minh Ngọc", "subject": "Toán", "class": "11A1"},
            {"teacher": "Phạm Ái Linh", "subject": "Ngữ Văn", "class": "11A1"},
            {"teacher": "Lê Bảo An", "subject": "Vật Lý", "class": "11A1"},
            {"teacher": "Nguyễn Ngọc Anh", "subject": "Hóa Học", "class": "11A1"},
            {"teacher": "Tần Minh Thư", "subject": "Sinh Học", "class": "11A1"},

            # Lớp 12A1
            {"teacher": "Tần Minh Ngọc", "subject": "Toán", "class": "12A1"},
            {"teacher": "Nguyễn Ngọc Anh", "subject": "Ngữ Văn", "class": "12A1"},
            {"teacher": "Lê Bảo An", "subject": "Vật Lý", "class": "12A1"},
            {"teacher": "Đỗ Quang Khải", "subject": "Hóa Học", "class": "12A1"},
            {"teacher": "Nguyễn Ngọc Anh", "subject": "Sinh Học", "class": "12A1"},
        ]

        for a in assignments:
            teacher = teachers.get(a["teacher"])
            subject = subjects.get(a["subject"])
            lop = classes.get(a["class"])

            if teacher and subject and lop:
                stc = Subject_Teacher_Class(
                    teacher_id=teacher.id,
                    subject_id=subject.id,
                    class_id=lop.id,
                    active=ActiveEnum.DANGDAY.name,
                    start_date=datetime.now()
                )
                db.session.add(stc)

        db.session.commit()

        semesters = [
            Semester(name="HK1_2425",school_year=SchoolYearEnum.N24_25),
            Semester(name="HK2_2425",school_year=SchoolYearEnum.N24_25)
        ]
        db.session.add_all(semesters)
        db.session.commit()
