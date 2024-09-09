import { v4 as uuidv4 } from 'uuid';
import { toggleTaskCompletion, updateUI } from '../util';
import { dateSelectedCalender } from './calender';
import { createPomodoro, handleShortBreak, saveState, startLongBreakTimer, startShortBreakTimer, startTime, stopPomodoro, updateMode } from './pomodoro';
import {
  longBreakBtn,
  longBreakStartBtn,
  longBreakTimeSlider,
  pomodoroBtn,
  pomodoroTimerCount,
  pomodoroTimerLong,
  pomodoroTimerShort,
  resultLongBreak,
  resultPomodoro,
  resultShortBreak,
  shortBreakBtn,
  shortBreakTimeSelector,
  startBtn,
  timeSelector,
} from '../elements';
let taskCounter = 1;
let intervalId;
let remainingTimePomodoro = 0;
let remainingTimeShortBreak = 0;
let remainingTimeLongeBreak = 0;
let isPaused = false;
let sessionCount = 0;
let settingsLocked = false;
let activeButton;
let pomodoroTime = 0;
// export let taskPomodorId;
let typCategory = true;
let sessionsBeforeLongBreak;

export function saveCategoryToLocalStorage(category) {
  const categories = getCategoriesFromLocalStorage();
  categories.push(category);
  updateCategoriesInLocalStorage(categories);
}

function getCategoriesFromLocalStorage() {
  return JSON.parse(localStorage.getItem('categories')) || [];
}

function updateCategoriesInLocalStorage(categories) {
  localStorage.setItem('categories', JSON.stringify(categories));
}

export function loadCategoriesFromLocalStorage() {
  const categories = getCategoriesFromLocalStorage();
  clearCategoryList();

  categories.forEach((category, index) => {
    const categoryContainer = createCategoryElement(category, index);

    // إضافة الأزرار الخاصة بالإجراءات إلى كل فئة
    // addSelectAndAddButtons(categoryContainer, index); // هذا يستدعي زر "إضافة للصفحة" وزر "حذف"

    appendCategoryToList(categoryContainer);
  });

  loadSelectedCategory();
}

function clearCategoryList() {
  document.querySelector('#customCategoryList').innerHTML = '';
}

function createCategoryElement(category, index) {
  const categoryContainer = document.createElement('div');
  categoryContainer.classList.add('custom-category-container');

  const categoryTitle = document.createElement('div');
  categoryTitle.classList.add('custom-category-title');
  categoryTitle.textContent = `الفئة: ${category.name}`;

  const tasksList = createTasksList(category.tasks);

  // جعل الفئة قابلة للنقر لاختيارها وإضافتها للصفحة
  // categoryContainer.addEventListener('click', () => {
  //   selectCategory(index);
  //   addCategoryToPage();
  // });

  categoryContainer.appendChild(categoryTitle);
  categoryContainer.appendChild(tasksList);
  // categoryContainer.appendChild(createEditButton(index)); // إضافة زر التعديل
  addSelectAndAddButtons(categoryContainer, index); // هذا يستدعي زر "إضافة للصفحة" وزر "حذف"

  return categoryContainer;
}

function createTasksList(tasks) {
  // تأكد من أن `tasks` موجودة وتحتوي على عناصر
  if (tasks && Array.isArray(tasks)) {
    const tasksHtml = tasks.map((task) => createTaskHtml(task)).join('');
    const tasksList = document.createElement('div');
    tasksList.classList.add('custom-tasks-list');
    tasksList.innerHTML = tasksHtml;
    return tasksList;
  } else {
    console.error('Tasks are undefined or not an array.');
    return document.createElement('div'); // إرجاع عنصر فارغ كخيار افتراضي
  }
}
function createTaskHtml(task) {
  return `
    <div class="custom-task-circle">
      <div class="custom-task-details">
        <div class="custom-task-name">${task.name}</div>
        <div class="custom-task-time">${task.time} دقيقة</div>
      </div>
      <div class="custom-task-rest">
        <div class="custom-task-rest-time">${task.shortBreak} دقيقة</div>
      </div>
    </div>
  `;
}

