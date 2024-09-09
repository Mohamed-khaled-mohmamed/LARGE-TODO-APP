import { createCalendar, dateSelectedCalender, updateCalendarHighlight } from './libs/calender';
import {
  btnAddTask,
  btnCancel,
  btnSubmitTask,
  inputTask,
  taskForm,
  startBtn,
  timeSelector,
  resultPomodoro,
  resultLongBreak,
  resultShortBreak,
  circle,
  startBtnShortBreak,
  startBtnLongBreak,
  pomodoroTimerShort,
  pomodoroTimerLong,
  pomodoroTimerCount,
  withTaskBtn,
  freeTaskBtn,
  timeLabelLongeBreak,
  sliderContainerLongeBreak,
  withTaskCategoryBtn,
  shortBreakBtn,
  longBreakBtn,
  shortBreakTimeSelector,
  longBreakTimeSlider,
  pomodoroBtn,
} from './elements';
import { deleteTask, getTaskFromLocaleStorage, getTaskFromRecurrenceStorage, removeSelectedDateFromAllDates, toggleTaskCompletion, updateUI } from './util';
import { createCharts } from './libs/charts';
import { clearTaskfromRec, createCards, deleteTaskRecurrence, recurrenceAppear, saveRecurrence } from './libs/recurrence';
import {
  createPomodoro,
  handleLongBreak,
  handleShortBreak,
  loadState,
  loadUserSettings,
  pomodoroConnectionStats,
  resetPomodoro,
  saveState,
  saveUserSettings,
  stopPomodoro,
  updateMode,
  updateTaskPomodorId,
} from './libs/pomodoro';
import { stringify, v4 as uuidv4 } from 'uuid';
import 'animate.css';
import { createCategory, loadCategoriesFromLocalStorage } from './libs/categotry';
import { monitorReminders, updateTaskReminder } from './libs/reminder';

let taskType = 'current';
let task;

let taskReminderId;
export let taskConnectWithPomodor = false;
function getSelectedDate() {
  let selectedDate = dateSelectedCalender ? dateSelectedCalender : new Date().toISOString().slice(0, 10);
  return selectedDate;
}

