document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const studentID = urlParams.get('studentID');
    
    let currentPage = 1;
    const itemsPerPage = 20;

    let allSchedules = []; // 用於存儲所有的日程資料

    async function fetchScheduleHistory() {
        const schedules = [];
        const studentsRef = db.collection('StudentsData').where('studentID', '==', studentID);
        const studentsSnapshot = await studentsRef.get();
        for (const doc of studentsSnapshot.docs) {
            const employee = doc.data();         
            const workingDatesRef = db.collection('WorkingDate').where('studentID', '==', studentID);
            const workingDatesSnapshot = await workingDatesRef.get();
    
            workingDatesSnapshot.forEach(dateDoc => {
                const schedule = dateDoc.data();
                schedules.push({
                    id: dateDoc.id,
                    name: employee.name,
                    studentID: schedule.studentID,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime, 
                });
            });
        }
        schedules.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        allSchedules = schedules; // 保存所有的日程資料
        displaySchedules(schedules, currentPage);
        setupPagination(schedules.length);
        
    }
    //----------分頁----------------
    function displaySchedules(schedules, page) {
        const tableBody = document.getElementById('scheduleTableBody');
        tableBody.innerHTML = '';

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedSchedules = schedules.slice(start, end);
        var totalTime = 0;
        paginatedSchedules.forEach((schedule) => {
            const time = Math.floor((new Date(schedule.endTime) - new Date(schedule.startTime))/3600000*100)/100;
            totalTime += time;
            const row = `
                <tr>
                    <td>${schedule.id}</td>
                    <td>${schedule.name}</td>
                    <td>${schedule.studentID}</td>
                    <td>${new Date(schedule.startTime).toLocaleString()}</td>
                    <td>${new Date(schedule.endTime).toLocaleString()}</td>
                    <td>${time}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
        totalTime = totalTime.toFixed(1);
        document.getElementById('totalTime').innerHTML = '本頁總時數 : ' + totalTime;
    }

    function setupPagination(totalItems) {
        const pageCount = Math.ceil(totalItems / itemsPerPage);
        const paginationElement = document.getElementById('pagination');
        paginationElement.innerHTML = '';

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.classList.add('page-item');
            const a = document.createElement('a');
            a.classList.add('page-link');
            a.href = '#';
            a.textContent = i;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                fetchScheduleHistory();
            });
            li.appendChild(a);
            paginationElement.appendChild(li);
        }
    }

    // 添加匯出功能
    document.getElementById('exportButton').addEventListener('click', exportToExcel);

    function exportToExcel() {
        const ws = XLSX.utils.json_to_sheet(allSchedules.map(schedule => ({
            ID: schedule.id,
            姓名: schedule.name,
            身分證字號: schedule.studentID,
            開始時間: new Date(schedule.startTime).toLocaleString(),
            結束時間: new Date(schedule.endTime).toLocaleString(),
            工作時長: Math.floor((new Date(schedule.endTime) - new Date(schedule.startTime))/3600000*100)/100
        })));

        // 計算總時數
        const totalTime = allSchedules.reduce((sum, schedule) => 
            sum + Math.floor((new Date(schedule.endTime) - new Date(schedule.startTime))/3600000*100)/100, 0
        ).toFixed(1);

        // 添加總時數行
        XLSX.utils.sheet_add_aoa(ws, [['總時數', totalTime]], {origin: -1});

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "排班歷史");

        XLSX.writeFile(wb, "排班歷史.xlsx");
    }


    fetchScheduleHistory();
});