function createEditButton(index) {
  const editButton = document.createElement('button');
  editButton.textContent = 'تعديل الفئة';
  editButton.classList.add('edit-category-button');
  editButton.addEventListener('click', (e) => {
    e.stopPropagation(); // منع اختيار الفئة عند الضغط على زر التعديل
    editCategory(index);
  });
  return editButton;
}

function selectCategory(index) {
  const categoryElements = document.querySelectorAll('.custom-category-container');

  // تأكد من وجود العنصر المحدد قبل محاولة الوصول إليه
  if (categoryElements[index]) {
    categoryElements.forEach((container) => {
      container.classList.remove('selected-category');
    });

    categoryElements[index].classList.add('selected-category');
    localStorage.setItem('selectedCategoryIndex', index);
  } else {
    console.error(`Category element at index ${index} not found.`);
  }
}

function addCategoryToPage() {
  const selectedCategoryIndex = localStorage.getItem('selectedCategoryIndex');
  const allTasksCategory = getCategoriesFromLocalStorage();
  const newCategory = addCategotyTaskToTasksInLocaleStorge(allTasksCategory[selectedCategoryIndex]);
  startPomodorCategories(allTasksCategory[selectedCategoryIndex]);
  updateUI(dateSelectedCalender);
}

function appendCategoryToList(categoryContainer) {
  document.querySelector('#customCategoryList').appendChild(categoryContainer);
}

function loadSelectedCategory() {
  const selectedCategoryIndex = localStorage.getItem('selectedCategoryIndex');
  if (selectedCategoryIndex !== null) {
    const selectedCategory = document.querySelector('#customCategoryList').children[selectedCategoryIndex];
    if (selectedCategory) {
      selectedCategory.classList.add('selected-category');
    }
  }
}

export function createCategory(e) {
  e.preventDefault();

  const categoryName = document.querySelector('.custom-input-category-name').value;
  // const longBreak = document.querySelector('.custom-input-long-break').value;
  const taskNames = document.querySelectorAll('.custom-input-task-name');
  const taskTimes = document.querySelectorAll('.custom-input-task-time');
  const shortBreaks = document.querySelectorAll('.custom-input-short-break');

  const tasks = Array.from(taskNames).map((taskName, index) => {
    return {
      name: taskName.value,
      time: taskTimes[index].value,
      shortBreak: shortBreaks[index].value,
      id: uuidv4(),
    };
  });

  const category = {
    name: categoryName,
    // longBreak: longBreak,
    tasks: tasks,
  };

  // حفظ الفئة الجديدة في الـ localStorage
  saveCategoryToLocalStorage(category);

  const categoryList = document.querySelector('#customCategoryList');
  const categoryContainer = document.createElement('div');
  categoryContainer.classList.add('custom-category-container');

  const categoryTitle = document.createElement('div');
  categoryTitle.classList.add('custom-category-title');
  // categoryTitle.textContent = `الفئة: ${categoryName} (استراحة طويلة: ${longBreak} دقائق)`;

  const tasksHtml = tasks
    .map((task) => {
      return `
        <div class="custom-task-circle">
            <div class="custom-task-details">
                <div class="custom-task-name">${task.name}</div>
                <div class="custom-task-time">${task.time} دقيقة</div>
            </div>
            <div class="custom-task-rest">
                <div class="custom-task-rest-time">${task.shortBreak} دقيقة</div>
            </div>
        </div>
    `;
    })
    .join('');

  const tasksList = document.createElement('div');
  tasksList.classList.add('custom-tasks-list');
  tasksList.innerHTML = tasksHtml;

  categoryContainer.appendChild(categoryTitle);
  categoryContainer.appendChild(tasksList);

  addSelectAndAddButtons(categoryContainer, categoryList.children.length);

  categoryList.appendChild(categoryContainer);

  // Reset form
  document.querySelector('.custom-category-form').reset();
  document.querySelector('.custom-modal').classList.remove('show');
  taskCounter = 1;
  document.querySelector('.custom-tasks-container').innerHTML = '<h3>المهام</h3>';
}

function createDeleteButton(index) {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'حذف الفئة';
  deleteButton.classList.add('delete-category-button');
  deleteButton.addEventListener('click', () => deleteCategory(index));
  return deleteButton;
}

