import { createCalendar, dateSelectedCalender } from './libs/calender';
import { createCharts } from './libs/charts';
import { calculateRecurrenceDates } from './libs/recurrence';
import { v4 as uuidv4 } from 'uuid';

function convertoMinutes(x) {
  return Number.parseFloat(x / 60).toFixed(2);
}

export const checkAdditionData = function (value) {
  if (value) {
    return true;
  }
};

export function removeSelectedDateFromAllDates(tasksRecurrence, selectedDate) {
  tasksRecurrence.forEach((taskRecurrence) => {
    const dateIndex = taskRecurrence.recurring.allDates.indexOf(selectedDate);

    if (dateIndex !== -1) {
      // حذف التاريخ المحدد من allDates
      taskRecurrence.recurring.allDates.splice(dateIndex, 1);

      // تحديث قائمة التواريخ في المهام
      taskRecurrence.recurring.allDates = [...taskRecurrence.recurring.allDates];
    }
  });

  // تحديث المهام المكررة في localStorage
  localStorage.setItem('tasksRecurrence', JSON.stringify(tasksRecurrence));
}

function combineDueDateWithReminderTime(dueDate, reminderDate) {
  // تقسيم dueDate لفصل التاريخ عن الوقت
  const dueDateParts = dueDate.split('T')[0]; // جزء التاريخ فقط من dueDate

  // تقسيم reminderDate لفصل الوقت عن التاريخ
  const reminderTimeParts = reminderDate.split('T')[1]; // جزء الوقت فقط من reminderDate

  // دمج التاريخ من dueDate مع الوقت من reminderDate
  const combinedDate = dueDateParts + 'T' + reminderTimeParts;

  return combinedDate;
}

function updateTasksWithRecurrence(tasks, tasksRecurrence, selectedDate) {
  tasksRecurrence.forEach((taskRecurrence) => {
    if (taskRecurrence.recurring.allDates.includes(selectedDate)) {
      taskRecurrence.repeatId = taskRecurrence.id;
      taskRecurrence.dueDate = new Date(selectedDate).toISOString();

      const taskExists = tasks.some((task) => task.repeatId === taskRecurrence.id && task.dueDate === taskRecurrence.dueDate);

      if (!taskExists) {
        // إنشاء نسخة جديدة من taskRecurrence لتجنب التعديل المباشر
        const newTaskRecurrence = { ...taskRecurrence };
        newTaskRecurrence.id = uuidv4();
        newTaskRecurrence.recurring.allDates = '';
        let date = new Date(selectedDate).toISOString();
        // console.log('combin', combineDueDateWithReminderTime(date, taskRecurrence.reminder.reminderDate));

        console.log('date', date);

        if (newTaskRecurrence.saveDateReminder && newTaskRecurrence.reminder.enabled) {
          let date = new Date(selectedDate).toISOString();
          newTaskRecurrence.reminder = {
            enabled: true,
            reminderDate: combineDueDateWithReminderTime(date, newTaskRecurrence.reminder.reminderDate),
            reminderType: null,
          };
        } else {
          newTaskRecurrence.reminder = {
            enabled: false,
            reminderDate: null,
            reminderType: null,
          };
        }

        tasks.push(newTaskRecurrence);
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    }
    // 1=> taskRecurrence.dueDate  = 2024-09-07T00:00:00.000Z
    // 2=>    taskRecurrence.reminderDate =  2024-09-06T08:40
    //result 2024-09-07T08:40
  });
}

export function updateUI(selectedDate = null) {
  // 
  console.log('selectedDate', selectedDate);

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const tasksRecurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];
  const state = JSON.parse(localStorage.getItem('pomodoroState'));

  const currentTasksContainer = document.querySelector('.tasks[data-typ="current"]');
  const completedTasksContainer = document.querySelector('.tasks[data-typ="complet"]');

  currentTasksContainer.innerHTML = `
    <h2>المهام <button class="btn-addTask" data-typ='current'>+ إضافة مهمة</button></h2>
  `;
  completedTasksContainer.innerHTML = `
    <h2>المهام المكتملة <button class="btn-addTask" data-typ="complet">+ إضافة مهمة</button></h2>
  `;

  updateTasksWithRecurrence(tasks, tasksRecurrence, selectedDate);

  const filteredTasks = selectedDate ? tasks.filter((task) => task.dueDate && task.dueDate.startsWith(selectedDate)) : tasks;

  const sortedTask = sortTasksByPriorityAndDate(filteredTasks);

  sortedTask.forEach((task) => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task', getPriorityClass(task.priority));
    taskElement.setAttribute('data-id', task.id);
    taskElement.setAttribute('repeat-id', task.repeatId);
    const repeatIcon = task.repeatId ? 'fas fa-sync-alt reminder-color' : 'fas fa-redo';
    task.ConnectWithPomodor ? taskElement.classList.add('ConnectWithPomodor') : taskElement.classList.remove('ConnectWithPomodor');
    let priority = getPriorityClass(task.priority);

    let reminderData = task.reminder.enabled ? task.reminder.reminderDate : ' تحديد تذكير';
    let customReminderData = reminderData.replace('T', ' , ');
    customReminderData = task.reminder.enabled ? customReminderData : ' تحديد تذكير';
    if (task.completed) {
      taskElement.innerHTML = `
      <div class="task-container ${priority}">
        <label class="task-label ">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-text">${task.completed ? 'مهمة مكتملة: ' : 'مهمة: '} ${task.title}</span>
        </label>
        <button class="delete-btn">حذف</button>
      </div>
      
<div class="due-date">
  <span>موعد الانتهاء: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
  <span>${task.pomodoro?.pomodoroTime ? convertoMinutes(task.pomodoro.pomodoroTime) : '0'} H 🍅</span>
</div>


            </div>
          `;
      completedTasksContainer.appendChild(taskElement);
    } else {
      taskElement.innerHTML = `
      <div class="task-container ${priority}">
        <label class="task-label ">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-text">${task.completed ? 'مهمة مكتملة: ' : 'مهمة: '} ${task.title}</span>
        </label>
        <button class="delete-btn">حذف</button>
      </div>
      
      
      <div class="due-date">
        <span>موعد الانتهاء: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
        <button class="open-close"><i class="fas fa-chevron-down"></i></button>
      </div>
      <div class="task-details" style="display: none; ">
        
        <div class="task-detail-item" data-tooltip="  ${customReminderData}"><i class="fas fa-bell ${task.reminder.enabled ? 'reminder-color' : ''} ${task.title}"></i></div>
              <div class="task-detail-item" data-tooltip=" تعديل "><i class="fas fa-pencil-alt edit-icon "></i></div>
              <div class="task-detail-item" data-tooltip="إعداد التكرار"><i class="${repeatIcon} ${task.parentRecurrence ? 'reminder-color' : ''}"></i></div>
              <div class="task-detail-item" data-tooltip="pomodoro"><i class="fas fa-stopwatch pomodoro-icon ${state.settingsLocked ? 'pomodoro-icon-work' : null}"></i></div>
            </div>
          `;
          
              // <div class="task-detail-item" data-tooltip="pomodoro"><img src="../assets/technique.png" alt="" class="task-detail-item-img ${state.settingsLocked ? 'preventPointerEvent' : null}"></div>

      currentTasksContainer.appendChild(taskElement);
    }
  });
}

