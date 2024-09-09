import {
  allSessions,
  circle,
  longBreakBtn,
  longBreakStartBtn,
  longBreakTimeSlider,
  pomodoroBtn,
  pomodoroTimerCount,
  pomodoroTimerLong,
  pomodoroTimerShort,
  remainingSessions,
  resultPomodoro,
  resultShortBreak,
  resultLongBreak,
  sessionsInput,
  sessionsText,
  shortBreakBtn,
  shortBreakStartBtn,
  shortBreakTimeSelector,
  startBtn,
  startBtnLongBreak,
  startBtnShortBreak,
  timeSelector,
  timeLabelLongeBreak,
  sliderContainerLongeBreak,
  sliderContainerShortBreak,
  freeTaskBtn,
  withTaskBtn,
  withTaskCategoryBtn,
  sliderContainerPomodoroTimer,
  longeBreakSliderValue,
} from '../elements';
import { getTaskFromLocaleStorage, toggleTaskCompletion, updateUI } from '../util';
import { dateSelectedCalender, updateCalendarHighlight } from './calender';
import { createCharts } from './charts';
let currentAudio = null; // متغير لتخزين الصوت الحالي
let intervalId;
let intervalSound;
let remainingTimePomodoro = 0;
let remainingTimeShortBreak = 0;
let remainingTimeLongeBreak = 0;
let isPaused = false;
let sessionCount = 0;
let settingsLocked = false;
let activeButton;
let pomodoroTime = 0;
let sessionsBeforeLongBreak;
let orderPomodoroCategory = 0;
let taskIdCategory = null;

export let updateTaskPomodorId = {
  taskPomodorId: null,
};

export let pomodoroConnectionStats = {
  free: true,
  withTask: false,
  withCategory: false,
};

export function saveUserSettings() {
  const autoStartBreaks = document.getElementById('auto-start-breaks')?.checked || false;
  const autoStartPomodoros = document.getElementById('auto-start-pomodoros')?.checked || false;
  const autoCheckTasks = document.getElementById('auto-check-tasks')?.checked || false;
  // const autoSwitchTasks = document.getElementById('auto-switch-tasks')?.checked || false;
  const alarmSound = document.getElementById('alarm-sound')?.value || 'digital';
  const alarmRepeat = document.getElementById('alarm-repeat')?.value || 1;
  const tickingSound = document.getElementById('ticking-sound')?.value || 'none';

  const alarmVolumeSlider = document.querySelector('.sound-slider-1');
  const tickingVolumeSlider = document.querySelector('.sound-slider-2');

  const alarmVolume = alarmVolumeSlider ? alarmVolumeSlider.value : 40;
  const tickingVolume = tickingVolumeSlider ? tickingVolumeSlider.value : 36;

  // تخزين الإعدادات في localStorage
  const userSettings = {
    autoStartBreaks,
    autoStartPomodoros,
    autoCheckTasks,
    alarmSound,
    alarmRepeat,
    tickingSound,
    alarmVolume,
    tickingVolume,
  };

  localStorage.setItem('userSettings', JSON.stringify(userSettings));

  console.log('Settings saved:', userSettings);
}

export function loadUserSettings() {
  const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

  if (savedSettings) {
    document.getElementById('auto-start-breaks').checked = savedSettings.autoStartBreaks;
    document.getElementById('auto-start-pomodoros').checked = savedSettings.autoStartPomodoros;
    document.getElementById('auto-check-tasks').checked = savedSettings.autoCheckTasks;
    // document.getElementById('auto-switch-tasks').checked = savedSettings.autoSwitchTasks;
    document.getElementById('alarm-sound').value = savedSettings.alarmSound;
    document.getElementById('alarm-repeat').value = savedSettings.alarmRepeat;
    document.getElementById('ticking-sound').value = savedSettings.tickingSound;

    document.querySelector('.sound-slider-1').value = savedSettings.alarmVolume;
    document.querySelector('.sound-slider-2').value = savedSettings.tickingVolume;

    console.log('Settings loaded:', savedSettings);
  }
}

