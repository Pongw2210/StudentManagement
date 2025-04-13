import hashlib
from models import User,GradeEnum,Teacher,Student,Class,Semester,School_Year


def get_user_by_id(user_id):
    return User.query.get(user_id)

def auth_user(username, password):
    password = str(hashlib.md5(password.encode('utf-8')).hexdigest())
    return User.query.filter(User.username.__eq__(username), User.password.__eq__(password)).first()

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

def load_semester():
    return Semester.query.all()

def load_unassigned_students():
    # Trả về danh sách các học sinh chưa thuộc bất kỳ lớp nào
    return Student.query.filter(~Student.classes.any()).all()

def load_school_year():
    return School_Year.query.all()

