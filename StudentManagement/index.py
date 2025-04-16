from flask import Flask, render_template,request,redirect,session,jsonify,send_file
from sqlalchemy.sql import func

from StudentManagement import app,login,db,min_age,max_age,max_student
from flask_login import current_user,login_user,logout_user
import dao
from datetime import datetime

from models import Student, GradeEnum, Class, Teacher_Class, Student_Class, \
    Teacher, Subject_Teacher_Class, Subject, Score, ScoreTypeEnum, School_Year, UserEnum, Semester

from io import BytesIO
from openpyxl import Workbook

import warnings
from sqlalchemy.exc import SAWarning

warnings.filterwarnings('ignore', category=SAWarning)
@app.route('/')
def home():
    return render_template("index.html")

@app.route('/login', methods=['get', 'post'])
def login_my_user():
    if current_user.is_authenticated:
        return redirect('/')

    err_msg = None
    if request.method.__eq__('POST'):
        username = request.form.get('username')
        password = request.form.get('password')

        user = dao.auth_user(username=username, password=password)

        if user:
            login_user(user)
            if user.role == UserEnum.ADMIN:
                return redirect('/admin')
            return redirect('/')
        else:
            err_msg = "Tài khoản hoặc mật khẩu không khớp!"

    return render_template('login.html', err_msg=err_msg)

@login.user_loader
def get_user(user_id):
    return dao.get_user_by_id(user_id=user_id)

@app.route("/logout")
def logout_my_user():
    logout_user()
    return redirect('/login')

@app.route('/user_info')
def user_info():
    return render_template('user_info.html')

@app.route('/register_student')
def register_student():
    return render_template('register_student.html')

def validateAge(dob):
    birth_date = datetime.strptime(dob, "%Y-%m-%d").date()
    today = datetime.today().date()

    age = today.year - birth_date.year

    return min_age <= age <= max_age

@app.route('/api/save_student', methods=['POST'])
def save_student():
    # import pdb
    # pdb.set_trace()

    data = request.get_json()

    # Lấy dữ liệu từ form
    fullname = data.get('fullname')
    dob = data.get('dob')
    gender = data.get('gender')
    address = data.get('address')
    phone = data.get('phone')
    email = data.get('email')

    # Kiểm tra tất cả trường phải được điền đầy đủ
    if not fullname or not dob or not gender or not address or not phone:
        return jsonify({"success": False, "message": "Tất cả các trường phải được điền đầy đủ!"})

    # Kiểm tra tuổi
    if not validateAge(dob):
        return jsonify({"success": False, "message": "Tuổi phải từ 15 đến 20!"})

    # Kiểm tra số điện thoại
    if len(phone) != 10 or not phone.isdigit():
        return jsonify({"success": False, "message": "Số điện thoại phải có 10 chữ số!"})

    # Kiểm tra email (phải có đuôi @gmail.com)
    if email and not email.endswith('@gmail.com'):
        return jsonify({"success": False, "message": "Email phải có đuôi @gmail.com!"})

    # Tạo đối tượng Student mới
    new_student = Student(
        fullname=fullname,
        dob=dob,
        gender=gender,
        address=address,
        phone=phone,
        email=email
    )

    # Thêm sinh viên vào cơ sở dữ liệu
    try:
        db.session.add(new_student)
        db.session.commit()  # Lưu thay đổi vào cơ sở dữ liệu
        return jsonify({"success": True, "message": "Dữ liệu đã được lưu thành công!"})

    except Exception as e:
        db.session.rollback()  # Rollback nếu có lỗi
        return jsonify({"success": False, "message": "Có lỗi xảy ra khi lưu dữ liệu: " + str(e)})

@app.route('/add_class')
def add_class():
    grades=dao.load_gradeEnum()
    available_teachers=dao.load_teachers_with_assign_status()
    available_students=dao.load_students_with_assign_status()
    return render_template("add_class.html",grades=grades,
                           available_teachers=available_teachers,available_students=available_students)

