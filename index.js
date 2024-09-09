import { createCalendar, dateSelectedCalender, updateCalendarHighlight } from './scripts/libs/calender';
import { taskForm } from './scripts/elements';
import { updateUI } from './scripts/util';
import { createCharts } from './scripts/libs/charts';
import { loadState, loadUserSettings } from './scripts/libs/pomodoro';
import 'animate.css';
import { createCategory, loadCategoriesFromLocalStorage } from './scripts/libs/categotry';
import { monitorReminders } from './scripts/libs/reminder';
import { createTaskHtml, eventsChange, eventsClick, eventsInput, reminderForm } from './scripts/events';

function getSelectedDate() {
  let selectedDate = dateSelectedCalender ? dateSelectedCalender : new Date().toISOString().slice(0, 10);
  return selectedDate;
}

document.addEventListener('click', eventsClick);

document.addEventListener('change', eventsChange);

document.addEventListener('input', eventsInput);

/* start APP*/
document.addEventListener('DOMContentLoaded', function (event) {
  let selectedDate = getSelectedDate();
  updateUI(selectedDate);
  createCalendar();
  updateCalendarHighlight(selectedDate);
  createCharts();
  loadState();
  loadCategoriesFromLocalStorage();
  loadUserSettings();
});

document.querySelector('.custom-category-form').addEventListener('submit', createCategory);

// save tasks in localStorage
taskForm.addEventListener('submit', createTaskHtml);

document.getElementById('reminder-form').addEventListener('submit', reminderForm);

// Call monitorReminders every minute
setInterval(monitorReminders, 60000);

//responseive

const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');

toggleSidebarBtn.addEventListener('click', function () {
  document.body.classList.toggle('sidebar-active');
});
