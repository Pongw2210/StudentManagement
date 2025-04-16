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

//---------------XỬ LÝ FORM TIẾP NHẬN HỌC SINH----------------------
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
function toggleSelectAll(sourceCheckbox, checkboxName) {
    const isChecked = sourceCheckbox.checked;
    const checkboxes = document.querySelectorAll(`input[name="${checkboxName}"]`);

    checkboxes.forEach(cb => {
        if (!cb.disabled) {
            cb.checked = isChecked;
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

    if (class_id === '') {
       document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Thiếu thông tin lớp học!</p>';
       return;
    }

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
        }, 3000);
    })
    .catch(err => {
        document.getElementById('responseMessage').innerHTML = '<p style="color: red;">Lỗi: ' + error.message + '</p>';
    });
}
//---------------  END XỬ LÝ FORM ĐIỀU CHỈNH LỚP HỌC----------------------


//---------------  XỬ LÝ FORM NHẬP ĐIỂM------------------------------------
let score15pCount = 1;
let score45pCount = 1;

function saveDraftUpdateScore() {
    try {
        const students = document.querySelectorAll('#studentTable_class tbody tr');
        if (!students.length) {
            console.warn('No students found in table');
            alert('Không có học sinh nào để lưu nháp.');
            return;
        }

        const draftData = [];
        students.forEach((studentRow) => {
            const studentId = studentRow.getAttribute('available_student_id');
            if (!studentId) return;

            const score15Inputs = studentRow.querySelectorAll('input[name^="score15p_"]');
            const score45Inputs = studentRow.querySelectorAll('input[name^="score45p_"]');
            const examScoreInput = studentRow.querySelector('input[name^="examScore"]');

            const score15p = Array.from(score15Inputs).map(input => input.value ? parseFloat(input.value) : null);
            const score45p = Array.from(score45Inputs).map(input => input.value ? parseFloat(input.value) : null);
            const examScore = examScoreInput ? (examScoreInput.value ? parseFloat(examScoreInput.value) : null) : null;

            draftData.push({
                student_id: studentId,
                score15p: score15p,
                score45p: score45p,
                exam_score: examScore
            });
        });

        const draft = {
            semester_id: document.getElementById('semester').value || '',
            subject_id: document.getElementById('subject_select').value || '',
            class_id: document.getElementById('class_select').value || '',
            grade: document.getElementById('grade').value || '',
            score15pCount: score15pCount,
            score45pCount: score45pCount,
            scores: draftData
        };

        localStorage.setItem('scoreDraft', JSON.stringify(draft));
        console.log('Draft saved:', draft);
        alert('Thông tin đã được lưu nháp!');
    } catch (error) {
        console.error('Error saving draft:', error);
        alert('Có lỗi khi lưu nháp. Vui lòng thử lại.');
    }
}



async function onGradeChange() {
    const grade = document.getElementById('grade').value;
    const classSelect = document.getElementById('class_select');
    const subjectSelect = document.getElementById('subject_select');
    const tableBody = document.getElementById('available_student_table');

    classSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';
    subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';
    tableBody.innerHTML = '';

    if (!grade) return;

    try {
        const response = await fetch(`/api/get_classes_by_grade/${grade}`);
        if (!response.ok) throw new Error('Failed to fetch classes');
        const classes = await response.json();

        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
        console.log('Classes loaded:', classes);
    } catch (error) {
        console.error('Error in onGradeChange:', error);
        alert('Có lỗi khi tải danh sách lớp.');
    }
}