function getMinutesHours(minutesInput, resultPosition) {
  // Convert slider value to hours and minutes
  const hours = Math.floor(minutesInput / 60);
  const minutes = Math.floor(minutesInput % 60);

  // Format minutes to always show two digits
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  // Update the display with hours and minutes
  resultPosition.textContent = `${hours}h:${formattedMinutes}m`;
}

export function saveState() {
  let state = JSON.parse(localStorage.getItem('pomodoroState')) || {};

  state.pomodoroConnectionStats = pomodoroConnectionStats;
  // state.datePomodoro = datePomodoro;
  state.pomodoroTime = timeSelector.value;
  state.remainingTimePomodoro = remainingTimePomodoro;
  state.remainingTimeShortBreak = remainingTimeShortBreak;
  state.remainingTimeLongeBreak = remainingTimeLongeBreak;
  state.sessionsBeforeLongBreak = sessionsBeforeLongBreak;
  state.sessionCount = sessionCount;
  state.shortBreakTime = shortBreakTimeSelector.value;
  state.longBreakTime = longBreakTimeSlider.value;
  state.settingsLocked = settingsLocked;
  state.activeButton = activeButton;
  state.orderPomodoroCategory = orderPomodoroCategory;
  state.taskPomodorId = updateTaskPomodorId.taskPomodorId;

  localStorage.setItem('pomodoroState', JSON.stringify(state));
}

function assingePomodoroStateValue(state) {
  pomodoroConnectionStats = state.pomodoroConnectionStats || pomodoroConnectionStats;
  remainingTimePomodoro = state.remainingTimePomodoro || 0;
  remainingTimeShortBreak = state.remainingTimeShortBreak || 0;
  remainingTimeLongeBreak = state.remainingTimeLongeBreak || 0;
  sessionCount = state.sessionCount || 0;
  sessionsBeforeLongBreak = state.sessionsBeforeLongBreak || 4;
  timeSelector.value = state.pomodoroTime || timeSelector.value;
  shortBreakTimeSelector.value = state.shortBreakTime || '5';
  longBreakTimeSlider.value = state.longBreakTime || '15';
  activeButton = state.activeButton || 'pomodoroBtn';
  orderPomodoroCategory = state.orderPomodoroCategory || 0;
  updateTaskPomodorId.taskPomodorId = state.taskPomodorId || null;

  sessionsInput.value = sessionsBeforeLongBreak || 4;
  sessionsText.textContent = `${sessionsBeforeLongBreak} جلسة`;
  // allSessions.textContent = sessionsBeforeLongBreak || sessionsInput.value;
  // remainingSessions.textContent =  parseInt(sessionCount) ;

  shortBreakTimeSelector.value = state.shortBreakTime || shortBreakTimeSelector.value;
  resultShortBreak.textContent = `m ${state.shortBreakTime || shortBreakTimeSelector.value}`;
  resultLongBreak.textContent = `m ${state.longBreakTime || longBreakTimeSlider.value}`;
}

function getActiveBtn(pomodoroConnectionStats) {
  if (pomodoroConnectionStats.free) {
    freeTaskBtn.classList.add('activeColor');
    withTaskBtn.classList.remove('activeColor');
    withTaskCategoryBtn.classList.remove('activeColor');

    if (settingsLocked) {
      freeTaskBtn.classList.remove('preventPointerEvent');
      withTaskBtn.classList.add('preventPointerEvent');
      withTaskCategoryBtn.classList.add('preventPointerEvent');
      document.querySelector('.pomodoro-icon')?.classList.add('pomodoro-icon-work');
    }
  } else if (pomodoroConnectionStats.withTask) {
    freeTaskBtn.classList.remove('activeColor');
    withTaskBtn.classList.add('activeColor');
    withTaskCategoryBtn.classList.remove('activeColor');

    if (settingsLocked) {
      freeTaskBtn.classList.add('preventPointerEvent');
      withTaskBtn.classList.remove('preventPointerEvent');
      withTaskCategoryBtn.classList.add('preventPointerEvent');
      document.querySelector('.pomodoro-icon')?.classList.add('pomodoro-icon-work');
    }
  } else {
    freeTaskBtn.classList.remove('activeColor');
    withTaskBtn.classList.remove('activeColor');
    withTaskCategoryBtn.classList.add('activeColor');

    if (settingsLocked) {
      freeTaskBtn.classList.add('preventPointerEvent');
      withTaskBtn.classList.add('preventPointerEvent');
      withTaskCategoryBtn.classList.remove('preventPointerEvent');
      document.querySelector('.pomodoro-icon')?.classList.add('pomodoro-icon-work');
    }

    document.querySelectorAll('.slider-container').forEach((slider) => {
      slider.style.display = 'none';
    });
  }
}

