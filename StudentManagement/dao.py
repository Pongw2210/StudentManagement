import hashlib

from StudentManagement import app
from StudentManagement.models import Subject
from models import User,GradeEnum,Teacher,Student,Class,Semester,School_Year,Regulation


def get_user_by_id(user_id):
    return User.query.get(user_id)

def auth_user(username, password, role=None):
    hashed_password = hashlib.md5(password.encode('utf-8')).hexdigest()

    query = User.query.filter(
        User.username == username,
        User.password == hashed_password
    )
    if role:
        query = query.filter(User.role == role)

    return query.first()

def load_gradeEnum():
    return {
        grade.name: grade.value  # "KHOI_10": "Khối 10"
        for grade in GradeEnum
    }

def load_teachers_with_assign_status():
    teachers = Teacher.query.all()
    for t in teachers:
        t.assigned = len(t.classes) > 0
    return teachers

def load_students_with_assign_status():
    students = Student.query.all()
    for s in students:
        s.assigned = len(s.classes) > 0
    return students

def load_class():
    return Class.query.all()

def load_semester(year_id=None):
    q = Semester.query

    if year_id:
        q = Semester.query.filter_by(school_year_id=year_id)
        print(q.all())

    return q.all()
def load_school_year():
    return School_Year.query.all()

def load_subject():
    return Subject.query.all()

def load_unassigned_students():
    # Trả về danh sách các học sinh chưa thuộc bất kỳ lớp nào
    return Student.query.filter(~Student.classes.any()).all()

# def get_max_age():
#     regulation = Regulation.query.filter_by(name='Số tuổi tối đa').first()
#     if regulation:
#         return int(regulation.content)
#     return None
#
# def get_min_age():
#     regulation = Regulation.query.filter_by(name='Số tuổi tối thiểu').first()
#     if regulation:
#         return int(regulation.content)
#     return None
#
# def get_max_class_size():
#     regulation = Regulation.query.filter_by(name="Sĩ số tối đa").first()
#     if regulation:
#         return int(regulation.content)
#     return None

# with app.app_context():
#     load_semester(2)