async function onClassSubjectChange() {
    const classId = document.getElementById('class_select').value;
    const subjectSelect = document.getElementById('subject_select');
    const tableBody = document.getElementById('available_student_table');

    subjectSelect.innerHTML = '<option value="">-- Chọn môn học --</option>';
    tableBody.innerHTML = '';

    if (!classId) return;

    try {
        const response = await fetch(`/api/get_subject_by_teachID_classID/${classId}`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const subjects = await response.json();

        if (subjects.error) {
            console.warn('Error from API:', subjects.error);
            alert(subjects.error);
            return;
        }

        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            subjectSelect.appendChild(option);
        });
        console.log('Subjects loaded:', subjects);
    } catch (error) {
        console.error('Error in onClassSubjectChange:', error);
        alert('Có lỗi khi tải danh sách môn học.');
    }
}

async function onClassScoreChange() {
    const classId = document.getElementById('class_select').value;
    const subjectId = document.getElementById('subject_select').value;
    const semesterId = document.getElementById('semester').value;
    const tableBody = document.getElementById('available_student_table');

    tableBody.innerHTML = '';

    if (!classId || !subjectId || !semesterId) {
        console.log('Missing classId, subjectId, or semesterId');
        return;
    }

    try {
        const response = await fetch(`/api/get_students_by_class/${classId}`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const students = await response.json();

        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.setAttribute('available_student_id', student.id);
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.fullname}</td>
                <td><input type="number" name="score15p_${student.id}_1" min="0" max="10" step="0.25"></td>
                <td><input type="number" name="score45p_${student.id}_1" min="0" max="10" step="0.25"></td>
                <td><input type="number" name="examScore_${student.id}" min="0" max="10" step="0.25"></td>
            `;
            tableBody.appendChild(row);
        });
        console.log('Students loaded:', students);
    } catch (error) {
        console.error('Error in onClassScoreChange:', error);
        alert('Có lỗi khi tải danh sách học sinh.');
    }
}

function addScore15p() {
    score15pCount++;
    document.querySelectorAll('#studentTable_class tbody tr').forEach(row => {
        const studentId = row.getAttribute('available_student_id');
        const cell = row.cells[2];
        const input = document.createElement('input');
        input.type = 'number';
        input.name = `score15p_${studentId}_${score15pCount}`;
        input.min = '0';
        input.max = '10';
        input.step = '0.25';
        cell.appendChild(input);
    });
    updateTableHeaders();
}

function removeScore15p() {
    if (score15pCount <= 1) return;
    score15pCount--;
    document.querySelectorAll('#studentTable_class tbody tr').forEach(row => {
        const cell = row.cells[2];
        if (cell.children.length > 1) {
            cell.removeChild(cell.lastChild);
        }
    });
    updateTableHeaders();
}

function addScore45p() {
    score45pCount++;
    document.querySelectorAll('#studentTable_class tbody tr').forEach(row => {
        const studentId = row.getAttribute('available_student_id');
        const cell = row.cells[3];
        const input = document.createElement('input');
        input.type = 'number';
        input.name = `score45p_${studentId}_${score45pCount}`;
        input.min = '0';
        input.max = '10';
        input.step = '0.25';
        cell.appendChild(input);
    });
    updateTableHeaders();
}

function removeScore45p() {
    if (score45pCount <= 1) return;
    score45pCount--;
    document.querySelectorAll('#studentTable_class tbody tr').forEach(row => {
        const cell = row.cells[3];
        if (cell.children.length > 1) {
            cell.removeChild(cell.lastChild);
        }
    });
    updateTableHeaders();
}

function updateTableHeaders() {
    document.getElementById('score15p_header').setAttribute('colspan', score15pCount);
    document.getElementById('score45p_header').setAttribute('colspan', score45pCount);
}

function waitForTableRender() {
    return new Promise((resolve) => {
        const checkTable = () => {
            const table = document.querySelector('#studentTable_class tbody');
            if (table && table.querySelectorAll('tr').length > 0) {
                console.log('Table rendered with students');
                resolve();
            } else {
                console.log('Waiting for table to render...');
                setTimeout(checkTable, 100);
            }
        };
        checkTable();
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    if (typeof Storage === "undefined") {
        alert('Trình duyệt không hỗ trợ localStorage.');
        return;
    }

    const draftJSON = localStorage.getItem('scoreDraft');
    if (!draftJSON) {
        console.log('No draft found in localStorage');
        return;
    }

    try {
        const draft = JSON.parse(draftJSON);
        console.log('Draft loaded:', draft);

        score15pCount = draft.score15pCount || 1;
        score45pCount = draft.score45pCount || 1;

        document.getElementById('grade').value = draft.grade || '';
        await onGradeChange();

        document.getElementById('class_select').value = draft.class_id || '';
        await onClassSubjectChange();

        document.getElementById('subject_select').value = draft.subject_id || '';
        document.getElementById('semester').value = draft.semester_id || '';
        await onClassScoreChange();

        await waitForTableRender();

        for (let i = 1; i < score15pCount; i++) addScore15p();
        for (let i = 1; i < score45pCount; i++) addScore45p();

        draft.scores.forEach((item) => {
            const studentRow = document.querySelector(`tr[available_student_id="${item.student_id}"]`);
            if (studentRow) {
                const score15Inputs = studentRow.querySelectorAll('input[name^="score15p_"]');
                const score45Inputs = studentRow.querySelectorAll('input[name^="score45p_"]');
                const examScoreInput = studentRow.querySelector('input[name^="examScore"]');

                item.score15p.forEach((val, i) => {
                    if (score15Inputs[i]) {
                        score15Inputs[i].value = val ?? '';
                    } else {
                        console.warn(`score15p input index ${i} not found for student ${item.student_id}`);
                    }
                });

                item.score45p.forEach((val, i) => {
                    if (score45Inputs[i]) {
                        score45Inputs[i].value = val ?? '';
                    } else {
                        console.warn(`score45p input index ${i} not found for student ${item.student_id}`);
                    }
                });

                if (examScoreInput) {
                    examScoreInput.value = item.exam_score ?? '';
                } else {
                    console.warn(`examScore input not found for student ${item.student_id}`);
                }
            } else {
                console.warn(`Student row with ID ${item.student_id} not found`);
            }
        });
        console.log('Draft scores applied successfully');
    } catch (error) {
        console.error('Error loading draft:', error);
        alert('Có lỗi khi tải nháp. Vui lòng thử lại.');
    }
});
async function saveUpdateScore() {
    try {
        const semesterId = document.getElementById('semester').value;
        const subjectId = document.getElementById('subject_select').value;
        const classId = document.getElementById('class_select').value;

        // Kiểm tra dữ liệu đầu vào
        if (!semesterId || !subjectId || !classId) {
            alert('Vui lòng chọn đầy đủ học kỳ, môn học và lớp trước khi lưu!');
            return;
        }

        const students = document.querySelectorAll('#studentTable_class tbody tr');
        if (!students.length) {
            alert('Không có học sinh nào để lưu điểm!');
            return;
        }

        const scores = [];
        students.forEach((studentRow) => {
            const studentId = studentRow.getAttribute('available_student_id');
            const score15Inputs = studentRow.querySelectorAll('input[name^="score15p_"]');
            const score45Inputs = studentRow.querySelectorAll('input[name^="score45p_"]');
            const examScoreInput = studentRow.querySelector('input[name^="examScore"]');

            const score15p = Array.from(score15Inputs).map(input => input.value ? parseFloat(input.value) : null);
            const score45p = Array.from(score45Inputs).map(input => input.value ? parseFloat(input.value) : null);
            const examScore = examScoreInput ? (examScoreInput.value ? parseFloat(examScoreInput.value) : null) : null;

            // Kiểm tra điểm hợp lệ
            const isValidScore = (score) => score === null || (score >= 0 && score <= 10);
            if (!score15p.every(isValidScore) || !score45p.every(isValidScore) || (examScore !== null && !isValidScore(examScore))) {
                alert(`Điểm của học sinh ${studentId} không hợp lệ (phải từ 0 đến 10)!`);
                throw new Error('Điểm không hợp lệ');
            }

            scores.push({
                student_id: studentId,
                score15p: score15p,
                score45p: score45p,
                exam_score: examScore
            });
        });

        const data = {
            semester_id: semesterId,
            subject_id: subjectId,
            class_id: classId,
            scores: scores
        };

        const response = await fetch('/api/save_update_score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi lưu điểm');
        }

        const result = await response.json();
        document.getElementById('responseMessage').innerHTML = `<p style="color: green;">${result.message}</p>`;

        if (result.success) {
            localStorage.removeItem('scoreDraft');
            console.log('Scores saved successfully, draft cleared');
            alert('Lưu điểm thành công!');
            setTimeout(() => location.reload(), 2000);
        } else {
            throw new Error(result.message || 'Lưu điểm thất bại');
        }
    } catch (error) {
        console.error('Error in saveUpdateScore:', error);
        document.getElementById('responseMessage').innerHTML = `<p style="color: red;">Lỗi: ${error.message}</p>`;
        alert('Có lỗi khi lưu điểm: ' + error.message);
    }
}
//--------------- END XỬ LÝ FORM NHẬP ĐIỂM------------------------------------


//--------------- XỬ LÝ FORM XUẤT ĐIỂM------------------------------------
async function onGradeChange() {
    const grade = document.getElementById('grade').value;
    const classSelect = document.getElementById('class_select');
    const tableBody = document.getElementById('available_student_table');

    console.log('Selected grade:', grade);

    classSelect.innerHTML = '<option value="">-- Chọn lớp --</option>';
    tableBody.innerHTML = '';

    if (!grade) {
        console.log('No grade selected, exiting onGradeChange.');
        return;
    }

    try {
        console.log('Fetching classes for grade:', grade);
        const response = await fetch(`/api/get_classes_by_grade/${grade}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const classes = await response.json();

        console.log('Classes received:', classes);

        if (classes.length === 0) {
            alert('Không có lớp nào thuộc khối đã chọn.');
            return;
        }

        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
        console.log('Classes loaded into select:', classes);
    } catch (error) {
        console.error('Error in onGradeChange:', error);
        alert('Có lỗi khi tải danh sách lớp: ' + error.message);
    }
}
function onClassExportScoreChange() {
    const classId = document.getElementById("class_select").value;
    const school_year_id = document.getElementById("schoolyears").value;
    const tbody = document.getElementById("available_student_table");
    if (!classId || !schoolYearId) {
        tbody.innerHTML = "<tr><td colspan='6'>Vui lòng chọn lớp và năm học</td></tr>";
        return;
    }
    tbody.innerHTML = "<tr><td colspan='6'>Đang tải dữ liệu...</td></tr>";
    if (!classId||!school_year_id) return;

//    const tbody = document.getElementById("available_student_table");
//    tbody.innerHTML = "";

    fetch(`/api/get_score_by_class_id/${classId}/${school_year_id}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch scores");
        return res.json();
        })
        .then(data => {
            tbody.innerHTML = ""; // Xóa thông báo tải
            if (data.error) {
                tbody.innerHTML = `<tr><td colspan='6'>${data.error}</td></tr>`;
                return;
            }
            if (data.length === 0) {
                tbody.innerHTML = "<tr><td colspan='5'>Không có dữ liệu</td></tr>";
                return;
            }

            data.forEach((student, index) => {
                const row = document.createElement("tr");
                row.setAttribute("available_student_id", student.id);

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.fullname}</td>
                    <td>${student.avg_semester1 !== null ? student.avg_semester1 : "-"}</td>
                    <td>${student.avg_semester2 !== null ? student.avg_semester2 : "-"}</td>
                    <td>${student.avg_total !== null ? student.avg_total : "-"}</td>
                `;

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Lỗi khi tải điểm học sinh:", error);
            tbody.innerHTML = "<tr><td colspan='5'>Lỗi khi tải dữ liệu</td></tr>";
        });
}

