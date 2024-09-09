import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getCompletedTasksData, getIncompleteTasksData, updateUI } from '../util';
/*
export const createCalendar = function () {
  var calendarEl = document.getElementById('calendar');
  var calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    editable: true,
    droppable: true,
    dateClick: function (info) {
      const date = info.dateStr;

      updateCalendarHighlight(date);
      updateUI(info.dateStr);
      highlightCompletedTasks(calendarEl);
      highlightIncompleteTasks(calendarEl);
    },
  });
  calendar.render();
  highlightCompletedTasks(calendarEl);
  highlightIncompleteTasks(calendarEl);
};*/


let btnToday;

export let dateSelectedCalender;

export let globalCalendar;
let calendarEl = document.getElementById('calendar');

export const createCalendar = function () {

  globalCalendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
    editable: true,
    droppable: true,
    weekNumbers: true,
    dateClick: function (info) {
      dateSelectedCalender = info.dateStr;

      updateCalendarHighlight(dateSelectedCalender);
      updateUI(info.dateStr);
    },
    datesSet: function (info) {
      // يتم استدعاء هذه الدالة عند تغيير التواريخ المعروضة في التقويم
      console.log(calendarEl.querySelectorAll('.fc-daygrid-day'));
      console.log();
      
      highlightCompletedTasks(calendarEl);
      highlightIncompleteTasks(calendarEl);
    },
  });

  globalCalendar.render();
  highlightCompletedTasks(calendarEl);
  highlightIncompleteTasks(calendarEl);
  btnToday = document.querySelector('.fc-today-button');
  const todayButton = document.querySelector('.fc-today-button');
  if (todayButton) {
    todayButton.addEventListener('click', function () {
      const today = new Date().toISOString().split('T')[0];
      updateUI(today);
      dateSelectedCalender = today;
    });
  }
};


export function updateCalendarHighlight(date) {
  if (!globalCalendar) return; // تأكد من أن التقويم موجود

  globalCalendar.gotoDate(date);
  highlightCompletedTasks(calendarEl);
  highlightIncompleteTasks(calendarEl);                                                                                                              

  // إزالة أي تمييز حالي
  const allDayElements = document.querySelectorAll('.fc-daygrid-day');
  allDayElements.forEach((dayEl) => {
    dayEl.classList.remove('selected-day');
  });

  // تلوين اليوم المحدد
  const dayElement = document.querySelector(`.fc-daygrid-day[data-date="${date}"]`);
  if (dayElement) {
    dayElement.classList.add('selected-day');
  }

  // updated SelectedCalender ,
  dateSelectedCalender = date;
}

export function highlightCompletedTasks(calendarEl) {
  // Function to convert date from MM/DD/YYYY to YYYY-MM-DD
  const convertDate = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const { labels } = getCompletedTasksData();
  // format: 8/19/2024

  // إزالة النقاط القديمة التي لا توافق الشروط
  const allDots = calendarEl.querySelectorAll('.task-completed-dot');
  allDots?.forEach((dot) => {
    const parentDate = dot.closest('.fc-daygrid-day').getAttribute('data-date');
    const isMatching = labels.some((date) => convertDate(date) === parentDate);

    if (!isMatching) {
      dot.remove(); // حذف النقطة إذا لم يطابق التاريخ
    }
  });

  labels.forEach((date) => {
    // Convert date to the correct format
    const formattedDate = convertDate(date);

    // Now use the formatted date to find the day element
    const dayElement = calendarEl.querySelector(`.fc-daygrid-day[data-date="${formattedDate}"]`);

    if (dayElement) {
      // التأكد من عدم إضافة نقطة إذا كانت موجودة بالفعل
      if (!dayElement.querySelector('.task-completed-dot')) {
        const dot = document.createElement('div');
        dot.classList.add('task-completed-dot');
        dot.style.backgroundColor = 'green';
        dot.style.width = '7px';
        dot.style.height = '7px';
        dot.style.borderRadius = '50%';
        dot.style.position = 'absolute';
        dot.style.bottom = '5px';
        dot.style.right = '5px';

        dayElement.appendChild(dot);
      }
    } else {
    }
  });
}

export function highlightIncompleteTasks(calendarEl) {
  // Function to convert date from MM/DD/YYYY to YYYY-MM-DD
  const convertDate = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const { labels } = getIncompleteTasksData();

  // format: 8/19/2024

  // إزالة النقاط القديمة التي لا توافق الشروط
  const allDots = calendarEl.querySelectorAll('.task-incomplete-dot');
  allDots?.forEach((dot) => {
    const parentDate = dot.closest('.fc-daygrid-day').getAttribute('data-date');
    const isMatching = labels.some((date) => convertDate(date) === parentDate);

    if (!isMatching) {
      dot.remove(); // حذف النقطة إذا لم يطابق التاريخ
    }
  });

  labels.forEach((date) => {
    // Convert date to the correct format
    const formattedDate = convertDate(date);

    // Now use the formatted date to find the day element
    const dayElement = calendarEl.querySelector(`.fc-daygrid-day[data-date="${formattedDate}"]`);

    if (dayElement) {
      // التأكد من عدم إضافة نقطة إذا كانت موجودة بالفعل
      if (!dayElement.querySelector('.task-incomplete-dot')) {
        const dot = document.createElement('div');
        dot.classList.add('task-incomplete-dot');
        dot.style.backgroundColor = 'red';
        dot.style.width = '7px';
        dot.style.height = '7px';
        dot.style.borderRadius = '50%';
        dot.style.position = 'absolute';
        dot.style.bottom = '5px';
        dot.style.left = '5px';

        dayElement.appendChild(dot);
      }
    } else {
    }
  });
}