function getPriorityClass(priority) {
  switch (priority) {
    case 'high':
      return 'high-priority';
    case 'medium':
      return 'medium-priority';
    case 'low':
    default:
      return 'low-priority';
  }
}

export function getCompletedTasksData() {
  // جلب المهام من localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // تصفية المهام المكتملة
  const completedTasks = tasks?.filter((task) => task.completed);

  // إنشاء كائن لتخزين عدد المهام المكتملة لكل تاريخ
  const taskCountsByDate = {};

  completedTasks.forEach((task) => {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'غير محدد';
    if (!taskCountsByDate[dueDate]) {
      taskCountsByDate[dueDate] = 0;
    }
    taskCountsByDate[dueDate]++;
  });

  // تحويل البيانات إلى مصفوفات labels و data
  const labels = Object.keys(taskCountsByDate);
  const data = Object.values(taskCountsByDate);

  console.log(labels , data);
  
  return { labels, data };
}

export function getIncompleteTasksData() {
  // جلب المهام من localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const tasksRecurrences = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];

  // إنشاء كائن لتخزين عدد المهام غير المكتملة لكل تاريخ
  const taskCountsByDate = {};

  // التعامل مع المهام العادية غير المتكررة
  tasks.forEach((task) => {
    if (!task.completed) {
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'غير محدد';
      if (!taskCountsByDate[dueDate]) {
        taskCountsByDate[dueDate] = 0;
      }
      taskCountsByDate[dueDate]++;
    }
  });

  // التعامل مع المهام المتكررة
  tasksRecurrences.forEach((recurrence) => {
    if (!recurrence.completed) {
      recurrence.recurring.allDates.forEach((date) => {
        const formattedDate = new Date(date).toLocaleDateString();
        if (!taskCountsByDate[formattedDate]) {
          taskCountsByDate[formattedDate] = 0;
        }
        taskCountsByDate[formattedDate]++;
      });
    }
  });

  // تحويل البيانات إلى مصفوفات labels و data
  const labels = Object.keys(taskCountsByDate);
  const data = Object.values(taskCountsByDate);

  return { labels, data };
}

export function getTaskFromLocaleStorage(taskId) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  return tasks.find((task) => task.id === taskId) || null;
}

export function getTaskFromRecurrenceStorage(taskId) {
  const tasksRecurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];
  return tasksRecurrence.find((task) => task.id === taskId) || null;
}

export function deleteTask(btnDelete) {
  // الحصول على العنصر الأب والذي يحتوي على المهمة كاملة
  const taskElement = btnDelete.closest('.task');

  // الحصول على معرف المهمة
  const taskId = taskElement.getAttribute('data-id');
  const selectedDate = dateSelectedCalender;
  const tasksRecurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];

  removeSelectedDateFromAllDates(tasksRecurrence, selectedDate);

  // حذف المهمة من localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter((task) => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // حذف المهمة من الصفحة
  taskElement.remove();
}

export function toggleTaskCompletion(taskId, isCompleted) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      task.completed = isCompleted;
      task.ConnectWithPomodor = false;
      const audio = new Audio(`./audio/click.mp3`);
      audio.volume = 0.3;
      audio.play();
    }
    return task;
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
  createCharts();

  
}

export function sortTasksByPriorityAndDate(tasks) {
  // تعريف ترتيب الأولويات
  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  // ترتيب المهام حسب الأولوية ثم التاريخ
  return tasks.sort((a, b) => {
    // ترتيب حسب الأولوية
    const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];

    // إذا كانت الأولوية متساوية، قم بترتيب حسب التاريخ
    if (priorityComparison === 0) {
      // تحويل التاريخ إلى كائن Date للمقارنة
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);

      // ترتيب حسب التاريخ (الأحدث أولاً)
      return dateB - dateA;
    }

    return priorityComparison;
  });
}

function taskSound(){

}