function createAddButton(index) {
  const addButton = document.createElement('button');
  addButton.textContent = 'إضافة للصفحة';
  addButton.classList.add('add-category-button', 'hide');
  addButton.addEventListener('click', () => {
    selectCategory(index); // اختيار الفئة
    addCategoryToPage(); // إضافة الفئة للصفحة
    document.querySelector('.custom-category-form').reset();
    document.querySelector('.custom-modal-results').classList.remove('show');
  });
  return addButton;
}

function deleteCategory(index) {
  // debugger;
  const categories = getCategoriesFromLocalStorage();
  categories.splice(index, 1);
  updateCategoriesInLocalStorage(categories);

  // إعادة تحميل الفئات بعد الحذف
  loadCategoriesFromLocalStorage();
}

/*
function editCategory(index) {
  const submitButton = document.querySelector('.custom-btn-submit-edit-category');
  const submitforme = document.querySelector('.custom-btn-submit');
  submitforme.classList.add('hide');
  submitButton.classList.remove('hide');

  const categories = getCategoriesFromLocalStorage();

  if (index < 0 || index >= categories.length) {
    console.error('Invalid index. No category found.');
    return;
  }

  const categoryToEdit = categories[index];

  if (!categoryToEdit) {
    console.error('Category not found at the given index.');
    return;
  }

  // تعبئة الحقول الأساسية
  document.querySelector('.custom-input-category-name').value = categoryToEdit.name;
  // document.querySelector('.custom-input-long-break').value = categoryToEdit.longBreak;

  // إظهار الليبلات الخاصة بالمدخلات
  document.querySelector('.label-category-name').style.display = 'block';
  // document.querySelector('.label-long-break').style.display = 'block';

  // تعبئة المهام
  const tasksContainer = document.querySelector('.custom-tasks-container');
  tasksContainer.innerHTML = ''; // مسح المهام الحالية في النموذج

  categoryToEdit.tasks.forEach((task, taskIndex) => {
    // إنشاء عنصر جديد لكل مهمة وتعبئته بالبيانات الحالية
    const taskElement = document.createElement('div');
    taskElement.classList.add('custom-task-item');

    const taskNameLabel = document.createElement('label');
    taskNameLabel.textContent = `اسم المهمة ${taskIndex + 1}`;
    taskNameLabel.classList.add('label-task-name');

    const taskNameInput = document.createElement('input');
    taskNameInput.classList.add('custom-input-task-name');
    taskNameInput.value = task.name;

    const taskTimeLabel = document.createElement('label');
    taskTimeLabel.textContent = `مدة المهمة ${taskIndex + 1}`;
    taskTimeLabel.classList.add('label-task-time');

    const taskTimeInput = document.createElement('input');
    taskTimeInput.classList.add('custom-input-task-time');
    taskTimeInput.value = task.time;

    const taskShortBreakLabel = document.createElement('label');
    taskShortBreakLabel.textContent = `استراحة قصيرة ${taskIndex + 1}`;
    taskShortBreakLabel.classList.add('label-short-break');

    const taskShortBreakInput = document.createElement('input');
    taskShortBreakInput.classList.add('custom-input-short-break');
    taskShortBreakInput.value = task.shortBreak;

    taskElement.appendChild(taskNameLabel);
    taskElement.appendChild(taskNameInput);
    taskElement.appendChild(taskTimeLabel);
    taskElement.appendChild(taskTimeInput);
    taskElement.appendChild(taskShortBreakLabel);
    taskElement.appendChild(taskShortBreakInput);

    tasksContainer.appendChild(taskElement);
  });

  // عرض النموذج
  document.querySelector('.custom-modal').classList.add('show');
  document.querySelector('.custom-modal-results').classList.remove('show');

  // تعديل عمل الزر "حفظ الفئة"
  submitButton.onclick = function () {
    // تحديث بيانات الفئة المعدلة
    const updatedCategory = {
      name: document.querySelector('.custom-input-category-name').value,
      // longBreak: document.querySelector('.custom-input-long-break').value,
      tasks: [],
    };

    // تحديث المهام داخل الفئة المعدلة
    const taskElements = document.querySelectorAll('.custom-task-item');
    taskElements.forEach((taskElement) => {
      const taskName = taskElement.querySelector('.custom-input-task-name').value;
      const taskTime = taskElement.querySelector('.custom-input-task-time').value;
      const taskShortBreak = taskElement.querySelector('.custom-input-short-break').value;

      updatedCategory.tasks.push({
        name: taskName,
        time: taskTime,
        shortBreak: taskShortBreak,
        id: uuidv4(),
      });
    });

    // استبدال الفئة القديمة بالفئة المعدلة في المصفوفة
    console.log('categories', categories);

    console.log(categories[index]);

    console.log('updatedCategory', updatedCategory);

    categories[index] = updatedCategory;
    let newcategories = categories;
    console.log('newcategories', newcategories);

    // حفظ التحديثات في Local Storage
    debugger;
    localStorage.setItem('categories', JSON.stringify(newcategories));
    localStorage.setItem('newcategories', JSON.stringify(newcategories));

    // إدارة تمييز الفئة المحددة
    let allCategory = document.querySelector('.custom-category-list').children;
    Array.from(allCategory).forEach((category, i) => {
      if (index !== i) {
        category.classList.remove('selected-category');
      } else {
        category.classList.add('selected-category');
      }
    });

    // إغلاق النموذج
    document.querySelector('.custom-modal').classList.remove('show');
    submitButton.classList.add('hide');
    submitforme.classList.remove('hide');
  };
}
*/

