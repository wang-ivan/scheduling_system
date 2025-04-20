



const employees = []; // 暫存員工資料列表

const scheduleModal = new bootstrap.Modal(document.getElementById('scheduleModal'));
const studentNameSelect = document.getElementById('studentName');
const scheduleForm = document.getElementById('scheduleForm');
const saveScheduleBtn = document.getElementById('saveSchedule');
const deleteScheduleBtn = document.getElementById('deleteSchedule');
const eventStartInput = document.getElementById('eventStart');
const eventEndInput = document.getElementById('eventEnd');
let selectedDate = null;
let editingEvent = null;

// 初始化事件
async function initEvents() {
    const events = [];
    const studentsRef = db.collection('StudentsData');
    const studentsSnapshot = await studentsRef.get();

    for (const doc of studentsSnapshot.docs) {
        const employee = doc.data();
        employees.push(employee);
        
        const workingDatesRef = db.collection('WorkingDate').where('studentID', '==', employee.studentID);
        const workingDatesSnapshot = await workingDatesRef.get();

        workingDatesSnapshot.forEach(dateDoc => {
            const workingDate = dateDoc.data();
            events.push({
                id: dateDoc.id,
                title: employee.name,
                start: workingDate.startTime,
                end: workingDate.endTime,
                color: employee.color
            });
        });
    }
    return events;
}
//----------初始化員工下拉選單----------
function populateEmployeeDropdown() {
    var ref = db.collection('StudentsData');
    studentNameSelect.innerHTML = '<option value="" disabled selected>選擇學生</option>'; // 清空選單
    ref.get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const employee = doc.data();
            const option = document.createElement('option');
            option.value = employee.studentID;
            option.textContent = `${employee.name} (${employee.studentID})`;
            studentNameSelect.appendChild(option);
        });
    });
}

//-----------build calculate------------
document.addEventListener('DOMContentLoaded', function () {
    db = window.db; // 確保 DOM 已加載後訪問
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        themeSystem: 'bootstrap5',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'zh-tw',
        timeZone: 'Asia/Taipei',
        events: async function (info, successCallback, failureCallback) {
            try {
                const events = await initEvents();
                successCallback(events);
            } catch (error) {
                console.error('Error fetching events:', error);
                failureCallback(error);
            }
        },
        dateClick: function (info) {
            selectedDate = info.date;
            let defaultStartTime, defaultEndTime;
        
            // 格式化日期
            const year = info.date.getFullYear();
            const month = String(info.date.getMonth() + 1).padStart(2, '0');
            const day = String(info.date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
        
            if (info.view.type === 'dayGridMonth') {
                // 月視圖：使用固定的預設時間（8:00 到 12:00）
                defaultStartTime = '08:00';
                defaultEndTime = '12:00';
            } else {
                // 週視圖和日視圖：使用點擊的精確時間
                var clickedHour = info.date.getHours() - 8;
                if (clickedHour >= 24) {
                    clickedHour -= 24;
                } else if (clickedHour < 0) {
                    clickedHour += 24;
                }
                const clickedMinute = info.date.getMinutes();
                console.log(clickedHour);
                // 將分鐘調整為最接近的 30 分鐘間隔
                const adjustedMinute = Math.round(clickedMinute / 30) * 30;
                
                defaultStartTime = `${String(clickedHour).padStart(2, '0')}:${String(adjustedMinute).padStart(2, '0')}`;
                
                // 設置結束時間為開始時間後 4 小時
                const endDate = new Date(info.date.getTime() + 4 * 60 * 60 * 1000);
                var endHour = endDate.getHours() - 8;
                if (endHour >= 24) {
                    endHour -= 24;
                } else if (endHour < 0) {
                    endHour += 24;
                }
                defaultEndTime = `${String(endHour).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
            }
        
            eventStartInput.value = `${formattedDate}T${defaultStartTime}`;
            eventEndInput.value = `${formattedDate}T${defaultEndTime}`;
        
            editingEvent = null;
            populateEmployeeDropdown();
            deleteScheduleBtn.style.display = 'none'; // 隱藏刪除按鈕
            scheduleModal.show();
        },
        eventClick: function (info) {
            editingEvent = info.event;
            const employee = employees.find(emp => emp.name === editingEvent.title);
            populateEmployeeDropdown();

            startDate = new Date(editingEvent.start);
            endDate = new Date(editingEvent.end);
            setTimeout(async () => {
                studentNameSelect.value = await employee.studentID;
                // 直接設置 eventStartInput 和 eventEndInput 的值
                if (editingEvent.start) {
                    eventStartInput.value = editingEvent.start.toISOString().slice(0, 16);
                } else {
                    console.error('Event start time is missing');
                }
        
                if (editingEvent.end) {
                    eventEndInput.value = editingEvent.end.toISOString().slice(0, 16);
                } else {
                    console.error('Event end time is missing');
                    eventEndInput.value = '';
                }              
                deleteScheduleBtn.style.display = 'inline-block'; // 顯示刪除按鈕
            }, 100);
            scheduleModal.show();
        }
    });
    

    

    // ----------儲存排班事件------------
    saveScheduleBtn.addEventListener('click', async () => {
        if (!scheduleForm.checkValidity()) {
            alert('請填寫所有必填欄位！');
            return;
        }
        const studentID = studentNameSelect.value;
        const student = employees.find(emp => emp.studentID === studentID);
        const index = employees.indexOf(student);
        const start = new Date(eventStartInput.value);
        const end = new Date(eventEndInput.value);

        // 檢查結束時間是否小於開始時間
        if (end <= start) {
            alert('結束時間必須晚於開始時間！請重新選擇時間。');
            return; // 停止執行，保持模態框開啟
        }
        
        if (editingEvent) {
            const eventId = await editingEvent.id;
            editingEvent.setProp('title', employees[index].name);
            editingEvent.setProp('color', employees[index].color);
            editingEvent.setStart(eventStartInput.value);
            editingEvent.setEnd(eventEndInput.value);
            db.collection('WorkingDate').doc(eventId).update(
                {
                    studentID: studentID,
                    startTime: eventStartInput.value,
                    endTime: eventEndInput.value
                }
            ); // 更改模式
        } else {
            calendar.addEvent({
                title: employees[index].name,
                start: eventStartInput.value,
                end: eventEndInput.value,
                color: employees[index].color
            });
            db.collection('WorkingDate').doc().set(
                {
                    studentID: studentID,
                    startTime: eventStartInput.value,
                    endTime: eventEndInput.value
                }
            ); // 新增模式
        }

        scheduleForm.reset();
        scheduleModal.hide();
    });
    // ---------刪除排班事件-----------
    deleteScheduleBtn.addEventListener('click',() => {
        if (editingEvent) {
            const eventId = editingEvent.id;
            db.collection('WorkingDate').doc(eventId).delete();
            editingEvent.remove();
        }
        scheduleForm.reset();
        scheduleModal.hide();
    });
    calendar.render();
    
});

