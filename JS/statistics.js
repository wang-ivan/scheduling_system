

const db = window.db;

const yearSelect = document.getElementById('year');
const monthSelect = document.getElementById('month');
const dataTable = document.getElementById('dataTable');
const exportButton = document.getElementById('exportButton');

// 初始化年份和月份選擇器
function initSelectors() {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const yearsToInclude = 20;

    yearSelect.innerHTML = '';
    for (let year = startYear; year <= currentYear + yearsToInclude; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;

    monthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month.toString().padStart(2, '0');
        option.textContent = month + '月';
        monthSelect.appendChild(option);
    }
    monthSelect.value = (new Date().getMonth() + 1).toString().padStart(2, '0');
}

// 更新表格
async function updateTable() {
    const year = yearSelect.value;
    const month = monthSelect.value;
    const workingData = await getWorkingData(year, month);
    renderTable(workingData, year, month);
}

// 獲取工作數據
async function getWorkingData(year, month) {
    const workingData = {};
    const startDate = `${year}-${month}-01`;
    const nextMonth = month === '12' ? '01' : String(parseInt(month) + 1).padStart(2, '0');
    const nextYear = month === '12' ? String(parseInt(year) + 1) : year;
    const endDate = `${nextYear}-${nextMonth}-01`;

    const snapshot = await db.collection('WorkingDate')
        .where('startTime', '>=', startDate)
        .where('startTime', '<', endDate)
        .get();

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const studentID = data.studentID;
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const hours = Number(((endTime - startTime) / (1000 * 60 * 60)).toFixed(1));
        const day = startTime.getDate().toString().padStart(2, '0');
        if (!workingData[studentID]) {
            const studentInfo = await getStudentInfo(studentID);
            workingData[studentID] = { 
                name: studentInfo.name, 
                id: studentInfo.id, 
                days: {}, 
                total: 0 
            };
        }
        
        workingData[studentID].days[day] = (workingData[studentID].days[day] || 0) + hours;
        workingData[studentID].total += hours;
    }

    return workingData;
}

// 獲取學生信息
async function getStudentInfo(studentID) {
    const studentSnapshot = await db.collection('StudentsData').doc(studentID).get();
    const studentData = studentSnapshot.data();
    return {
        name: studentData.name,
        id: studentData.studentID
    };
}

// 渲染表格
function renderTable(workingData, year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let tableHTML = '<div style="overflow-x: auto;"><table class="table table-bordered table-hover" style="min-width: 100%;"><thead class="table-dark"><tr><th style="width: 150px; min-width: 150px;">姓名</th><th scope="col" style="width: 100px; min-width: 100px;">身分證字號</th>';
    
    for (let i = 1; i <= daysInMonth; i++) {
        tableHTML += `<th scope="col" style="width: 50px; min-width: 50px;">${i}</th>`;
    }
    tableHTML += '<th scope="col" style="width: 80px; min-width: 80px; position: sticky; right: 0; z-index: 1;">總時數</th></tr></thead><tbody>';

    for (const [studentID, data] of Object.entries(workingData)) {
        tableHTML += `<tr><th scope="row" style="position: sticky; left: 0; z-index: 1; width: 150px; min-width: 150px;">${data.name}</th><td style="width: 100px; min-width: 100px;">${data.id}</td>`;
        for (let i = 1; i <= daysInMonth; i++) {
            const day = i.toString().padStart(2, '0');
            const hours = data.days[day] ? Number(data.days[day]).toFixed(1) : '';
            tableHTML += `<td style="width: 50px; min-width: 50px;" title="${hours}">${hours}</td>`;
        }
        const totalHours = Number(data.total).toFixed(1);
        tableHTML += `<td style="width: 80px; min-width: 80px; position: sticky; right: 0; z-index: 1;" title="${totalHours}">${totalHours}</td></tr>`;
    }

    tableHTML += '</tbody></table></div>';
    dataTable.innerHTML = tableHTML;
}

// 匯出到Excel
function exportToExcel() {
    const table = document.querySelector('table');
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "工作時數統計");
    XLSX.writeFile(wb, `工作時數統計_${yearSelect.value}年${monthSelect.value}月.xlsx`);
}

// 事件監聽器
yearSelect.addEventListener('change', updateTable);
monthSelect.addEventListener('change', updateTable);
exportButton.addEventListener('click', function() {
    this.classList.add('disabled');
    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 匯出中...';
    setTimeout(() => {
        exportToExcel();
        this.classList.remove('disabled');
        this.innerHTML = '匯出到Excel';
    }, 1000);
});

// 初始化
initSelectors();
updateTable();
