//---------------XỬ LÝ FORM TIẾP NHẬN HỌC SINH----------------------
function cancelAll(){
    if(confirm("Bạn có chắc chắn hủy phiên làm việc không!")==true){
         window.location = "http://127.0.0.1:5000/";
    }
}

function deleteAll(id_form){
    if(confirm("Bạn có chắc chắn xóa tất cả thông tin không!")==true){
          document.getElementById(id_form).reset();
    }
}

// Hàm lưu nháp
function saveDraftStudent() {
    localStorage.setItem('draftFullname', document.getElementById("fullname").value);
    localStorage.setItem('draftDob', document.getElementById("dob").value);
    localStorage.setItem('draftGender', document.getElementById("gender").value);
    localStorage.setItem('draftAddress', document.getElementById("address").value);
    localStorage.setItem('draftPhone', document.getElementById("phone").value);
    localStorage.setItem('draftEmail', document.getElementById("email").value);

    alert('Thông tin đã được lưu nháp!');
}

document.addEventListener('DOMContentLoaded', function () {
    // Log để kiểm tra load
    console.log("Đang load dữ liệu lưu nháp...");

    const fullname = document.getElementById('fullname');
    const dob = document.getElementById('dob');
    const gender = document.getElementById('gender');
    const address = document.getElementById('address');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');

    if (fullname && dob && gender && address && phone && email) {
        fullname.value = localStorage.getItem('draftFullname') || "";
        dob.value = localStorage.getItem('draftDob') || "";
        gender.value = localStorage.getItem('draftGender') || "Nam";
        address.value = localStorage.getItem('draftAddress') || "";
        phone.value = localStorage.getItem('draftPhone') || "";
        email.value = localStorage.getItem('draftEmail') || "";
    }
});

function validateAge(dob) {
    var age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age >= 15 && age <= 20;
}

function saveStudent() {
    var form = document.getElementById('form_register_student');
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
    }).catch(error => {
    // Xử lý lỗi
    document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}

//---------------END XỬ LÝ FORM TIẾP NHẬN HỌC SINH ---------------------


//---------------XỬ LÝ FORM LẬP DANH SÁCH LỚP HỌC----------------------
// Xử lý thanh tìm kiếm giáo viên
 $(document).ready(function() {
$('#teacher').select2({
    placeholder: "Tìm kiếm giáo viên...",
    allowClear: true,
    width: '100%'
    });
});

// Chọn tất cả học sinh
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAllStudents');
    const checkboxes = document.querySelectorAll('input[name="student_ids"]');

    checkboxes.forEach(cb => {
    if (!cb.disabled) {
        cb.checked = selectAll.checked;
        }
    });
}

//Xử lý phân trang
$(document).ready(function() {
    $('.datatable').DataTable({
        "paging": true,  // Bật phân trang
        "pageLength": 5, // Số lượng bản ghi mỗi trang
        "searching": true, // Bật chức năng tìm kiếm
        "lengthChange": false, // Ẩn tùy chọn thay đổi số lượng bản ghi trên mỗi trang
        "info": true,  // Hiển thị thông tin phân trang
        "language": {
            "search": "Tìm kiếm học sinh:",
            "paginate": {
                "next": "Tiếp theo",
                "previous": "Trước"
            },
            "lengthMenu": "Hiển thị _MENU_ học sinh mỗi trang",
            "info": "Hiển thị từ _START_ đến _END_ trong tổng số _TOTAL_ học sinh"
        }
    });
})

//Lưu nháp thông tin lớp
function saveDraftClass() {
    // Lưu thông tin lớp học
    localStorage.setItem('draftClassname', document.getElementById("classname").value);
    localStorage.setItem('draftgrade', document.getElementById("grade").value);
    localStorage.setItem('draftTeacher', document.getElementById("teacher").value);

    // Lưu danh sách học sinh đã chọn
    const selectedStudents = Array.from(document.querySelectorAll('input[name="student_ids"]:checked'))
                                .map(cb => cb.value);
    localStorage.setItem('draftStudentIds', JSON.stringify(selectedStudents));

    alert('Thông tin lớp học đã được lưu nháp!');
}