export function loadState() {
  const state = JSON.parse(localStorage.getItem('pomodoroState')) || {};
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  loadUserSettings();
  saveUserSettings();

  // if (state) {
  assingePomodoroStateValue(state);
  settingsLocked = state.settingsLocked || false;

  if (state.id) {
    taskIdCategory = state.id[orderPomodoroCategory] || null;
  }

  if (activeButton == 'shortBreakBtn') {
    updateMode(shortBreakBtn, pomodoroTimerShort);

    // sliderContainerShortBreak.style.display = 'none';
  } else if (activeButton == 'longBreakBtn') {
    updateMode(longBreakBtn, pomodoroTimerLong);
  } else {
    updateMode(pomodoroBtn, pomodoroTimerCount);
  }

  getActiveBtn(pomodoroConnectionStats);

  // timeSelector.value = state.pomodoroTime;
  getMinutesHours(state.pomodoroTime || timeSelector.value, resultPomodoro);

  toggleSettingsLock(settingsLocked);

  if (remainingTimePomodoro > 0 || remainingTimeShortBreak > 0 || remainingTimeLongeBreak > 0) {
    isPaused = true;

    if (remainingTimePomodoro > 0) {
      const minutes = Math.floor(remainingTimePomodoro / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const seconds = remainingTimePomodoro % 60;

      resultPomodoro.innerHTML = `${hours}h:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}m:${seconds < 10 ? '0' : ''}${seconds}s`;
      document.querySelector('.start-btn-pomodoro').textContent = 'Continue';
    }

    if (remainingTimeShortBreak > 0) {
      const minutes = Math.floor(remainingTimeShortBreak / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const seconds = remainingTimeShortBreak % 60;

      resultShortBreak.innerHTML = `${hours}h:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}m:${seconds < 10 ? '0' : ''}${seconds}s`;
      document.querySelector('.start-btn-short-break').textContent = 'Continue';
    }

    if (remainingTimeLongeBreak > 0) {
      const minutes = Math.floor(remainingTimeLongeBreak / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const seconds = remainingTimeLongeBreak % 60;

      resultLongBreak.innerHTML = `${hours}h:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}m:${seconds < 10 ? '0' : ''}${seconds}s`;
      document.querySelector('.start-btn-long-break').textContent = 'Continue';
    }
  }

  let task = tasks.find((task) => task.ConnectWithPomodor === true);
  const convertDate = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  if (task) {
    console.log(task);
    let datePomodoro = new Date(task.dueDate).toLocaleDateString();
    console.log(convertDate(datePomodoro));

    updateCalendarHighlight(convertDate(datePomodoro));
    updateUI(convertDate(datePomodoro));
    // console.log(datePomodoro);
  }
  saveState();
}

function toggleSettingsLock(lock) {
  shortBreakTimeSelector.disabled = lock;
  longBreakTimeSlider.disabled = lock;
  sessionsInput.disabled = lock;
  timeSelector.disabled = lock;
}

function convertTimeFromRangToSeconds(minutes) {
  return parseFloat(minutes) * 60;
}

export function updateMode(activeButton, activeTimer) {
  const buttons = [pomodoroBtn, shortBreakBtn, longBreakBtn];
  const timers = [pomodoroTimerCount, pomodoroTimerShort, pomodoroTimerLong];

  buttons.forEach((button) => {
    if (button === activeButton) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
      // button.classList.add('preventPointerEvent');
    }
  });

  timers.forEach((timer) => {
    if (timer === activeTimer) {
      timer.style.display = 'block';
    } else {
      timer.style.display = 'none';
    }
  });

  if (settingsLocked) {
    buttons.forEach((btn) => {
      if (!btn.classList.contains('active')) {
        btn.classList.add('preventPointerEvent');
      }
    });

    document.querySelector('.start-btn-long-break').classList.remove('hide');
    document.querySelector('.start-btn-short-break').classList.remove('hide');

    sliderContainerPomodoroTimer.style.display = 'none';
    sliderContainerShortBreak.style.display = 'none';

    sliderContainerLongeBreak.forEach((label) => {
      label.style.display = 'none';
    });

    timeLabelLongeBreak.forEach((label) => {
      label.style.display = 'none';
    });

    remainingSessions.textContent = parseInt(sessionsBeforeLongBreak) - parseInt(sessionCount);
  } else {
    document.querySelector('.start-btn-long-break').classList.add('hide');
    document.querySelector('.start-btn-short-break').classList.add('hide');

    sliderContainerPomodoroTimer.style.display = 'flex';

    sliderContainerShortBreak.style.display = 'flex';

    sliderContainerLongeBreak.forEach((label) => {
      label.style.display = 'flex';
    });

    timeLabelLongeBreak.forEach((label) => {
      label.style.display = 'flex';
    });

    remainingSessions.textContent = 0;
  }

  allSessions.textContent = sessionsBeforeLongBreak || sessionsInput.value;
  // remainingSessions.textContent = parseInt(sessionsBeforeLongBreak) - parseInt(sessionCount) || sessionsInput.value;
  // remainingSessions.textContent =  parseInt(sessionCount) ;
}

function resetSession(restIcon = true) {
  const buttons = [pomodoroBtn, shortBreakBtn, longBreakBtn];

  buttons.forEach((button) => {
    button.classList.remove('preventPointerEvent');
  });

  buttons.forEach((button) => {
    button.classList.remove('active');
  });
  pomodoroBtn.classList.add('active');

  pomodoroTimerCount.style.display = 'block';
  pomodoroTimerShort.style.display = 'none';
  pomodoroTimerLong.style.display = 'none';

  activeButton = 'pomodoroBtn';

  //remove connectwith pomodor class
  if (restIcon) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks?.forEach((task) => {
      task.ConnectWithPomodor = false;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateUI(dateSelectedCalender);
  }

  // handlePomodoroIcon(true);
  freeTaskBtn.classList.remove('preventPointerEvent');
  withTaskBtn.classList.remove('preventPointerEvent');
  withTaskCategoryBtn.classList.remove('preventPointerEvent');

  saveState();
}

function endSession() {
  const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

  clearInterval(intervalId);
  const state = JSON.parse(localStorage.getItem('pomodoroState'));

  startBtn.textContent = 'START';

  resultPomodoro.style.display = 'block';
  sessionCount++;
  // remainingSessions.textContent = parseInt(sessionsBeforeLongBreak) - parseInt(sessionCount);
  // remainingSessions.textContent =  parseInt(sessionCount) || sessionsInput.value;

  if (sessionCount >= sessionsBeforeLongBreak) {
    updateMode(longBreakBtn, pomodoroTimerLong);
    activeButton = 'longBreakBtn';
    if (savedSettings.autoStartBreaks) {
      setTimeout(() => {
        handleLongBreak();
      },  2000);
    }
  } else {
    updateMode(shortBreakBtn, pomodoroTimerShort);
    activeButton = 'shortBreakBtn';
    if (savedSettings.autoStartBreaks) {
      setTimeout(() => {
        handleShortBreak();
      },  2000);
    }
  }
  saveState();
}

function resetPomodoroState() {
  timeSelector.style.display = 'block';
  resultPomodoro.style.display = 'block';
  shortBreakTimeSelector.style.display = 'block';

  startBtn.textContent = 'START';
  startBtnShortBreak.textContent = 'START';
  startBtnLongBreak.textContent = 'START';

  resultShortBreak.textContent = shortBreakTimeSelector.value + ' m';

  isPaused = false;
  sessionCount = 0;
  settingsLocked = false;
  toggleSettingsLock(settingsLocked);

  saveState();
  const state = JSON.parse(localStorage.getItem('pomodoroState')) || {};
  assingePomodoroStateValue(state);
}

export function resetPomodoro(restIcon = true) {
  clearInterval(intervalId);

  if (intervalSound) {
    clearInterval(intervalId);
  }

  isPaused = false;

  sliderContainerShortBreak.style.display = 'flex';

  timeLabelLongeBreak.forEach((label) => {
    label.style.display = 'flex';
  });

  sliderContainerLongeBreak.forEach((slider) => {
    slider.style.display = 'flex';
  });

  activeButton = 'pomodoroBtn';

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0; // نعيد الصوت إلى البداية
  }
  resetPomodoroState();
  resetSession(restIcon);

  remainingTimePomodoro = 0;
  remainingTimeShortBreak = 0;
  remainingTimeLongeBreak = 0;
  updateMode(pomodoroBtn, pomodoroTimerCount);
  saveState();
}

export function createPomodoro(time = null) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  let state = JSON.parse(localStorage.getItem('pomodoroState'));

  if (!time && !pomodoroConnectionStats.withCategory) {
    let selectedTime = timeSelector.value;
    pomodoroTime = selectedTime;
    remainingTimePomodoro = convertTimeFromRangToSeconds(selectedTime);
    resultPomodoro.textContent = `${selectedTime}m`;
  } else if (time) {
    remainingTimePomodoro = time;
  } else {
    orderPomodoroCategory = state.orderPomodoroCategory;
    let selectedTime = state.categoriesPomodoro[orderPomodoroCategory];
    pomodoroTime = selectedTime;
    remainingTimePomodoro = convertTimeFromRangToSeconds(selectedTime);
    resultPomodoro.textContent = `${selectedTime}m`;
    taskIdCategory = state.id[orderPomodoroCategory];
  }

  sessionsBeforeLongBreak = state.sessionsBeforeLongBreak;
  settingsLocked = true;
  toggleSettingsLock(settingsLocked);

  saveState();
  startTime(remainingTimePomodoro, startBtn, timeSelector, resultPomodoro, taskIdCategory);
}

export function startTime(time, startBtn, timeSelector, resultPomodoro, taskIdCategory) {
  const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

  updateMode(pomodoroBtn, pomodoroTimerCount);
  activeButton = 'pomodoroBtn';

  if (intervalSound) {
    clearInterval(intervalId);
  }
  console.log(time);

  playAudioWithRepeat(savedSettings.tickingSound, false, savedSettings.tickingVolume, time);

  console.dir(currentAudio.currentTime);

  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    if (time > 0) {
      time--;
      remainingTimePomodoro = time;
      saveState();

      const minutes = Math.floor(remainingTimePomodoro / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      const seconds = Math.floor(remainingTimePomodoro % 60);

      resultPomodoro.innerHTML = `${hours}h : ${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}m : ${seconds < 10 ? '0' : ''}${seconds}s`;
      startBtn.textContent = 'Pause';
    } else {
      if (intervalSound) {
        clearInterval(intervalId);
      }
      const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

      playAudioWithRepeat(savedSettings.alarmSound, savedSettings.alarmRepeat, savedSettings.alarmVolume);

      startBtn.textContent = 'START';

      if (savedSettings.autoCheckTasks) {
        toggleTaskCompletion(taskIdCategory, true);
      }

      orderPomodoroCategory++;
      saveState();

      updateUI(dateSelectedCalender);
      endSession();
    }
  }, 1000);
}