export function eventsClick(event) {
  // debugger
  if (event.target.classList.contains('open-close') || event.target.closest('.open-close')) {
    const button = event.target.closest('.open-close');
    const taskDetails = button.closest('.task').querySelector('.task-details');
    const icon = button.querySelector('i');

    if (taskDetails.style.display === 'none' || taskDetails.style.display === '') {
      taskDetails.style.display = 'flex';
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      taskDetails.style.display = 'none';
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  }

  if (event.target.classList.contains('btn-addTask')) {
    const submit = document.querySelector('.form-button-submit-task');
    const withTaskSubmit = document.querySelector('.pomodoro-with-task-button');
    submit.classList.remove('hide');
    withTaskSubmit.classList.add('hide');
    taskType = event.target.dataset.typ;
    taskOverlay.style.display = 'block';
    taskPopup.style.display = 'block';
  }
  if (event.target.classList.contains('btn-addTask')) {
    const submit = document.querySelector('.form-button-submit-task');
    const withTaskSubmit = document.querySelector('.pomodoro-with-task-button');
    document.querySelector('.button-edit-pomodoro').classList.add('hide');

    submit.classList.remove('hide');
    withTaskSubmit.classList.add('hide');
    taskType = event.target.dataset.typ;
    taskOverlay.style.display = 'block';
    taskPopup.style.display = 'block';
  }

  if (event.target.classList.contains('edit-icon')) {
    task = event.target.closest('.task');

    document.querySelector('.form-button-submit-task').classList.add('hide');
    document.querySelector('.pomodoro-with-task-button').classList.add('hide');
    document.querySelector('.button-edit-pomodoro').classList.remove('hide');
    document.querySelector('.task-addition-title').textContent = 'تعديل المهمة';

    taskType = event.target.dataset.typ;
    taskOverlay.style.display = 'block';
    taskPopup.style.display = 'block';
  }

  if (event.target.classList.contains('button-edit-pomodoro')) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let taskId = task.dataset.id;
    let taskEdit = tasks.find((task) => task.id === taskId);
    taskEdit.title = document.getElementById('taskTitle').value;
    taskEdit.priority = document.getElementById('taskPriority').value || taskEdit.priority;
    console.log(tasks);

    console.log(taskEdit);

    if (taskEdit.title) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      let selectedDate = getSelectedDate();
      updateUI(selectedDate);
      taskForm.reset();
      taskPopup.style.display = 'none';
      taskOverlay.style.display = 'none';
      document.querySelector('.task-addition-title').textContent = 'اضافة مهمة';
    } else {
      console.log('enter value');
    }
  }

  if (event.target.classList.contains('btn-cancel')) {
    document.querySelector('.task-addition-title').textContent = 'اضافة مهمة';
    taskPopup.style.display = 'none';
    taskOverlay.style.display = 'none';
    taskConnectWithPomodor = false;
  }

  if (event.target.classList.contains('delete-btn')) {
    deleteTask(event.target);
    let selectedDate = getSelectedDate();
    updateUI(selectedDate);
    // createCalendar();
    updateCalendarHighlight(selectedDate);
    createCharts();
  }

  if (event.target.classList.contains('task-checkbox')) {
    //
    const tasksRecurrence = JSON.parse(localStorage.getItem('tasksRecurrence')) || [];
    const checkbox = event.target;
    const taskElement = checkbox.closest('.task');
    const taskId = taskElement.getAttribute('data-id');

    toggleTaskCompletion(taskId, checkbox.checked);
    let selectedDate = getSelectedDate();

    updateUI(selectedDate);
    removeSelectedDateFromAllDates(tasksRecurrence, selectedDate);
    // createCalendar();
    updateCalendarHighlight(selectedDate);
    createCharts();
  }

  if (event.target.classList.contains('fa-redo') || event.target.classList.contains('fa-external-link-alt')) {
    //
    recurrenceAppear(event.target);
    const taskIcon = event.target;
    const taskElement = taskIcon.closest('.task') || taskIcon.closest('.card');

    console.log('taskElement', taskElement);

    if (taskElement.getAttribute('data-id')) {
      const taskId = taskElement.getAttribute('data-id');
      clearTaskfromRec(taskId);
      task = getTaskFromLocaleStorage(taskId);
    } else {
      const taskId = taskElement.getAttribute('repeat-id');
      clearTaskfromRec(taskId);
      task = getTaskFromRecurrenceStorage(taskId);
    }
  }

  if (event.target.classList.contains('btn-save-recurrence')) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let saveDateReminder = true;
    let selectedDate = getSelectedDate();
    console.log('task pass', task);
    // let taskPss = getTaskFromLocaleStorage(task.id);
    // taskPss.parentRecurrence = true;

    tasks.forEach((taskLocalStorage) => {
      if (task.id === taskLocalStorage.id) {
        taskLocalStorage.parentRecurrence = true;
      }
    });

    saveRecurrence(task, saveDateReminder);
    updateCalendarHighlight(selectedDate);
    createCards();
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateUI(selectedDate);
  }

  if (event.target.classList.contains('toggle-recurring')) {
    const list = document.querySelector('.cardsContainer');
    const sidebar = document.querySelector('.sidebar');

    if (list.classList.contains('animate__fadeOut')) {
      // إظهار القائمة مع أنيميشن fadeIn
      list.classList.remove('animate__fadeOut');
      list.classList.add('animate__fadeIn');
      list.style.display = 'block'; // تأكد من أن القائمة مرئية
      list.style.pointerEvents = 'auto'; // تمكين التفاعل مع القائمة

      // استدعاء دالة createCards لإعادة تحميل المهام
      createCards();

      // إظهار الـ scrollbar عند إظهار القائمة
      sidebar.classList.remove('hide-scrollbar', 'scrollbar-animation');
    } else {
      // إخفاء القائمة مع أنيميشن fadeOut
      list.style.pointerEvents = 'none';
      list.classList.remove('animate__fadeIn');
      list.classList.add('animate__fadeOut');

      // تمرير الـ scrollbar للأعلى بسلاسة
      sidebar.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // انتظار التمرير بسلاسة ثم إخفاء الـ scrollbar والقائمة
      setTimeout(() => {
        sidebar.classList.add('scrollbar-animation');

        // إخفاء القائمة بعد انتهاء الأنيميشن والتمرير
        setTimeout(() => {
          // تعطيل التفاعل مع القائمة
          sidebar.classList.add('hide-scrollbar'); // إخفاء الـ scrollbar
          list.style.display = 'none'; // إخفاء القائمة بعد الأنيميشن
        }, 500); // توقيت يتزامن مع انتهاء أنيميشن fadeOut
      }, 1000); // توقيت لتأخير اختفاء الـ scrollbar بعد التمرير بسلاسة
    }
  }

  if (event.target.classList.contains('delete-card-recurrence')) {
    const cardElement = event.target.closest('.card');
    let RecurrenceId = cardElement.getAttribute('repeat-id');
    let deletCompletTask = document.getElementById('delete-Complet-Tasks').checked;

    deleteTaskRecurrence(RecurrenceId, deletCompletTask);
    cardElement.remove();
    let selectedDate = getSelectedDate();
    updateCalendarHighlight(selectedDate);
    updateUI(selectedDate);
    createCards();
  }

  if (event.target.classList.contains('mode')) {
    const buttons = document.querySelectorAll('.mode');
    buttons.forEach((btn) => btn.classList.remove('active'));

    event.target.classList.add('active');

    const mode = event.target.dataset.mode;
    document.querySelector('.start-btn-long-break').classList.add('hide');
    document.querySelector('.start-btn-short-break').classList.add('hide');
    switch (mode) {
      case 'pomodoro':
        pomodoroTimerCount.style.display = 'block';
        pomodoroTimerShort.style.display = 'none';
        pomodoroTimerLong.style.display = 'none';
        // updateMode(pomodoroBtn, pomodoroTimerCount);

        break;
      case 'short-break':
        pomodoroTimerCount.style.display = 'none';
        pomodoroTimerShort.style.display = 'block';
        pomodoroTimerLong.style.display = 'none';
        // updateMode(shortBreakBtn, pomodoroTimerShort);

        break;
      case 'long-break':
        pomodoroTimerCount.style.display = 'none';
        pomodoroTimerShort.style.display = 'none';
        pomodoroTimerLong.style.display = 'block';
        // updateMode(longBreakBtn, pomodoroTimerLong);
        break;
    }
  }

  if (event.target.classList.contains('start-btn-pomodoro')) {
    let pomodoroState = JSON.parse(localStorage.getItem('pomodoroState'));
    let remainingTimePomodoro = pomodoroState ? pomodoroState.remainingTimePomodoro : null;

    const appearBtn = () => {
      let allBtn = document.querySelectorAll('.add-category-button');
      allBtn.forEach((btn) => {
        btn.classList.remove('hide');
      });
    };
    const updateTasksWithPomodoro = (allIdConnect, tasks) => {
      // ;
      tasks.forEach((task) => {
        if (allIdConnect.includes(task.id.toString())) {
          task.ConnectWithPomodor = false;
        }
      });

      // تحديث المهام في localStorage بعد التعديل
      localStorage.setItem('tasks', JSON.stringify(tasks));
      let selectedDate = getSelectedDate();
      updateUI(selectedDate);
    };

    const getAllIdConnect = () => {
      let allIds = [];
      let allConnectWithPomodor = document.querySelectorAll('.ConnectWithPomodor');
      allConnectWithPomodor.forEach((task) => {
        allIds.push(task.dataset.id);
      });
      return allIds;
    };

    const handleStart = () => {
      createPomodoro(remainingTimePomodoro);
      saveState();
    };

    const handlePause = () => {
      stopPomodoro(event.target);
      saveState();
    };

    const handelPreventMode = (mode) => {
      if (mode === 'free') {
        freeTaskBtn.classList.remove('preventPointerEvent');
        withTaskBtn.classList.add('preventPointerEvent');
        withTaskCategoryBtn.classList.add('preventPointerEvent');
      } else if (mode === 'with-task') {
        freeTaskBtn.classList.add('preventPointerEvent');
        withTaskBtn.classList.remove('preventPointerEvent');
        withTaskCategoryBtn.classList.add('preventPointerEvent');
      } else {
        freeTaskBtn.classList.add('preventPointerEvent');
        withTaskBtn.classList.add('preventPointerEvent');
        withTaskCategoryBtn.classList.remove('preventPointerEvent');
      }
    };
    const handleTaskPomodoro = () => {
      if (!pomodoroState.settingsLocked) {
        taskType = 'current';
        taskOverlay.style.display = 'block';
        taskPopup.style.display = 'block';
        taskConnectWithPomodor = true;

        const submit = document.querySelector('.form-button-submit-task');
        const withTaskSubmit = document.querySelector('.pomodoro-with-task-button');
        document.querySelector('.button-edit-pomodoro').classList.add('hide');

        submit.classList.add('hide');
        withTaskSubmit.classList.remove('hide');

        let allIdConnect = getAllIdConnect();
        withTaskSubmit.addEventListener(
          'click',
          (e) => {
            // ;
            handelPreventMode('with-task');

            createTaskHtml(e);
            handleStart();
            let tasks = JSON.parse(localStorage.getItem('tasks'));
            updateTasksWithPomodoro(allIdConnect, tasks);
            return;
          },
          { once: true }
        );
      } else {
        handelPreventMode('with-task');
        handleStart();
      }
    };

    const handleCategoryPomodoro = () => {
      if (!pomodoroState.settingsLocked) {
        const openResults = document.querySelector('.custom-btn-open-results');
        const btnAddTopage = document.querySelectorAll('.add-category-button');

        let allIdConnect = getAllIdConnect();

        // openResults.click();
        document.querySelector('.custom-category-form').reset();
        document.querySelector('.custom-modal-results').classList.add('show');

        Array.from(btnAddTopage).forEach((btn) => {
          btn.addEventListener(
            'click',
            () => {
              handelPreventMode('with-task-category');

              console.log(allIdConnect);

              handleStart();
              let tasks = JSON.parse(localStorage.getItem('tasks'));
              updateTasksWithPomodoro(allIdConnect, tasks);
              return;
            },
            { once: true }
          );
        });
      } else {
        handelPreventMode('with-task-category');
        handleStart();
      }
    };

    if (event.target.textContent === 'START') {
      if (pomodoroConnectionStats.free) {
        handelPreventMode('free');
        let selectedDate = getSelectedDate();
        handleStart();
        updateUI(selectedDate);
      } else if (pomodoroConnectionStats.withTask) {
        handleTaskPomodoro();
      } else {
        appearBtn();
        handleCategoryPomodoro();
      }
    } else if (event.target.textContent === 'Pause') {
      handlePause();
    } else {
      handleStart();
    }
  }

  if (event.target.classList.contains('pomodoro-icon')) {
    let pomodoroState = JSON.parse(localStorage.getItem('pomodoroState')) || [];

    let tasksLocalStorage = JSON.parse(localStorage.getItem('tasks'));

    // let remainingTimePomodoro = pomodoroState ? pomodoroState.remainingTimePomodoro : null;
    let taskElement = event.target.closest('.task');

    let taskId = taskElement.dataset.id;
    // ;
    tasksLocalStorage.forEach((task) => {
      if (task.id === taskId) {
        task.ConnectWithPomodor = true;
        task.id = uuidv4();
        taskElement.dataset.id = task.id;
        taskId = task.id;
        task.pomodoro = {
          pomodoroTime: parseFloat(timeSelector.value),
          shortBreakTime: parseFloat(shortBreakTimeSelector.value),
          longBreakBTime: parseFloat(longBreakTimeSlider.value),
        };
        localStorage.setItem('tasks', JSON.stringify(tasksLocalStorage));
        let SelectedDate = getSelectedDate();
        updateUI(SelectedDate);
      } else {
        task.ConnectWithPomodor = false;
        localStorage.setItem('tasks', JSON.stringify(tasksLocalStorage));
        let SelectedDate = getSelectedDate();
        updateUI(SelectedDate);
      }
    });

    updateTaskPomodorId.taskPomodorId = taskId;

    withTaskBtn.classList.add('activeColor');
    freeTaskBtn.classList.remove('activeColor');
    withTaskCategoryBtn.classList.remove('activeColor');

    freeTaskBtn.classList.add('preventPointerEvent');
    withTaskBtn.classList.remove('preventPointerEvent');
    withTaskCategoryBtn.classList.add('preventPointerEvent');

    document.querySelectorAll('.slider-container').forEach((slider) => {
      slider.style.display = 'flex';
    });

    // resetPomodoro(false);

    pomodoroConnectionStats.withCategory = false;
    pomodoroConnectionStats.free = false;
    pomodoroConnectionStats.withTask = true;

    saveState();

    const handleStart = () => {
      createPomodoro();
      saveState();
    };

    const handleTaskPomodoro = () => {
      if (!pomodoroState.settingsLocked) {
        handleStart();
      } else {
        handleStart();
      }
    };

    const handlePause = () => {
      stopPomodoro(event.target);
      saveState();
    };

    if (startBtn.textContent === 'START') {
      handleTaskPomodoro();
      document.querySelector('.pomodoro-icon').classList.add('pomodoro-icon-work');
    } else if (startBtn.textContent === 'Pause') {
      handlePause();
    } else {
      handleStart();
    }
  }

  if (event.target.classList.contains('start-btn-short-break')) {
    if (event.target.textContent === 'START') {
      handleShortBreak();
      // event.target.textContent = 'Pause';
      saveState();
    } else if (event.target.textContent === 'Pause') {
      stopPomodoro(event.target);

      saveState();
    } else {
      let state = JSON.parse(localStorage.getItem('pomodoroState'));
      let remainingTimeShortBreak = state.remainingTimeShortBreak;
      handleShortBreak(remainingTimeShortBreak);
    }
  }

  if (event.target.classList.contains('start-btn-long-break')) {
    //
    updateMode(longBreakBtn, pomodoroTimerLong);
    if (event.target.textContent === 'START') {
      handleLongBreak(); // event.target.textContent = 'Pause';
      saveState();
    } else if (event.target.textContent === 'Pause') {
      stopPomodoro(event.target);

      saveState();
    } else {
      let state = JSON.parse(localStorage.getItem('pomodoroState'));
      let remainingTimeLongeBreak = state.remainingTimeLongeBreak;
      handleLongBreak(remainingTimeLongeBreak);
    }
  }

  if (event.target.classList.contains('reset-pomodoro-btn')) {
    document.querySelectorAll('.slider-container').forEach((slider) => {
      slider.style.display = 'flex';
    });
    resetPomodoro();

    freeTaskBtn.classList.remove('preventPointerEvent');
    withTaskBtn.classList.remove('preventPointerEvent');
    withTaskCategoryBtn.classList.remove('preventPointerEvent');
  }

  if (event.target.classList.contains('free-task')) {
    // resetPomodoro();
    if (!event.target.classList.contains('activeColor')) {
      event.target.classList.add('activeColor');
      withTaskBtn.classList.remove('activeColor');
      withTaskCategoryBtn.classList.remove('activeColor');
      document.querySelector('.reset-pomodoro-btn').click();
      pomodoroConnectionStats.withCategory = false;
      pomodoroConnectionStats.free = true;
      pomodoroConnectionStats.withTask = false;
      saveState();
    }
    // document.querySelectorAll('.slider-container').forEach((slider) => {
    //   slider.style.display = 'flex';
    // });
    // resetPomodoro();
  }

  if (event.target.classList.contains('with-task')) {
    // ;
    // resetPomodoro();
    if (!event.target.classList.contains('activeColor')) {
      event.target.classList.add('activeColor');
      freeTaskBtn.classList.remove('activeColor');
      withTaskCategoryBtn.classList.remove('activeColor');
      document.querySelector('.reset-pomodoro-btn').click();
      pomodoroConnectionStats.withCategory = false;
      pomodoroConnectionStats.free = false;
      pomodoroConnectionStats.withTask = true;
      saveState();
    }
  }

  if (event.target.classList.contains('with-task-category')) {
    // resetPomodoro();
    if (!event.target.classList.contains('activeColor')) {
      event.target.classList.add('activeColor');
      freeTaskBtn.classList.remove('activeColor');
      withTaskBtn.classList.remove('activeColor');
      document.querySelector('.reset-pomodoro-btn').click();
      pomodoroConnectionStats.withCategory = true;
      pomodoroConnectionStats.free = false;
      pomodoroConnectionStats.withTask = false;
      document.querySelectorAll('.slider-container').forEach((slider) => {
        slider.style.display = 'none';
      });
      saveState();
    }

    // document.querySelectorAll('.slider-container').forEach((slider) => {
    //   slider.style.display = 'flex';
    // });
    // resetPomodoro();
  }

  //btns

  if (event.target.classList.contains('increase-btn-sessions')) {
    const slider = document.getElementById('sessions-before-long-break');
    if (parseInt(slider.value) < parseInt(slider.max)) {
      slider.value = parseInt(slider.value, 10) + 1;
      updateSessionsSlider();
    }
  }

  if (event.target.classList.contains('decrease-btn-sessions')) {
    const slider = document.getElementById('sessions-before-long-break');
    if (parseInt(slider.value) > parseInt(slider.min)) {
      slider.value = parseInt(slider.value, 10) - 1;
      updateSessionsSlider();
    }
  }

  if (event.target.classList.contains('increase-btn-long-break')) {
    const slider = document.querySelector('.time-slider-long-break-duration');
    if (parseInt(slider.value) < parseInt(slider.max)) {
      slider.value = parseInt(slider.value, 10) + 1;
      updateLongBreakSlider();
    }
  }

  if (event.target.classList.contains('decrease-btn-long-break')) {
    const slider = document.querySelector('.time-slider-long-break-duration');
    if (parseInt(slider.value) > parseInt(slider.min)) {
      slider.value = parseInt(slider.value, 10) - 1;
      updateLongBreakSlider();
    }
  }

  if (event.target.classList.contains('increase-btn-short-break')) {
    const slider = document.querySelector('.time-slider-short-break-duration');
    if (parseInt(slider.value) < parseInt(slider.max)) {
      slider.value = parseInt(slider.value, 10) + 1;
      updateShortBreakSlider();
    }
  }
  if (event.target.classList.contains('decrease-btn-short-break')) {
    const slider = document.querySelector('.time-slider-short-break-duration');
    if (parseInt(slider.value) > parseInt(slider.min)) {
      slider.value = parseInt(slider.value, 10) - 1;
      updateShortBreakSlider();
    }
  }
  if (event.target.classList.contains('decrease-btn-pomodoro')) {
    const slider = document.querySelector('.pomodoro-duration');
    if (parseInt(slider.value) > parseInt(slider.min)) {
      slider.value = parseInt(slider.value, 10) - 1;
      updatePomodoroSlider();
    }
  }
  if (event.target.classList.contains('increase-btn-pomodoro')) {
    const slider = document.querySelector('.pomodoro-duration');
    if (parseInt(slider.value) < parseInt(slider.max)) {
      slider.value = parseInt(slider.value, 10) + 1;
      updatePomodoroSlider();
    }
  }

  //settings
  if (event.target.classList.contains('settings-modal')) {
    event.target.style.display = 'none';
    document.body.style.overflow = 'auto';
    saveUserSettings();
  }

  if (event.target.classList.contains('settings-icon')) {
    const modal = document.querySelector('.settings-modal');
    modal.style.display = 'flex';
  }

  if (event.target.classList.contains('close-button')) {
    const modal = document.querySelector('.settings-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    saveUserSettings();
  }

  //catogeris
  if (event.target.classList.contains('custom-btn-open-form')) {
    document.querySelector('.custom-modal').classList.add('show');
  }

  if (event.target.classList.contains('custom-btn-close')) {
    document.querySelector('.custom-modal').classList.remove('show');
    const submitButton = document.querySelector('.custom-btn-submit-edit-category');
    const submitforme = document.querySelector('.custom-btn-submit');
    submitButton.classList.add('hide');
    submitforme.classList.remove('hide');
  }

  if (event.target.classList.contains('custom-btn-open-results')) {
    const hideBtn = () => {
      let allBtn = document.querySelectorAll('.add-category-button');
      allBtn.forEach((btn) => {
        btn.classList.add('hide');
      });
    };

    hideBtn();
    document.querySelector('.custom-category-form').reset();
    document.querySelector('.custom-modal-results').classList.add('show');
  }

  if (event.target.classList.contains('custom-btn-close-results')) {
    document.querySelector('.custom-modal-results').classList.remove('show');
  }
  if (event.target.classList.contains('custom-btn-add-task')) {
    const tasksContainer = document.querySelector('.custom-tasks-container');
    const taskHtml = `
        <div class="custom-task">
            <label>اسم المهمة :</label>
            <input type="text" class="custom-input-task-name" required>
  
            <label>وقت المهمة (دقائق):</label>
            <input type="number" class="custom-input-task-time" required min ="1">
  
            <label>استراحة قصيرة (دقائق):</label>
            <input type="number" class="custom-input-short-break" required min ="1">
            <button type="button" class="custom-btn-delete-task">حذف المهمة</button>
        </div>
      `;
    tasksContainer.insertAdjacentHTML('beforeend', taskHtml);
  }

  if (event.target.classList.contains('custom-btn-delete-task')) {
    event.target.parentElement.remove();
  }

  if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
    // playAudioWithRepeat(sound.mouseClickSound, 1);
  }

  if (event.target.tagName === 'BUTTON') {
    // playAudioWithRepeat(sound.mouseClickSound, 1);
  }

  if (event.target.classList.contains('fa-bell')) {
    document.getElementById('reminder-popup').classList.toggle('show');
    document.getElementById('reminder-overlay').classList.toggle('show');

    let task = event.target.closest('.task');
    taskReminderId = task.dataset.id;
    console.log(task);
  }
  if (event.target.classList.contains('cancel-button-reminder')) {
    document.getElementById('reminder-popup').classList.remove('show');
    document.getElementById('reminder-overlay').classList.remove('show');
  }
  if (event.target.classList.contains('reminder-overlay')) {
    document.getElementById('reminder-popup').classList.remove('show');
    document.getElementById('reminder-overlay').classList.remove('show');
  }

  if (event.target.classList.contains('chartCheckBox')) {
    createCharts();
  }
}