function editCategory(index) {
  const submitButton = document.querySelector('.custom-btn-submit-edit-category');
  const submitforme = document.querySelector('.custom-btn-submit');
  submitforme.classList.add('hide');
  submitButton.classList.remove('hide');

  const categories = getCategoriesFromLocalStorage();

  if (index < 0 || index >= categories.length) {
    console.error('Invalid index. No category found.');
    return;
  }

  const categoryToEdit = categories[index];

  if (!categoryToEdit) {
    console.error('Category not found at the given index.');
    return;
  }

  // تعبئة الحقول الأساسية
  document.querySelector('.custom-input-category-name').value = categoryToEdit.name;

  // إظهار الليبلات الخاصة بالمدخلات
  document.querySelector('.label-category-name').style.display = 'block';

  // تعبئة المهام
  const tasksContainer = document.querySelector('.custom-tasks-container');
  tasksContainer.innerHTML = '';

  categoryToEdit.tasks.forEach((task, taskIndex) => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('custom-task-item');

    const taskNameLabel = document.createElement('label');
    taskNameLabel.textContent = `اسم المهمة ${taskIndex + 1}`;
    taskNameLabel.classList.add('label-task-name');

    const taskNameInput = document.createElement('input');
    taskNameInput.classList.add('custom-input-task-name');
    taskNameInput.value = task.name;

    const taskTimeLabel = document.createElement('label');
    taskTimeLabel.textContent = `مدة المهمة ${taskIndex + 1}`;
    taskTimeLabel.classList.add('label-task-time');

    const taskTimeInput = document.createElement('input');
    taskTimeInput.classList.add('custom-input-task-time');
    taskTimeInput.value = task.time;

    const taskShortBreakLabel = document.createElement('label');
    taskShortBreakLabel.textContent = `استراحة قصيرة ${taskIndex + 1}`;
    taskShortBreakLabel.classList.add('label-short-break');

    const taskShortBreakInput = document.createElement('input');
    taskShortBreakInput.classList.add('custom-input-short-break');
    taskShortBreakInput.value = task.shortBreak;

    taskElement.appendChild(taskNameLabel);
    taskElement.appendChild(taskNameInput);
    taskElement.appendChild(taskTimeLabel);
    taskElement.appendChild(taskTimeInput);
    taskElement.appendChild(taskShortBreakLabel);
    taskElement.appendChild(taskShortBreakInput);

    tasksContainer.appendChild(taskElement);
  });

  document.querySelector('.custom-modal').classList.add('show');
  document.querySelector('.custom-modal-results').classList.remove('show');

  submitButton.onclick = function () {
    const updatedCategory = {
      name: document.querySelector('.custom-input-category-name').value,
      tasks: []
    };

    const taskElements = document.querySelectorAll('.custom-task-item');
    taskElements.forEach((taskElement) => {
      const taskName = taskElement.querySelector('.custom-input-task-name').value;
      const taskTime = taskElement.querySelector('.custom-input-task-time').value;
      const taskShortBreak = taskElement.querySelector('.custom-input-short-break').value;

      updatedCategory.tasks.push({
        name: taskName,
        time: taskTime,
        shortBreak: taskShortBreak,
        id: uuidv4()
      });
    });

    categories[index] = updatedCategory;
    localStorage.setItem('categories', JSON.stringify(categories));

    // تحديث الواجهة بدلاً من إعادة تحميل الصفحة
    loadCategoriesFromLocalStorage();
    document.querySelector('.custom-modal').classList.remove('show');
    submitButton.classList.add('hide');
    submitforme.classList.remove('hide');
  };
}

