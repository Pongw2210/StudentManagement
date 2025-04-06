//---------------XỬ LÝ FORM TIẾP NHẬN HỌC SINH----------------------
function cancelSession(){
    if(confirm("Bạn có chắc chắn hủy phiên làm việc không!")==true){
         window.location = "http://127.0.0.1:5000/";
    }
}

function deleteAll(){
    if(confirm("Bạn có chắc chắn xóa tất cả thông tin không!")==true){
          document.getElementById("form_register").reset();
    }
}

function saveDraft() {
    var fullname = document.getElementById("fullname").value;
    var dob = document.getElementById("dob").value;
    var gender = document.getElementById("gender").value;
    var address = document.getElementById("address").value;
    var phone = document.getElementById("phone").value;
    var email = document.getElementById("email").value;

    // Lưu dữ liệu vào localStorage
    localStorage.setItem('draftFullname', fullname);
    localStorage.setItem('draftDob', dob);
    localStorage.setItem('draftGender', gender);
    localStorage.setItem('draftAddress', address);
    localStorage.setItem('draftPhone', phone);
    localStorage.setItem('draftEmail', email);

    alert('Thông tin đã được lưu nháp!');
}

// Tự động tải nháp khi form load
window.onload = function() {
    var savedFullname = localStorage.getItem('draftFullname');
    var savedDob = localStorage.getItem('draftDob');
    var savedGender = localStorage.getItem('draftGender');
    var savedAddress = localStorage.getItem('draftAddress');
    var savedPhone = localStorage.getItem('draftPhone');
    var savedEmail = localStorage.getItem('draftEmail');

    if (savedFullname && savedEmail) {
        // Điền lại thông tin vào form nếu có nháp
        document.getElementById('fullname').value = savedFullname;
        document.getElementById('dob').value = savedDob;
        document.getElementById('gender').value = savedGender;
        document.getElementById('address').value = savedAddress;
        document.getElementById('phone').value = savedPhone;
        document.getElementById('email').value = savedEmail;
    }
}

function validateAge(dob) {
    var age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age >= 15 && age <= 20;
}

function save() {
    var form = document.getElementById('form_register');
    var dob = document.getElementById('dob').value;
    var phone = document.getElementById('phone').value;
    var email = document.getElementById('email').value;

     // Kiểm tra tuổi
    if (!validateAge(dob)) {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Tuổi phải từ 15 đến 20!</p>';
        return;
    }
    // Kiểm tra số điện thoại
    var phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Số điện thoại phải là 10 chữ số!</p>';
        return;
    }

    // Kiểm tra email
    if (email && !email.endsWith('@gmail.com')) {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Email phải có đuôi @gmail.com!</p>';
        return;
    }

    // Tạo đối tượng dữ liệu để gửi dưới dạng JSON
    var formData = {
        fullname: document.getElementById('fullname').value,
        dob: dob,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value,
        phone: phone,
        email: email
    };

    // Tiến hành gửi form nếu tất cả đều hợp lệ
    fetch('/api/save_student', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('responseMessage').innerHTML = '<p style="color: green;">'+data.message+'</p>';
            form.reset();  // Xóa form sau khi lưu
        } else {
            document.getElementById('responseMessage').innerHTML = '<p style="color: red;">' + data.message + '</p>';
        }
    })
    .catch(error => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Có lỗi xảy ra khi gửi dữ liệu!</p>';
    });
}

//---------------END XỬ LÝ FORM TIẾP NHẬN HỌC SINH ---------------------