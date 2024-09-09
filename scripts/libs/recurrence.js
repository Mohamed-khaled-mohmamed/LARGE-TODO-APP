import { RRule } from 'rrule';
import { deleteTask } from '../util';
import { dateSelectedCalender } from './calender';
import { stringify, v4 as uuidv4 } from 'uuid';


function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function recurrenceAppear(recurrenceBtn) {
  const recurrencePopup = document.getElementById('recurrencePopup');
  // const recurrenceBtn = document.querySelector('.task-detail-item[data-tooltip="إعداد التكرار"]');
  const closeBtn = document.querySelector('.popup .close-btn');
  const cancelBtn = document.getElementById('cancelRecurrenceBtn');
  const saveBtn = document.getElementById('saveRecurrenceBtn');

  recurrencePopup.classList.toggle('hide');

  // إغلاق النافذة المنبثقة عند الضغط على زر الإغلاق
  closeBtn.addEventListener('click', function () {
    recurrencePopup.classList.add('hide');
  });

  // إغلاق النافذة المنبثقة عند الضغط على زر الإلغاء
  cancelBtn.addEventListener('click', function () {
    recurrencePopup.classList.add('hide');
  });

  saveBtn.addEventListener('click', function () {
    recurrencePopup.classList.add('hide');
  });

  // إغلاق النافذة المنبثقة عند الضغط خارجها
  window.addEventListener('click', function (event) {
    if (event.target === recurrencePopup) {
      recurrencePopup.classList.add('hide');
    }
  });
}

export function saveRecurrence(task, saveDateReminder = false) {
  // استرجاع تفاصيل التكرار من عناصر HTML
  const recurrenceType = document.getElementById('recurrence-type').value;
  // const recurrenceEndDate = document.getElementById('recurrence-end-date').value;
  const customInterval = parseInt(document.getElementById('custom-interval').value, 10) || 1;

  // استرجاع الأيام المختارة في حالة التكرار الأسبوعي، الشهري، السنوي، أو المخصص
  const selectedDays = Array.from(document.querySelectorAll('#days-selection-container input:checked')).map((checkbox) => checkbox.value);

  task.pomodoro = {
    pomodoroTime: '',
    shortBreakTime: '',
    longBreakBTime: '',
  };

  task.saveDateReminder = saveDateReminder;

  // تحديث تفاصيل التكرار في الكائن task
  if (recurrenceType !== 'none') {
    task.recurring.enabled = true;
    task.recurring.frequency = recurrenceType;
    task.recurring.interval = customInterval;
    // task.recurring.endDate = recurrenceEndDate || null;
    task.recurring.selectedDays = selectedDays.length ? selectedDays : null;
    task.recurring.allDates = calculateRecurrenceDates(task);
  } else {
    task.recurring.enabled = false;
    task.recurring.frequency = null;
    task.recurring.interval = null;
    task.recurring.endDate = null;
    task.recurring.selectedDays = null;
    task.recurring.allDates = [];
  }

  // استرجاع المهام المتكررة من localStorage
  const tasksRecurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];

  // التحقق إذا كانت المهمة موجودة بالفعل في مصفوفة المهام المتكررة
  const existingTaskIndex = tasksRecurrence.findIndex((existingTask) => existingTask.id === task.id);

  if (existingTaskIndex === -1) {
    // إذا كانت المهمة جديدة، أضفها إلى المصفوفة
    tasksRecurrence.push(task);
  } else {
    // إذا كانت المهمة موجودة بالفعل، حدثها بتفاصيل التكرار الجديدة
    tasksRecurrence[existingTaskIndex] = task;
  }

  // حفظ المصفوفة المحدثة في localStorage
  localStorage.setItem('tasksRecurrence', JSON.stringify(tasksRecurrence));
}

export function calculateRecurrenceDates(task, endDate = null) {
  const recurrenceDates = [];
  const startDate = new Date(new Date().toISOString(dateSelectedCalender));

  const endRecurrenceDate = endDate ? new Date(endDate) : new Date();
  endRecurrenceDate.setFullYear(endRecurrenceDate.getFullYear() + 1);

  let rule;

  // استرجاع الأيام المختارة من حاوية الأيام
  const selectedDays = Array.from(document.querySelectorAll('#days-selection-container input:checked')).map((checkbox) => checkbox.value);

  switch (task.recurring.frequency) {
    case 'daily':
      startDate.setDate(startDate.getDate() + 1);
      rule = new RRule({
        freq: RRule.DAILY,
        dtstart: startDate,
        until: endRecurrenceDate,
      });
      break;

    case 'weekly':
      rule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: selectedDays.length ? selectedDays.map((day) => RRule[day]) : [RRule.SA],
        dtstart: startDate, // تعيين تاريخ البداية إلى startDate
        until: endRecurrenceDate,
      });
      break;

    case 'monthly':
      rule = new RRule({
        freq: RRule.MONTHLY,
        byweekday: selectedDays.length ? selectedDays.map((day) => RRule[day].nth(1)) : null, // الأسبوع الأول من كل شهر
        dtstart: startDate, // تعيين تاريخ البداية إلى startDate
        until: endRecurrenceDate,
      });
      break;

    case 'yearly':
      rule = new RRule({
        freq: RRule.YEARLY,
        bymonth: 1, // يناير
        byweekday: selectedDays.length ? selectedDays.map((day) => RRule[day].nth(1)) : null, // الأيام المختارة من الأسبوع الأول
        dtstart: new Date(startDate.getFullYear(), 0, 1), // بداية يناير
        until: endRecurrenceDate,
      });
      break;

    case 'custom':
      rule = new RRule({
        freq: RRule.DAILY,
        interval: task.recurring.interval || 1,
        byweekday: selectedDays.length ? selectedDays.map((day) => RRule[day]) : null,
        dtstart: startDate, // تعيين تاريخ البداية إلى startDate
        until: endRecurrenceDate,
      });
      break;

    default:
      return [formatDate(startDate)];
  }

  // إضافة جميع التواريخ، ثم استبعاد startDate
  const allDates = rule.all().map((date) => formatDate(date));
  const startDateStr = formatDate(startDate); // تحويل startDate إلى نص
  recurrenceDates.push(...allDates.filter((date) => date !== startDateStr)); // التصفية بناءً على نص التاريخ

  console.log('recurrenceDates', recurrenceDates);

  return recurrenceDates;
}