function addSelectAndAddButtons(categoryContainer, index) {
  // زر إضافة للصفحة
  const addButton = createAddButton(index);
  categoryContainer.appendChild(addButton);

  const editButton = createEditButton(index);
  categoryContainer.appendChild(editButton);

  // زر حذف الفئة
  const deleteButton = createDeleteButton(index);
  categoryContainer.appendChild(deleteButton);
}

function addCategotyTaskToTasksInLocaleStorge(categories) {
  let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let allTimePomodor = [];
  categories.tasks.forEach((task) => {
    const taskDetails = {
      id: task.id,
      title: task.name,
      description: 'لا يوجد وصف',
      dueDate: new Date(dateSelectedCalender).toISOString() ? new Date(dateSelectedCalender).toISOString() : new Date().toISOString(),
      priority: 'hiegh',
      ConnectWithPomodor: true,
      completed: false,
      category: 'عام',
      tags: [],
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
        order: 0,
      },
      pomodoro: {
        pomodoroTime: task.time,
        shortBreakTime: task.shortBreak,
        // longBreakBTime: categories.longBreak / categories.tasks.length,
      },
    };

    allTasks.push(taskDetails);
  });
  localStorage.setItem('tasks', JSON.stringify(allTasks));

  let allTasksCategory = JSON.parse(localStorage.getItem('categories')) || [];
  let indexCategory = allTasksCategory.findIndex((obj) => {
    return obj.name === categories.name && JSON.stringify(obj.tasks) === JSON.stringify(categories.tasks);
  });

  allTasksCategory[indexCategory].tasks.forEach((task) => {
    task.id = uuidv4();
  });

  localStorage.setItem('categories', JSON.stringify(allTasksCategory));
  return allTasksCategory[indexCategory];
}

function getPomodoroData(categories) {
  const allNames = [];
  const allId = [];
  const allPomodoroTimes = [];
  const allShortBreakTimes = [];
  // const LongBreakTimes = categories.longBreak;

  categories.tasks.forEach((task) => {
    allId.push(task.id);
    allPomodoroTimes.push(task.time);
    allShortBreakTimes.push(task.shortBreak);
  });

  return {
    allId: allId,
    pomodoroTimes: allPomodoroTimes,
    shortBreakTimes: allShortBreakTimes,
    // longBreakTimes: LongBreakTimes,
  };
}

async function startPomodorCategories(categories) {
  let data = getPomodoroData(categories);
  const state = JSON.parse(localStorage.getItem('pomodoroState'));
  state.sessionsBeforeLongBreak = categories.tasks.length;
  let allId = data.allId;
  let allpomodoroTimes = data.pomodoroTimes;
  let allshortBreakTimes = data.shortBreakTimes;
  // let longBreakBTime = data.longBreakTimes;
  state.categoriesPomodoro = allpomodoroTimes;
  state.categoriesShortBreakTimes = allshortBreakTimes;
  state.categoriesLongBreakBTime = allshortBreakTimes.at(-1);
  state.orderPomodoroCategory = 0;
  state.id = allId;
  localStorage.setItem('pomodoroState', JSON.stringify(state));
}