@app.route('/api/save_class', methods=['POST'])
def save_class():
    data = request.get_json()
    classname = data.get("classname")
    grade = data.get("grade")
    teacher_id = data.get("teacher_id")
    student_ids = data.get("student_ids")

    # Kiểm tra tất cả trường phải được điền đầy đủ
    if not classname or not grade or not teacher_id:
        return jsonify({"success": False, "message": "Tất cả các trường phải được điền đầy đủ!"})

    # Kiểm tra nếu số lượng học sinh đã chọn vượt quá sĩ số lớp
    if len(student_ids) >max_student:
        return jsonify({'success': False, 'message': 'Số lượng học sinh 1 lớp không quá 40 học sinh'})

    # Kiểm tra xem lớp học đã tồn tại chưa
    existing_class = Class.query.filter_by(name=classname).first()
    if existing_class:
        return jsonify({'success': False, 'message': 'Lớp học đã tồn tại'})

    # Tạo lớp học mới
    new_class = Class(name=classname, grade=grade, number_of_students=len(student_ids))
    db.session.add(new_class)
    db.session.commit()

    # Liên kết giáo viên chủ nhiệm với lớp
    teacher_class = Teacher_Class(teacher_id=teacher_id, class_id=new_class.id, time=datetime.now())
    db.session.add(teacher_class)
    db.session.commit()

    # Liên kết học sinh với lớp
    for student_id in student_ids:
        student = Student.query.get(student_id)
        if student and not student.classes:  # chỉ thêm nếu chưa có lớp nào
            student_class = Student_Class(student_id=student_id, class_id=new_class.id, date_of_join=datetime.now())
            db.session.add(student_class)

    db.session.commit()

    return jsonify({'success': True, 'message': 'Lớp học đã được tạo thành công.'})

@app.route('/edit_class')
def edit_class():
    classes=dao.load_class()
    teachers=dao.load_teachers_with_assign_status()
    unassigned_students=dao.load_unassigned_students()
    return render_template("edit_class.html",classes=classes,teachers=teachers,
                           unassigned_students=unassigned_students)

@app.route('/api/class_info/<int:class_id>')
def get_class_info(class_id):
    cls = Class.query.get(class_id)

    # Tìm giáo viên chủ nhiệm
    teacher_class = Teacher_Class.query.filter_by(class_id=class_id).first()
    teacher = teacher_class.teacher if teacher_class else None

    # Lấy danh sách học sinh từ bảng phụ student_class
    student_data = [{
        'id': sc.student.id,
        'fullname': sc.student.fullname,
        'dob': sc.student.dob.strftime('%d/%m/%Y'),
        'gender': sc.student.gender,
        'address': sc.student.address,
        'phone': sc.student.phone,
        'email': sc.student.email
    } for sc in cls.students]

    return jsonify({
        'teacher_name': teacher.fullname if teacher else 'Chưa có giáo viên',
        'students': student_data
    })