export function eventsInput(event) {
  if (event.target.classList.contains('time-slider-long-break-duration')) {
    const sliderValue = event.target.value;
    // Convert slider value to minutes and seconds
    const minutes = Math.floor(sliderValue);
    const seconds = Math.floor(sliderValue % 1) * 60;
    resultLongBreak.textContent = `m ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    // Optionally save the value to local storage
    // localStorage.setItem('longBreakDuration', sliderValue);
    saveState();
  }

  //
  if (event.target.classList.contains('sessions-slider')) {
    const sessionsSlider = document.getElementById('sessions-before-long-break');
    const sessionsValue = document.getElementById('sessions-slider-value');
    const allSessions = document.querySelector('.all-session-value');
    const remainingSessions = document.querySelector('.remaining-sessions-value');

    const value = sessionsSlider.value;
    sessionsValue.textContent = `${value} جلسه`;
    allSessions.textContent = value;
    remainingSessions.textContent = value;

    // Save to local storage
    // ;
    let state = JSON.parse(localStorage.getItem('pomodoroState')) || {};
    // تأكد أن state هو كائن قبل محاولة تحديث خصائصه
    if (typeof state !== 'object' || state === null) {
      state = {};
    }
    state.sessionsBeforeLongBreak = value;
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }

  if (event.target.classList.contains('time-slider-short-break-duration')) {
    // let shortBreakSliderValue = document.querySelector('#short-break-slider-value');
    const sliderValue = event.target.value;
    // Convert slider value to minutes and seconds
    const minutes = Math.floor(sliderValue);
    const seconds = Math.floor(sliderValue % 1) * 60;
    resultShortBreak.textContent = `m ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    saveState();
  }

  if (event.target.classList.contains('pomodoro-duration')) {
    const sliderValue = event.target.value;

    // Convert slider value to hours and minutes
    const hours = Math.floor(sliderValue / 60);
    const minutes = Math.floor(sliderValue % 60);

    // Format minutes to always show two digits
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    // Update the display with hours and minutes
    resultPomodoro.textContent = `${hours}h:${formattedMinutes}m`;
    saveState();
  }
}
export function eventsChange(event) {
  if (event.target.classList.contains('recurrence-type')) {
    const customIntervalContainer = document.getElementById('custom-interval-container');
    const daysSelectionContainer = document.getElementById('days-selection-container');

    if (event.target.value === 'custom') {
      customIntervalContainer.classList.remove('hide');
    } else if (event.target.value === 'weekly' || event.target.value === 'monthly' || event.target.value === 'yearly') {
      customIntervalContainer.classList.add('hide');
      daysSelectionContainer.classList.remove('hide');
    } else {
      customIntervalContainer.classList.add('hide');
      daysSelectionContainer.classList.add('hide');
    }
  }
}

