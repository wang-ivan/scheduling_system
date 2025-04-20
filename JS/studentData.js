
document.addEventListener("DOMContentLoaded", () => {
    db = window.db; // 確保 DOM 已加載後訪問

});


let editingIndex = -1; // -1 表示新增模式
const employeeTableBody = document.getElementById('employeeTableBody');
const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
const saveEmployeeBtn = document.getElementById('saveEmployee');
const employeeForm = document.getElementById('employeeForm');
const studentIDInput = document.getElementById('studentID');
const nameInput = document.getElementById('name');
const departmentInput = document.getElementById('department');
const gradeInput = document.getElementById('grade');


// 渲染員工列表
function renderTable() {
    employeeTableBody.innerHTML = '';
    var ref = db.collection('StudentsData');
    ref.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const employee = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.studentID}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.grade}</td>
                <td><div class="color-option" style="background-color: ${employee.color};" data-color="${employee.color}"></div></td>
                <td>
                <button class="btn btn-warning btn-sm" onclick="editEmployee('${employee.studentID}')">修改</button>
                <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${employee.studentID}')">刪除</button>
                <button class="btn btn-info btn-sm" onclick="viewScheduleHistory('${employee.studentID}')">歷史排班</button>
                </td>
            `;
            employeeTableBody.appendChild(row);
        });
    });
    
}


// 新增/修改員工資料
saveEmployeeBtn.addEventListener('click', () => {

    if (!employeeForm.checkValidity()) {
        alert('請填寫所有必填欄位');
        return;
    } else if (studentIDInput.value.length !== 10) {
        alert('身分證字號必須為10位數字');
        return;
    }
    const employeeData = {
        studentID: studentIDInput.value,
        name: nameInput.value,
        department: departmentInput.value,
        grade: gradeInput.value,
        color: document.getElementById('color').value
    };
    if (editingIndex === -1) {
        db.collection('StudentsData').doc(employeeData.studentID).set(employeeData); // 新增模式
    } else { 
        db.collection('StudentsData').doc(employeeData.studentID).update(employeeData); // 修改模式
    }
    employeeForm.reset();
    editingIndex = -1;
    employeeModal.hide();
    renderTable();
});


// 修改員工
window.editEmployee = (index) => {

    studentID = `${index}`;
    var ref = db.collection('StudentsData').doc(studentID);
    ref.get().then(doc => {
        const employee = doc.data();
        studentIDInput.value = employee.studentID;
        nameInput.value = employee.name;
        departmentInput.value = employee.department;
        gradeInput.value = employee.grade;
        document.querySelector('.selected-color').style.backgroundColor = employee.color;
        editingIndex = index;
        employeeModal.show();
    });
    studentIDInput.disabled = true;
    studentIDInput.readOnly = true;
};


// 刪除員工
window.deleteEmployee = (index) => {

    if (confirm('確定要刪除此員工資料嗎？')) {
        studentID = `${index}`;
        db.collection('StudentsData').doc(studentID).delete();
        db.collection('WorkingDate').where('studentID', '==', studentID).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                db.collection('WorkingDate').doc(doc.id).delete();
            });
        });
        renderTable();
    }
};

// 新增模式初始化
document.getElementById('addEmployeeBtn').addEventListener('click', () => {
    employeeForm.reset();
    studentIDInput.disabled = false; 
    studentIDInput.readOnly = false; 
    editingIndex = -1;
});

renderTable();

window.viewScheduleHistory = (studentID) => {
    window.location.href = `scheduleHistory.html?studentID=${studentID}`;
};