export function handleShortBreak(time = null) {
  let state = JSON.parse(localStorage.getItem('pomodoroState'));
  // remainingSessions.textContent = parseInt(sessionsBeforeLongBreak) - parseInt(sessionCount) || sessionsInput.value;

  if (!time && !pomodoroConnectionStats.withCategory) {
    let selectedTime = shortBreakTimeSelector.value;
    const shortBreakTimeInSeconds = convertTimeFromRangToSeconds(selectedTime);

    resultShortBreak.textContent = `${selectedTime}m`;
    remainingTimeShortBreak = shortBreakTimeInSeconds;
  } else if (time) {
    remainingTimeShortBreak = time;
  } else {
    orderPomodoroCategory = state.orderPomodoroCategory;
    let selectedTime = state.categoriesShortBreakTimes[orderPomodoroCategory - 1];
    pomodoroTime = selectedTime;
    remainingTimeShortBreak = convertTimeFromRangToSeconds(selectedTime);
    resultPomodoro.textContent = `${selectedTime}m`;
  }

  saveState();

  startShortBreakTimer(remainingTimeShortBreak, shortBreakStartBtn, shortBreakTimeSelector, resultShortBreak);
}

export function startShortBreakTimer(time, startBtn, shortBreakTimeSelector, resultShortBreak) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
  playAudioWithRepeat(savedSettings.tickingSound, false, savedSettings.tickingVolume, time);

  intervalId = setInterval(() => {
    if (time > 0) {
      time--;
      remainingTimeShortBreak = time;
      saveState();
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      resultShortBreak.innerHTML = `${minutes}m : ${seconds < 10 ? '0' : ''}${seconds}s`;
      startBtn.textContent = 'Pause';
    } else {
      const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

      clearInterval(intervalId);
      startBtn.textContent = 'START';
      resultPomodoro.textContent = `m ${timeSelector.value}`;

      updateMode(pomodoroBtn, pomodoroTimerCount);
      activeButton = 'pomodoroBtn';
      // createPomodoro();

      if (savedSettings.autoCheckTasks) {
        toggleTaskCompletion(taskIdCategory, true);
      }

      saveState();
      //auto-play
      if (savedSettings.autoStartPomodoros) {
        setTimeout(() => {
          createPomodoro();
        },2000);
      }

      playAudioWithRepeat(savedSettings.alarmSound, savedSettings.alarmRepeat, savedSettings.alarmVolume);
    }
  }, 1000);
}