@app.route('/api/save_edit_class', methods=['POST'])
def save_edit_class():
    data = request.get_json()
    class_id = data.get("class_id")
    teacher_id = data.get("teacher_id")
    student_ids = data.get("student_ids", [])

    if not class_id:
        return jsonify({'message': 'Thiếu thông tin lớp học!'})

    try:
        # --- Cập nhật giáo viên chủ nhiệm ---
        if teacher_id:
            # Xóa giáo viên cũ (nếu có)
            Teacher_Class.query.filter_by(class_id=class_id).delete()
            # Gán giáo viên mới
            new_tc = Teacher_Class(teacher_id=teacher_id, class_id=class_id)
            db.session.add(new_tc)

        # --- Cập nhật học sinh ---
        # Xóa toàn bộ học sinh cũ trong lớp
        Student_Class.query.filter_by(class_id=class_id).delete()

        # Thêm mới danh sách học sinh (nếu có)
        for sid in student_ids:
            sc = Student_Class(student_id=sid, class_id=class_id)
            db.session.add(sc)

        db.session.commit()
        return jsonify({'message': 'Cập nhật lớp học thành công!'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Lỗi khi cập nhật: {str(e)}'})

@app.route('/update_score')
def update_score():
    grades=dao.load_gradeEnum()
    semesters=dao.load_semester()
    return render_template("update_score.html",grades=grades,semesters=semesters)
@app.route('/api/get_students_by_class/<int:class_id>', methods=['GET'])
def get_students_by_class(class_id):
    cls = Class.query.get(class_id)
    if not cls:
        return jsonify({'error': 'Class not found'}), 404

    students = cls.students
    result = [{'id': sc.student.id, 'fullname': sc.student.fullname} for sc in students]
    return jsonify(result)
@app.route('/api/get_classes_by_grade/<grade>', methods=['GET'])
def get_classes_by_grade(grade):

    grade_enum = GradeEnum[grade]
    classes = Class.query.filter_by(grade=grade_enum).all()
    result = [{'id': cls.id, 'name': cls.name} for cls in classes]
    return jsonify(result)

@app.route('/api/get_subject_by_teachID_classID/<int:class_id>', methods=['GET'])
def get_subject_by_teachID_classID(class_id):
    if not current_user.is_authenticated:
        return {"error": "Unauthorized"}

    teacher = Teacher.query.filter_by(user_id=current_user.id).first()
    if not teacher:
        return {"error": "Teacher not found"}

    stc_list = Subject_Teacher_Class.query \
        .filter_by(teacher_id=teacher.id, class_id=class_id) \
        .join(Subject) \
        .all()

    result = [{"id": stc.subject.id, "name": stc.subject.name} for stc in stc_list]

    return jsonify(result)

@app.route('/api/save_update_score', methods=['POST'])
def save_update_score():
    data = request.get_json()

    semester_id = data.get("semester_id")
    subject_id = data.get("subject_id")
    scores = data.get("scores", [])

    if not semester_id or not subject_id:
        return jsonify({"success": False, "message": "Các trường phải cập nhật đầy đủ"})

    skipped_students = []  # Danh sách học sinh bị bỏ qua

    try:
        for s in scores:
            student_id = s.get("student_id")

            # Truy vấn điểm hiện có của học sinh đó
            existing_scores = Score.query.filter_by(
                student_id=student_id,
                subject_id=subject_id,
                semester_id=semester_id
            ).all()

            # Kiểm tra điều kiện
            count_15 = sum(1 for score in existing_scores if score.score_type == ScoreTypeEnum.DIEM_15)
            count_45 = sum(1 for score in existing_scores if score.score_type == ScoreTypeEnum.DIEM_45)
            has_exam = any(score.score_type == ScoreTypeEnum.DIEM_THI for score in existing_scores)

            if count_15 >= 5 or count_45 >= 3 or has_exam:
                skipped_students.append(student_id)
                continue  # Bỏ qua học sinh này

            # Nếu chưa đủ, thêm điểm
            for val in s.get("score15p", []):
                if val is not None:
                    db.session.add(Score(
                        student_id=student_id,
                        semester_id=semester_id,
                        subject_id=subject_id,
                        score=val,
                        score_type=ScoreTypeEnum.DIEM_15,
                    ))

            for val in s.get("score45p", []):
                if val is not None:
                    db.session.add(Score(
                        student_id=student_id,
                        semester_id=semester_id,
                        subject_id=subject_id,
                        score=val,
                        score_type=ScoreTypeEnum.DIEM_45,
                    ))

            # Thêm điểm thi nếu chưa có
            exam_score = s.get("exam_score")
            if exam_score is not None:
                existing_exam_score = next(
                    (score for score in existing_scores if score.score_type == ScoreTypeEnum.DIEM_THI),
                    None
                )
                if not existing_exam_score:
                    db.session.add(Score(
                        student_id=student_id,
                        semester_id=semester_id,
                        subject_id=subject_id,
                        score=exam_score,
                        score_type=ScoreTypeEnum.DIEM_THI,
                    ))

        db.session.commit()

        if skipped_students:
            return jsonify({
                "success": True,
                "message": f"Cập nhật điểm thành công. {len(skipped_students)} học sinh đã đủ điểm nên bị bỏ qua.",
                "skipped": skipped_students
            })
        else:
            return jsonify({"success": True, "message": "Cập nhật điểm thành công."})

    except Exception as ex:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Lỗi khi cập nhật: {str(ex)}'})

def calculate_avg_semester(student_id, semester_id):
    avg_15 = db.session.query(func.avg(Score.score)).filter_by(
        student_id=student_id,
        semester_id=semester_id,
        score_type=ScoreTypeEnum.DIEM_15
    ).scalar()
    print(f"Điểm 15' học sinh {student_id} học kỳ {semester_id}: {avg_15}")

    avg_45 = db.session.query(func.avg(Score.score)).filter_by(
        student_id=student_id,
        semester_id=semester_id,
        score_type=ScoreTypeEnum.DIEM_45
    ).scalar()
    print(f"Điểm 45' học sinh {student_id} học kỳ {semester_id}: {avg_45}")

    exam_score = db.session.query(Score.score).filter_by(
        student_id=student_id,
        semester_id=semester_id,
        score_type=ScoreTypeEnum.DIEM_THI
    ).scalar()
    print(f"Điểm thi học sinh {student_id} học kỳ {semester_id}: {exam_score}")

    if avg_15 is not None and avg_45 is not None and exam_score is not None:
        mid_avg = avg_15 * 0.2 + avg_45 * 0.3
        final_avg = round(mid_avg * 0.5 + exam_score * 0.5, 2)  # ⚠️ Giữ 2 chữ số thập phân
    else:
        final_avg = None

    return final_avg

@app.route('/api/get_score_by_class_id/<int:class_id>/<int:school_year_id>', methods=['GET'])
def get_score_by_class_id(class_id,school_year_id):
    cls = Class.query.get(class_id)
    school_year=School_Year.query.get(school_year_id)
    if not cls or not school_year:
        return jsonify({'error': 'Không tim thấy lớp hoặc năm học'})

    for s in school_year.semesters:
        print(s.id, s.name)
    semesters=school_year.semesters
    semester1 = next((s for s in semesters if s.name.startswith("HK1")), None)
    semester2 = next((s for s in semesters if s.name.startswith("HK2")), None)
    result = []

    for sc in cls.students:
        student = sc.student

        avg_hk1 = calculate_avg_semester(student.id, semester1.id) if semester1 else None
        avg_hk2 = calculate_avg_semester(student.id, semester2.id) if semester2 else None

        avg_total = round(((avg_hk1 or 0) + (avg_hk2 or 0)) / 2, 2) if avg_hk1 and avg_hk2 else None

        result.append({
            'id': student.id,
            'fullname': student.fullname,
            'class': cls.name,
            'avg_semester1': avg_hk1,
            'avg_semester2': avg_hk2,
            'avg_total': avg_total
        })
    print("====== TỔNG KẾT ======")
    for item in result:
        print(item)

    return jsonify(result)


@app.route('/export_score')
def export_score_form():
    schoolyears = dao.load_school_year()
    grades=dao.load_gradeEnum()
    return render_template("export_score.html",schoolyears=schoolyears,grades=grades)

@app.route('/api/fetch_classes_by_grade/<grade>')
def fetch_classes_by_grade(grade):
    try:
        grade = int(grade)  # Chuyển grade thành integer
        classes = Class.query.filter_by(grade=grade).all()
        if not classes:
            return jsonify([])
        return jsonify([{'id': cls.id, 'name': cls.name} for cls in classes])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export_score', methods=['POST'])
def export_score():
    school_year_id = request.form.get('schoolyears')
    class_id = request.form.get('class_id')

    cls = Class.query.get(class_id)
    school_year = School_Year.query.get(school_year_id)

    if not cls or not school_year:
        return jsonify({'error': 'Không tìm thấy lớp hoặc năm học'}), 404

    # Khởi tạo workbook và worksheet
    wb = Workbook()
    ws = wb.active
    ws.title = "Bảng Điểm"

    # Thêm tiêu đề cho các cột
    ws.append(["STT", "Họ và tên", "Điểm trung bình HK1", "Điểm trung bình HK2", "Điểm tổng kết"])

    # Lặp qua học sinh trong lớp để lấy điểm
    for index, sc in enumerate(cls.students, start=1):
        student = sc.student
        avg_hk1 = calculate_avg_semester(student.id, 1)
        avg_hk2 = calculate_avg_semester(student.id, 2)
        avg_total = round(((avg_hk1 or 0) + (avg_hk2 or 0)) / 2, 2) if avg_hk1 and avg_hk2 else None

        # Thêm thông tin học sinh vào sheet
        ws.append([
            index,
            student.fullname,
            avg_hk1 if avg_hk1 is not None else "-",
            avg_hk2 if avg_hk2 is not None else "-",
            avg_total if avg_total is not None else "-"
        ])

    # Lưu workbook vào bộ nhớ và gửi file cho người dùng
    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return send_file(output, as_attachment=True, download_name="bang_diem.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

if __name__ == '__main__':
    from StudentManagement.admin import *

    app.run(debug=True)