export function getNameTypeId() {
  // Retrieve and parse the tasksRecurrence from localStorage
  let tasksRecurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];

  // Initialize an array to hold the result
  let namTypeId = [];

  // Iterate over each task and extract the required properties
  tasksRecurrence.forEach((task) => {
    namTypeId.push({
      title: task.title,
      frequency: task.recurring.frequency,
      id: task.id,
      priority: task.priority,
    });
  });

  // Return the array containing the extracted properties
  return namTypeId;
}

export function createCards() {
  let namTypeId = getNameTypeId();
  const container = document.getElementById('cardsContainer');

  container.innerHTML = '';

  if (namTypeId.length > 0) {
    namTypeId.forEach((item) => {
      const card = document.createElement('div');
      card.className = `card ${item.priority}-priority`;
      card.setAttribute('repeat-id', item.id);

      card.innerHTML = `
<div class="card-container">
  <div class="card-content">
    <h3 class="card-title">${item.title}</h3>
    <div class="card-details">
    <i class="icon fas fa-external-link-alt"></i>
      <p class="card-frequency">Frequency: <span class ="${item.priority}-priority">${item.frequency} </span></p>
    </div>
    <div class="card-rec-delet-checkbox">
    <input type="checkbox" name="" id="delete-Complet-Tasks">
    <label for="delete-Complet-Tasks" class ='label-delete-Complet-Tasks'> deleteCompletTasks</label>
    </div>
  </div>
  <button class="delete-card-recurrence">Delete</button>
</div>

    `;

      container.appendChild(card);
    });
  } else {
    const card = document.createElement('div');
    card.innerHTML = `
    <div class="card-content" '>
      <h3>لا يوجد مهام مكررة</h3>
    </div>
  `;
    container.appendChild(card);
  }
}

export function deleteTaskRecurrence(RecurrenceId, deletCompletTask = false) {
  let Recurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];
  let taskRecurrence = Recurrence.filter((task) => task.id !== RecurrenceId);
  localStorage.setItem('tasksRecurrence', JSON.stringify(taskRecurrence));

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  if (!deletCompletTask) {
    // الحصول على جميع المهام التي تطابق RecurrenceId
    let allTasks = tasks.filter((task) => task.repeatId === RecurrenceId);
    // الحصول على المهام التي لم تكتمل
    let allTasksNotComplete = allTasks.filter((task) => !task.completed);

    // تحديث المهام:
    // - لا نعيد إضافة المهام غير المكتملة
    // - تحديث repeatId فقط للمهام التي لها repeatId موجود
    let updatedTasks = tasks.reduce((acc, task) => {
      if (allTasksNotComplete.some((notCompleteTask) => JSON.stringify(notCompleteTask) === JSON.stringify(task))) {
        // لا نعيد إضافة المهام غير المكتملة
        return acc;
      }
      // تحديث repeatId إذا كان موجوداً
      if (task.repeatId) {
        return [...acc, { ...task, repeatId: uuidv4() }];
      } else {
        task.parentRecurrence = false;
        return [...acc, task]; // إعادة إضافة المهام الأخرى كما هي
      }
    }, []);

    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  } else {
    let tasksNoRecurrence = tasks.filter((task) => task.repeatId !== RecurrenceId);

    let updateTasksNoRecurrence = tasksNoRecurrence.map((task) => {
      if(task.id === RecurrenceId) {
        task.parentRecurrence = false;
      }
      return task; // تأكد من إرجاع المهمة المعدلة أو غير المعدلة
    })
    
    localStorage.setItem('tasks', JSON.stringify(updateTasksNoRecurrence || []));
    
  }
}

export function clearTaskfromRec(RecurrenceId) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let tasksNoRecurrence = tasks.filter((task) => task.repeatId !== RecurrenceId);
  localStorage.setItem('tasks', JSON.stringify(tasksNoRecurrence));
}