document.addEventListener('DOMContentLoaded', function () {
    const classname = document.getElementById('classname');
    const grade = document.getElementById('grade');
    const teacher = document.getElementById('teacher');

    if (classname && grade && teacher) {
        classname.value = localStorage.getItem('draftClassname') || "";
        grade.value = localStorage.getItem('draftgrade') || "";

        const savedTeacher = localStorage.getItem('draftTeacher');
        if (savedTeacher) {
            for (let i = 0; i < teacher.options.length; i++) {
                if (teacher.options[i].value === savedTeacher) {
                    teacher.selectedIndex = i;
                    break;
                }
            }
            if ($(teacher).hasClass("select2")) {
                $(teacher).trigger("change");
            }
        }
    }

    // Khôi phục danh sách học sinh đã chọn
    const savedStudentIds = JSON.parse(localStorage.getItem('draftStudentIds') || "[]");
    const checkboxes = document.querySelectorAll('input[name="student_ids"]');
    checkboxes.forEach(cb => {
        if (savedStudentIds.includes(cb.value)) {
            cb.checked = true;
        }
    });
});

function saveClass() {
    var form = document.getElementById('form_add_class');
    var classname = document.getElementById('classname').value;
    var grade = document.getElementById('grade').value;
    var teacher_id = document.getElementById('teacher').value;
    var student_ids = Array.from(document.querySelectorAll('input[name="student_ids"]:checked'))
    .map(input => input.value);

    var max_students = 40;

    // Kiểm tra các trường trống
    if (classname === '' || grade === '' || teacher_id === '') {
       document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Tất cả các trường phải được điền đầy đủ!</p>';
       return;
    }

    // Kiểm tra nếu số lượng học sinh đã chọn vượt quá sĩ số lớp
    if (student_ids.length > max_students) {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Số lượng học sinh không được vượt quá ' + max_students + ' học sinh!</p>';
        return;
    }

    // Tiến hành gửi form nếu tất cả đều hợp lệ
    var formData = {
        classname: classname,
        grade: grade,
        teacher_id: teacher_id,
        student_ids: student_ids
    };

    fetch('/api/save_class', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(res => {
//        // Kiểm tra xem phản hồi có phải là JSON không
//        console.log(res);
        return res.json();  // Chuyển đổi phản hồi thành JSON
    })
    .then(data => {
        if (data.success) {
            document.getElementById('responseMessage').innerHTML = '<p style="color: green;">' + data.message + '</p>';
            setTimeout(() => {
                location.reload();  // 💡 Reload lại toàn bộ trang
            }, 1500); // cho người dùng thấy message 1.5 giây trước khi reload
        } else {
            document.getElementById('responseMessage').innerHTML = '<p style="color: red;">' + data.message + '</p>';
        }
    })
    .catch(error => {
        console.log(error); // Log lỗi vào console để kiểm tra
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}
//--------------- END XỬ LÝ FORM LẬP DANH SÁCH LỚP HỌC----------------------

//---------------  XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC----------------------

//Khi nhấn chọn lớp
function onClassChange() {
    const classId = document.getElementById("class_select").value;
    if (!classId) return;

    fetch(`/api/class_info/${classId}`)
        .then(res => res.json())
        .then(data => {
            // Cập nhật giáo viên chủ nhiệm
            document.getElementById("current_teacher_label").innerText = data.teacher_name;

            // Đổ danh sách học sinh của lớp
            const tbody = document.getElementById("available_student_table");
            tbody.innerHTML = "";

            data.students.forEach((student, index) => {
                const row = document.createElement("tr");
                row.setAttribute("available_student_id", student.id); // <- gán id để xử lý xóa

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullname}</td>
                    <td>${student.dob}</td>
                    <td>${student.gender}</td>
                    <td>${student.address}</td>
                    <td>${student.phone}</td>
                    <td>${student.email}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="removeStudentFromClass(${student.id})">
                            <i class="bi bi-x-circle"></i> Xóa
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

//Khi onclick btn Thêm học sinh
function toggleAddStudent() {
    const container = document.getElementById("unassigned_students_container");
    const button = document.querySelector("button.btn-info");

    if (container.style.display === "none") {
        container.style.display = "block";
        button.innerText = "Ẩn danh sách học sinh chưa có lớp";
    } else {
        container.style.display = "none";
        button.innerText = "Thêm học sinh vào lớp";
    }
}

function updateTableIndex(tableBodySelector, sttColumnIndex) {
    const rows = document.querySelectorAll(`${tableBodySelector} tr`);
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");
        if (cells.length > sttColumnIndex) {
            cells[sttColumnIndex].innerText = index + 1;
        }
    });
}

function removeStudentFromClass(studentId) {
    const row = document.querySelector(`#available_student_table tr[available_student_id='${studentId}']`);
    if (!row) return;

    // Lấy thông tin học sinh từ các ô
    const cells = row.querySelectorAll("td");
    const fullname = cells[1].innerText;
    const dob = cells[2].innerText;
    const gender = cells[3].innerText;
    const address = cells[4].innerText;
    const phone = cells[5].innerText;
    const email = cells[6].innerText;

    // Tạo hàng mới ở bảng học sinh chưa có lớp
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td><input type="checkbox" name="unassigned_student_id" value="${studentId}"></td>
        <td>${studentId}</td>
        <td>${fullname}</td>
        <td>${dob}</td>
        <td>${gender}</td>
        <td>${address}</td>
        <td>${phone}</td>
        <td>${email}</td>
    `;

    // Hiện bảng nếu đang ẩn
    const container = document.getElementById("unassigned_students_container");
    container.style.display = "block";

    // Thêm vào bảng chưa có lớp
    container.querySelector("tbody").appendChild(newRow);

    // Xóa khỏi danh sách lớp
    row.remove();
    updateTableIndex("#available_student_table", 0); // bảng lớp học: cột STT là 0
    updateTableIndex("#unassigned_students_container tbody", 1); // chưa có lớp: cột STT là 1
}

function saveDraftEClass() {
    const class_id = document.getElementById('class_select').value;
    const teacher_id = document.getElementById('teacher').value;

    // Danh sách học sinh hiện có trong lớp
    const assigned_rows = document.querySelectorAll('#available_student_table tr[available_student_id]');
    const assigned_student_ids = Array.from(assigned_rows).map(row => row.getAttribute('available_student_id'));

    // Danh sách học sinh mới được chọn
    const unassigned_student_ids = Array.from(document.querySelectorAll('input[name="unassigned_student_id"]:checked'))
        .map(input => input.value);

    const all_student_ids = [...new Set([...assigned_student_ids, ...unassigned_student_ids])];

    const draft = {
        class_id,
        teacher_id,
        student_ids: all_student_ids
    };

    localStorage.setItem(`draft_edit_class_${class_id}`, JSON.stringify(draft));

    document.getElementById('responseMessage').innerText = 'Đã lưu nháp thành công!';
}

function saveEClass() {
    const class_id = document.getElementById('class_select').value;
    const teacher_id = document.getElementById('teacher').value;

    //Lấy danh sách học sinh đang có trong lớp
    const assigned_rows = document.querySelectorAll('#available_student_table tr[available_student_id]');
    const assigned_student_ids = Array.from(assigned_rows).map(row => row.getAttribute('available_student_id'));

    //Lấy học sinh mới được chọn (checkbox) từ danh sách chưa có lớp
    const unassigned_student_ids = Array.from(document.querySelectorAll('input[name="unassigned_student_id"]:checked'))
        .map(input => input.value);

    //Gộp lại (tránh trùng lặp bằng Set)
    const all_student_ids = [...new Set([...assigned_student_ids, ...unassigned_student_ids])];

    //Gửi dữ liệu lên server
    fetch('/api/save_edit_class', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            class_id,
            teacher_id,
            student_ids: all_student_ids
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: green;">' + data.message + '</p>';
        setTimeout(() => {
            location.reload();  // 💡 Reload lại toàn bộ trang
        }, 1500);
    })
    .catch(err => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}

//--------------- END XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC----------------------
