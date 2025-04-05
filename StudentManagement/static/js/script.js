
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
    var grade = document.getElementById("grade").value;

    // Lưu dữ liệu vào localStorage
    localStorage.setItem('draftFullname', fullname);
    localStorage.setItem('draftDob', dob);
    localStorage.setItem('draftGender', gender);
    localStorage.setItem('draftAddress', address);
    localStorage.setItem('draftPhone', phone);
    localStorage.setItem('draftEmail', email);
    localStorage.setItem('draftGrade', grade);

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
    var savedGrade = localStorage.getItem('draftGrade');

    if (savedFullname && savedEmail) {
        // Điền lại thông tin vào form nếu có nháp
        document.getElementById('fullname').value = savedFullname;
        document.getElementById('dob').value = savedDob;
        document.getElementById('gender').value = savedGender;
        document.getElementById('address').value = savedAddress;
        document.getElementById('phone').value = savedPhone;
        document.getElementById('email').value = savedEmail;
        document.getElementById('grade').value = savedGrade;
    }
}






//---------------END XỬ LÝ FORM TIẾP NHẬN HỌC SINH ---------------------