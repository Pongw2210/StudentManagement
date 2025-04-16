from flask_admin.contrib.sqla import ModelView
from StudentManagement import app, db, utils, dao
from flask_admin import Admin, BaseView, expose
from flask_login import current_user, logout_user
from wtforms.fields import SelectField
from flask import redirect, request, jsonify
from models import UserEnum, Student, Subject, User, Regulation, Semester,School_Year

admin=Admin(app=app,name="Student Management",template_mode='bootstrap4')

class AuthenticatedModelView(ModelView):
    column_display_pk = True
    can_export = True
    can_view_details = True
    can_edit = True
    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == UserEnum.ADMIN

class LogoutAdmin(BaseView):
    @expose('/')
    def index(self):
        logout_user()
        return redirect('/')

    def is_accessible(self):
        return current_user.is_authenticated

class StudentView(AuthenticatedModelView):
    column_searchable_list = ['fullname']
    column_labels = {
        'id':'Mã',
        'fullname':'Họ và tên',
        'dob':'Ngày sinh',
        'gender':'Giới tính',
        'address':'Địa chỉ',
        'phone':'Số điện thoại',
    }
    column_sortable_list = ['id','fullname','dob']
    column_list = ['id','fullname','dob','gender','address','phone']
    # Tùy chỉnh form
    form_overrides = {
        'gender': SelectField
    }

    form_args = {
        'gender': {
            'choices': [('Nam', 'Nam'), ('Nữ', 'Nữ')],
            'label': 'Giới tính'
        }
    }

class SubjectView(AuthenticatedModelView):
    column_searchable_list = ['name']
    column_labels = {
        'id':'Mã',
        'name':'Họ và tên',
    }
    column_list = ['id', 'name']

class UserView(AuthenticatedModelView):
    column_searchable_list = ['username']
    column_labels = {
        'id': 'Mã',
        'username': 'Tên đăng nhập',
        'password': 'Mật khẩu',
        'avatar': 'Ảnh đại diện',
        'role': 'Vai trò'
    }
    column_sortable_list = ['id', 'username', 'role']
    column_list = ['id', 'username', 'password', 'avatar', 'role']

class RegulationView(AuthenticatedModelView):
    column_searchable_list = ['name']
    column_labels = {
        'id': 'Mã',
        'name': 'Tên quy định',
        'content': 'Nội dung',
    }
    column_sortable_list = ['id']
    column_list = ['id', 'name', 'content']

@app.route('/api/get_semesters_by_year/<int:year_id>')
def get_semesters_by_year(year_id):
    semesters = dao.load_semester(year_id)
    result = [{
        'id': s.id,
        'name': s.name
    } for s in semesters]

    return jsonify(result)

class StatsView(BaseView):
    @expose('/', methods=['GET', 'POST'])
    def index(self):
        semester_name = subject_name = school_year_name = None  # Khởi tạo mặc định tránh lỗi

        if request.method == 'POST':
            semester_id = int(request.form.get("semester_id"))
            subject_id = int(request.form.get("subject_id"))
            year_school_id = int(request.form.get("year_school_id"))

            # Lấy tên từ id
            semester = Semester.query.get(semester_id)
            subject = Subject.query.get(subject_id)
            school_year = School_Year.query.get(year_school_id)

            semester_name = semester.name if semester else None
            subject_name = subject.name if subject else None
            school_year_name = school_year.name if school_year else None
        else:
            semester_id = subject_id = None

        # Lấy danh sách môn học và năm học
        subjects = dao.load_subject()
        school_years = dao.load_school_year()

        if semester_id and subject_id:
            stats = utils.subject_summary_report(semester_id, subject_id)
            stats_error_message = None if stats else "Không có dữ liệu thống kê cho môn học và học kỳ đã chọn."
        else:
            stats = []
            stats_error_message = "Vui lòng chọn cả môn học và học kỳ."

        return self.render('admin/stats.html',
                           stats=stats,
                           subjects=subjects,
                           school_years=school_years,
                           stats_error_message=stats_error_message,
                           semester_name=semester_name,
                           subject_name=subject_name,
                           school_year_name=school_year_name)

    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == UserEnum.ADMIN


    def is_accessible(self):
        return current_user.is_authenticated and current_user.role == UserEnum.ADMIN



admin.add_view(UserView(User, db.session, name="Quản lý người dùng"))
admin.add_view(StudentView(Student,db.session,name="Quản lý học sinh"))
admin.add_view(SubjectView(Subject,db.session,name="Quản lý môn học"))
admin.add_view(RegulationView(Regulation,db.session,name="Quy định"))
admin.add_view(StatsView(name="Thống kê"))
admin.add_view(LogoutAdmin(name="Đăng xuất"))


