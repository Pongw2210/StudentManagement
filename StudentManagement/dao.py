import hashlib

from StudentManagement.models import Teacher
from models import User,GradeEnum,Teacher,Student

#--------------XỬ LÝ LOGIN---------------------------------------------------------|
def get_user_by_id(user_id):
    return User.query.get(user_id)

def auth_user(username, password):
    password = str(hashlib.md5(password.encode('utf-8')).hexdigest())
    return User.query.filter(User.username.__eq__(username), User.password.__eq__(password)).first()

#-------------- END XỬ LÝ LOGIN---------------------------------------------------------|

#--------------XỬ LÝ LẬP DANH SÁCH LỚP---------------------------------------------------------|

def load_gradeEnum():
    return [grade.value for grade in GradeEnum]

def load_teachers():
    return Teacher.query.all()

def load_students():
    return Student.query.all()

#-------------- END XỬ LÝ LẬP DANH SÁCH LỚP---------------------------------------------------------|