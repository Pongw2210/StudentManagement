from flask import Flask, render_template,request,redirect
from StudentManagement import app,login
from flask_login import current_user,login_user,logout_user
import dao

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

if __name__ == '__main__':
    app.run(debug=True)