export function stopPomodoro(startBtn) {
  if (intervalId) {
    clearInterval(intervalId);
  }

  if (intervalSound) {
    clearInterval(intervalId);
  }

  if (currentAudio) {
    currentAudio.pause();
  }

  if (settingsLocked) {
    startBtn.textContent = 'Continue';
  }
}

export function handleLongBreak(time = null) {
  remainingSessions.textContent = 0;
  let state = JSON.parse(localStorage.getItem('pomodoroState'));

  if (!time && !pomodoroConnectionStats.withCategory) {
    let selectedTime = longBreakTimeSlider.value;
    const longBreakTimeInSeconds = convertTimeFromRangToSeconds(selectedTime);

    resultLongBreak.textContent = `${selectedTime}m`;
    remainingTimeLongeBreak = longBreakTimeInSeconds;
  } else if (time) {
    remainingTimeLongeBreak = time;
  } else {
    orderPomodoroCategory = 0; // Reset the category order if necessary
    let selectedTime = state.categoriesLongBreakBTime;
    const longBreakTimeInSeconds = convertTimeFromRangToSeconds(selectedTime);
    resultLongBreak.textContent = `${selectedTime}m`;
    remainingTimeLongeBreak = longBreakTimeInSeconds;
  }

  orderPomodoroCategory = 0;
  sessionCount = 0;
  saveState();

  startLongBreakTimer(remainingTimeLongeBreak, longBreakStartBtn, longBreakTimeSlider, resultLongBreak);
  timeLabelLongeBreak.forEach((label) => {
    label.style.display = 'none';
  });

  sliderContainerLongeBreak.forEach((slider) => {
    slider.style.display = 'none';
  });
}