function exportScore() {
    const form = document.getElementById("form_export_score");
    const formData = new FormData(form);

    fetch("/api/export_score", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Lỗi khi xuất bảng điểm');
        }
        return response.blob();  // Nhận file Excel từ server
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bang_diem.xlsx';  // Tên file tải về
        a.click();
        window.URL.revokeObjectURL(url);  // Giải phóng tài nguyên
    })
    .catch(error => {
        console.error("Lỗi khi xuất bảng điểm:", error);
        alert("Đã có lỗi xảy ra khi xuất bảng điểm. Vui lòng thử lại!");
    });
}

//--------------- END XỬ LÝ FORM XUẤT ĐIỂM------------------------------------

//--------------- XỬ LÝ THỐNG KÊ------------------------------------

function onYearChange() {
    const year = document.getElementById("year_school_id").value;
    const semesterSelect = document.getElementById("semester_id");
    if (!year || !semesterSelect) return;

    fetch(`/api/get_semesters_by_year/${year}`)
        .then(res => res.json())
        .then(data => {
            semesterSelect.innerHTML = '<option value="">-- Chọn học kỳ --</option>';
            data.forEach(sem => {
                const option = document.createElement('option');
                option.value = sem.id;
                option.textContent = sem.name;
                semesterSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Lỗi khi tải học kỳ:', err);
            semesterSelect.innerHTML = '<option value="">Không thể tải danh sách học kỳ</option>';
        });
}


// Thêm sự kiện cho nút "Xuất thống kê"
document.getElementById("exportStatsButton").addEventListener("click", function() {
    const subjectId = document.getElementById("subject_id").value;
    const yearSchoolId = document.getElementById("year_school_id").value;
    const semesterId = document.getElementById("semester_id").value;

    // Kiểm tra nếu người dùng chưa chọn đầy đủ thông tin
    if (!subjectId || !yearSchoolId || !semesterId) {
        alert("Vui lòng chọn đầy đủ thông tin.");
        return;
    }

    // Gửi yêu cầu AJAX tới server
    fetch('/admin/stats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subject_id: subjectId,
            year_school_id: yearSchoolId,
            semester_id: semesterId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.stats && data.stats.length > 0) {
            // Hiển thị bảng kết quả thống kê
            const statsTableBody = document.getElementById("statsTableBody");
            statsTableBody.innerHTML = ''; // Xóa dữ liệu cũ
            data.stats.forEach((stat, index) => {
                const row = `<tr>
                    <td>${index + 1}</td>
                    <td>${stat.class_name}</td>
                    <td>${stat.total_students}</td>
                    <td>${stat.passed_students}</td>
                    <td>${stat.pass_rate}</td>
                </tr>`;
                statsTableBody.innerHTML += row;
            });

            // Hiển thị biểu đồ
            const labels = data.stats.map(stat => stat.class_name);
            const passRates = data.stats.map(stat => stat.pass_rate);

            const chartData = {
                labels: labels,
                datasets: [{
                    label: 'Tỷ lệ đạt (%)',
                    data: passRates,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            };

            const chartConfig = {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: { display: true, text: 'Tỷ lệ đạt (%)' }
                        },
                        x: {
                            title: { display: true, text: 'Lớp' }
                        }
                    }
                }
            };

            new Chart(document.getElementById('myChart'), chartConfig);

            // Hiển thị kết quả thống kê
            document.getElementById("statsResults").style.display = "block";
        } else {
            alert("Không có dữ liệu thống kê cho lựa chọn của bạn.");
        }
    })
    .catch(error => {
        console.error('Lỗi khi tải thống kê:', error);
        alert("Đã xảy ra lỗi, vui lòng thử lại sau.");
    });
});


//--------------- END XỬ LÝ THỐNG KÊ------------------------------------