/* start APP*/

export function createTaskHtml(event) {
  event.preventDefault();
  let selectedDate = getSelectedDate();

  const task = {
    id: uuidv4(), // استخدام تاريخ الآن كمعرف فريد
    title: document.getElementById('taskTitle').value,
    description: 'لا يوجد وصف',
    dueDate: new Date(selectedDate).toISOString() ? new Date(selectedDate).toISOString() : new Date().toISOString(),
    priority: document.getElementById('taskPriority').value || 'low',
    ConnectWithPomodor: taskConnectWithPomodor,
    completed: taskType === 'complet',
    category: 'عام',
    tags:
      // document
      //   .getElementById('taskTags')
      //   .value.split(',')
      //   .map((tag) => tag.trim()) || [],
      [],
    reminder: {
      enabled: false,
      reminderDate: null,
      reminderType: null,
    },
    recurring: {
      enabled: false,
      frequency: null,
      endDate: null,
    },
    subtasks: [],
    sharedWith: [],
    timeTracking: {
      enabled: false,
      timeSpent: 0,
    },
    customization: {
      color: '#33FF57',
      order: 0, // يمكن تخصيص هذا لاحقًا
    },
    pomodoro: {
      pomodoroTime: '',
      shortBreakTime: '',
      longBreakBTime: '',
    },
  };

  taskConnectWithPomodor ? (updateTaskPomodorId.taskPomodorId = task.id) : (updateTaskPomodorId.taskPomodorId = null);
  // console.log(taskPomodorId);

  // حفظ المهمة في localStorage
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  // إعادة تعيين النموذج وإخفاء الـ popup
  taskForm.reset();
  taskPopup.style.display = 'none';
  taskOverlay.style.display = 'none';
  taskConnectWithPomodor = false;
  // createCharts()

  // createCalendar();
  saveState();
  updateCalendarHighlight(selectedDate);
  updateUI(selectedDate);

  // createCharts();
}
// save tasks in localStorage

