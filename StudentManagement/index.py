from flask import Flask, render_template,request,redirect,session,jsonify
from StudentManagement import app,login,db
from flask_login import current_user,login_user,logout_user
import dao
from datetime import datetime
from models import Student

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

    return 15 <= age <= 20

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

if __name__ == '__main__':
    app.run(debug=True)