export function startLongBreakTimer(time, startBtn, timeSelector, resultLongBreak) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  const savedSettings = JSON.parse(localStorage.getItem('userSettings'));
  playAudioWithRepeat(savedSettings.tickingSound, false, savedSettings.tickingVolume, time);

  intervalId = setInterval(() => {
    if (time > 0) {
      time--;
      remainingTimeLongeBreak = time;
      saveState();

      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      resultLongBreak.innerHTML = `${minutes}m : ${seconds < 10 ? '0' : ''}${seconds}s`;
      startBtnLongBreak.textContent = 'Pause';
    } else {
      const savedSettings = JSON.parse(localStorage.getItem('userSettings'));

      playAudioWithRepeat(savedSettings.alarmSound, savedSettings.alarmRepeat, savedSettings.alarmVolume);

      startBtnLongBreak.textContent = 'START';

      clearInterval(intervalId);
      timeSelector.style.display = 'block';
      getMinutesHours(timeSelector.value, resultPomodoro);

      shortBreakTimeSelector.style.display = 'block';

      // After long break ends, show options to start a new session
      timeLabelLongeBreak.forEach((label) => {
        label.style.display = 'flex';
      });

      sliderContainerLongeBreak.forEach((slider) => {
        slider.style.display = 'flex';
      });

      //if task free
      let state = JSON.parse(localStorage.getItem('pomodoroState'));
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      let taskIndex = tasks.findIndex((task) => task.id === updateTaskPomodorId.taskPomodorId);

      if (taskIndex !== -1) {
        tasks[taskIndex].ConnectWithPomodor = false;
        tasks[taskIndex].pomodoro.pomodoroTime += state.pomodoroTime * sessionsBeforeLongBreak;
        tasks[taskIndex].pomodoro.shortBreakTime += state.shortBreakTime * (sessionsBeforeLongBreak - 1);
        tasks[taskIndex].pomodoro.longBreakBTime += state.longBreakTime;
      }

      localStorage.setItem('tasks', JSON.stringify(tasks));

      if (savedSettings.autoCheckTasks) {
        toggleTaskCompletion(updateTaskPomodorId.taskPomodorId, true);
        toggleTaskCompletion(taskIdCategory, true);
      }

      resetSession();
      resetPomodoroState();
      updateMode(pomodoroBtn, pomodoroTimerCount);
      createCharts();
      updateUI(dateSelectedCalender);
    }
  }, 1000);
}