export function reminderForm(e) {
  e.preventDefault();

  // const enabled = document.getElementById('reminder-enabled').checked;
  const reminderDate = document.getElementById('reminder-date').value;
  // const reminderType = document.getElementById('reminder-type').value;

  // Call function to update the task with reminder data
  updateTaskReminder(
    {
      enabled: true,
      reminderDate: reminderDate,
      reminderType: 'masseage',
    },
    taskReminderId
  );

  let selectedDate = getSelectedDate();
  updateUI(selectedDate);
  // Hide the popup
  document.getElementById('reminder-popup').classList.remove('show');
  document.getElementById('reminder-overlay').classList.remove('show');
}

//btns
function updateSessionsSlider() {
  const sessionsSlider = document.getElementById('sessions-before-long-break');
  const sessionsValue = document.getElementById('sessions-slider-value');
  const allSessions = document.querySelector('.all-session-value');
  const remainingSessions = document.querySelector('.remaining-sessions-value');

  const value = sessionsSlider.value;
  sessionsValue.textContent = `${value} جلسه`;
  allSessions.textContent = value;
  remainingSessions.textContent = value;

  // Save to local storage
  // ;
  let state = JSON.parse(localStorage.getItem('pomodoroState')) || {};
  // تأكد أن state هو كائن قبل محاولة تحديث خصائصه
  if (typeof state !== 'object' || state === null) {
    state = {};
  }
  state.sessionsBeforeLongBreak = value;
  localStorage.setItem('pomodoroState', JSON.stringify(state));
  saveState();
}

function updateLongBreakSlider() {
  const slider = document.querySelector('.time-slider-long-break-duration');
  const minutes = Math.floor(slider.value);
  const seconds = Math.floor(slider.value % 1) * 60;
  resultLongBreak.textContent = `${minutes}m:${seconds < 10 ? '0' : ''}${seconds}s`;
  saveState();
}

function updateShortBreakSlider() {
  const slider = document.querySelector('.time-slider-short-break-duration');
  const minutes = Math.floor(slider.value);
  const seconds = Math.floor(slider.value % 1) * 60;
  resultShortBreak.textContent = `${minutes}m:${seconds < 10 ? '0' : ''}${seconds}s`;
  saveState();
}

function updatePomodoroSlider() {
  const slider = document.querySelector('.pomodoro-duration');
  const hours = Math.floor(slider.value / 60);
  const minutes = Math.floor(slider.value % 60);
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  resultPomodoro.textContent = `${hours}h:${formattedMinutes}m`;
  saveState();
}