export function playAudioWithRepeat(audioSrc, repeatDuration, volume = 1, time = 1) {
  // إذا كان هناك صوت قيد التشغيل، نقوم بإيقافه
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  // Create a new Audio object with the provided source
  const audio = new Audio(`audio/${audioSrc}.mp3`);

  // Set the volume of the audio
  audio.volume = volume / 100; // The volume should be between 0 and 1

  // Update the currentAudio to the new audio object
  currentAudio = audio;

  // انتظر تحميل البيانات الوصفية للصوت
  audio.addEventListener('loadedmetadata', function () {
    console.log('time', time);
    console.log('currentAudio.duration', currentAudio.duration);

    let repeatCount;

    if (!repeatDuration) {
      // إذا لم يكن هناك قيمة لـ repeatDuration، نستخدم loop ونجعل الصوت يستمر لفترة محددة بواسطة time
      console.log('Repeating for duration:', time, 'seconds');

      // Play the audio
      audio.play();

      // تشغيل الصوت بدون تقطيع
      audio.loop = true;

      // إيقاف التشغيل بعد مرور المدة المطلوبة (time)
      setTimeout(() => {
        audio.loop = false; // إيقاف التشغيل التلقائي
        audio.pause(); // إيقاف الصوت
        audio.currentTime = 0; // إعادة تعيين الوقت إلى البداية
      }, time * 1000); // تحويل time من ثوانٍ إلى ميلي ثانية
    } else {
      // إذا كانت repeatDuration موجودة، نستخدمها لحساب عدد مرات التكرار
      console.log('Repeat for:', repeatDuration, 'times');

      repeatCount = repeatDuration; // عدد التكرارات

      // Play the audio
      audio.play();

      let currentRepeat = 0;

      // Set an event listener for when the audio ends to repeat it
      audio.addEventListener('ended', function () {
        currentRepeat++;
        if (currentRepeat < repeatCount) {
          audio.currentTime = 0; // إعادة التعيين للبداية
          audio.play(); // تشغيل الصوت مرة أخرى
        }
      });
    }
  });
}
