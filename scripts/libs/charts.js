import { Chart } from 'chart.js/auto';
import { getCompletedTasksData, updateUI } from '../util'; // تأكد من مسار الاستيراد الصحيح
import { dateSelectedCalender, updateCalendarHighlight } from './calender';

let myBarChart;
let myPieChart;
let myLineChart;

/*
function createBarChart() {
  const { labels, data } = getCompletedTasksData();

  const ctx = document.getElementById('myBarChart').getContext('2d');

  if (myBarChart) {
    myBarChart.destroy();
  }
  // تدمير الرسم البياني الحالي إذا كان موجودًا

  // إنشاء الرسم البياني الجديد وتخزينه في المتغير myChart
  myBarChart = new Chart(ctx, {
    type: 'bar', // نوع الرسم البياني (bar, line, pie, etc.)
    data: {
      labels: labels,
      datasets: [
        {
          label: 'عدد المهام المكتملة',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      onClick: function (event, elements) {
        if (elements.length > 0) {
          const element = elements[0];
          const dateLabel = this.data.labels[element.index];

          // تحويل التاريخ إلى كائن Date ثم إلى تنسيق YYYY-MM-DD
          const dateObject = new Date(dateLabel);
          const formattedDate = dateObject.toLocaleDateString('en-CA'); // YYYY-MM-DD

          updateCalendarHighlight(formattedDate);
          updateUI(formattedDate);
          // dateSelectedCalender = formattedDate;
        }
      },
    },
  });
}
  */


// دالة لإنشاء الرسم البياني الدائري
/*
function createPieChart() {
  const ctx = document.getElementById('myPieChart')?.getContext('2d');
  if (!ctx) {
    console.error('Element with id "myPieChart" not found.');
    return;
  }

  if (myPieChart) {
    myPieChart.destroy();
  }

  myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['أحمر', 'أزرق', 'أخضر'],
      datasets: [
        {
          label: 'الألوان المفضلة',
          data: [10, 20, 30],
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}
*/

/*
export function createBarChartPomodoro() {
  const data = getPomodoroData(); // استدعاء دالة للحصول على البيانات

  console.log(data);
  
  const ctx = document.getElementById('myLineChart').getContext('2d');

  if (myLineChart) {
    myLineChart.destroy();
  }

  myLineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.dates,
      datasets: [
        {
          label: 'Pomodoro Time (Hours)',
          data: data.pomodoroTimes,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Short Break Time (Hours)',
          data: data.shortBreakTimes,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Long Break Time (Hours)',
          data: data.longBreakTimes,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
      },
      onClick: function (event, elements) {
        if (elements.length > 0) {
          //

          const element = elements[0];
          const dateLabel = this.data.labels[element.index];

          // تحويل التاريخ إلى كائن Date ثم إلى تنسيق YYYY-MM-DD
          const dateObject = new Date(dateLabel);
          const formattedDate = dateObject.toLocaleDateString('en-CA'); // YYYY-MM-DD

          updateCalendarHighlight(formattedDate);
          updateUI(formattedDate);
          // dateSelectedCalender = formattedDate;
        }
      },
    },
  });
}
*/

function createBarChart( ) {
  // debugger
  let { labels, data } = getCompletedTasksData();

  let showLastSevenDays = document.getElementById('last-seven-days-tasks').checked;
  

if (showLastSevenDays) {
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7); // حساب تاريخ الأسبوع القادم

  // تصفية البيانات لعرض الأيام من اليوم إلى الأسبوع القادم
  const filteredData = labels.map((label, index) => {
    const taskDate = new Date(label);
    return taskDate <= today && taskDate >= lastWeek ? { label, data: data[index] } : null;
  }).filter(item => item !== null);

  // تحديث labels و data بالقيم الجديدة
  labels = filteredData.map(item => item.label);
  data = filteredData.map(item => item.data);
}

  const ctx = document.getElementById('myBarChart').getContext('2d');

  if (myBarChart) {
    myBarChart.destroy(); // تدمير الرسم البياني الحالي إذا كان موجودًا
  }

  // إنشاء الرسم البياني الجديد
  myBarChart = new Chart(ctx, {
    type: 'bar', // نوع الرسم البياني (bar, line, pie, etc.)
    data: {
      labels: labels,
      datasets: [
        {
          label: 'عدد المهام المكتملة',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      onClick: function (event, elements) {
        if (elements.length > 0) {
          const element = elements[0];
          const dateLabel = this.data.labels[element.index];

          // تحويل التاريخ إلى كائن Date ثم إلى تنسيق YYYY-MM-DD
          const dateObject = new Date(dateLabel);
          const formattedDate = dateObject.toLocaleDateString('en-CA'); // YYYY-MM-DD

          updateCalendarHighlight(formattedDate);
          updateUI(formattedDate);
        }
      },
    },
  });
}

function createPieChart() {
  const ctx = document.getElementById('myPieChart')?.getContext('2d');
  if (!ctx) {
    console.error('Element with id "myPieChart" not found.');
    return;
  }

  if (myPieChart) {
    myPieChart.destroy();
  }

  // الحصول على المهام من localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // حساب عدد المهام المكتملة وغير المكتملة
  const completedTasks = tasks.filter(task => task.completed).length;
  const uncompletedTasks = tasks.filter(task => !task.completed).length;

  // حساب مجموع دقائق Pomodoro
  const totalPomodoroTime = tasks.reduce((total, task) => {
    const pomodoroTime = parseFloat(task.pomodoro?.pomodoroTime) || 0;
    return total + pomodoroTime;
  }, 0);

  // إعداد الرسم البياني
  myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['مهام مكتملة', 'مهام غير مكتملة', 'مجموع دقائق Pomodoro'],
      datasets: [
        {
          label: 'بيانات المهام',
          data: [completedTasks, uncompletedTasks, totalPomodoroTime],
          backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

export function createBarChartPomodoro() {

  let data = getPomodoroData(); // استدعاء دالة للحصول على البيانات

  let showLastSevenDays = document.getElementById('last-seven-days-tasks').checked;

  console.log(data);
  console.log(showLastSevenDays);
  

  // إذا كان المستخدم يريد عرض آخر سبعة أيام فقط
  if (showLastSevenDays) {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7); // حساب تاريخ الأسبوع الماضي

    // تصفية البيانات لعرض آخر 7 أيام فقط
    const filteredData = data.dates.map((date, index) => {
      const taskDate = new Date(date);
      return taskDate >= lastWeek && taskDate <= today
        ? {
            date: date,
            pomodoroTime: data.pomodoroTimes[index],
            shortBreakTime: data.shortBreakTimes[index],
            longBreakTime: data.longBreakTimes[index],
          }
        : null;
    }).filter(item => item !== null);

    // تحديث data بالقيم الجديدة
    data.dates = filteredData.map(item => item.date);
    data.pomodoroTimes = filteredData.map(item => item.pomodoroTime);
    data.shortBreakTimes = filteredData.map(item => item.shortBreakTime);
    data.longBreakTimes = filteredData.map(item => item.longBreakTime);
  }

  const ctx = document.getElementById('myLineChart').getContext('2d');

  if (myLineChart) {
    myLineChart.destroy();
  }

  myLineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.dates,
      datasets: [
        {
          label: 'Pomodoro Time (Hours)',
          data: data.pomodoroTimes,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Short Break Time (Hours)',
          data: data.shortBreakTimes,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Long Break Time (Hours)',
          data: data.longBreakTimes,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
      },
      onClick: function (event, elements) {
        if (elements.length > 0) {
          const element = elements[0];
          const dateLabel = this.data.labels[element.index];

          // تحويل التاريخ إلى كائن Date ثم إلى تنسيق YYYY-MM-DD
          const dateObject = new Date(dateLabel);
          const formattedDate = dateObject.toLocaleDateString('en-CA'); // YYYY-MM-DD

          updateCalendarHighlight(formattedDate);
          updateUI(formattedDate);
        }
      },
    },
  });
}

function getPomodoroData() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // تصفية المهام المكتملة
  const completedTasks = tasks.filter((task) => task.completed);

  const finalDates = [];
  const finalPomodoroTimes = [];
  const finalShortBreakTimes = [];
  const finalLongBreakTimes = [];

  completedTasks.forEach((task) => {
    if (task.dueDate) {
      const date = new Date(task.dueDate).toLocaleDateString('en-CA'); // YYYY-MM-DD
      const pomodoroTime = parseFloat(task.pomodoro?.pomodoroTime) / 60 || 0;
      const shortBreakTime = parseFloat(task.pomodoro?.shortBreakTime) / 60 || 0;
      const longBreakTime = parseFloat(task.pomodoro?.longBreakBTime) / 60 || 0;

      // التحقق إذا كانت الـ date موجودة مسبقًا في finalDates
      const dateIndex = finalDates.indexOf(date);

      if (dateIndex === -1 && (pomodoroTime || shortBreakTime || longBreakTime)) {
        // إذا كانت غير موجودة، أضف البيانات الجديدة
        finalDates.push(date);
        finalPomodoroTimes.push(pomodoroTime);
        finalShortBreakTimes.push(shortBreakTime);
        finalLongBreakTimes.push(longBreakTime);
      } else if (pomodoroTime || shortBreakTime || longBreakTime) {
        // إذا كانت موجودة، أضف القيم الجديدة إلى القيم الموجودة بالفعل
        finalPomodoroTimes[dateIndex] += pomodoroTime;
        finalShortBreakTimes[dateIndex] += shortBreakTime;
        finalLongBreakTimes[dateIndex] += longBreakTime;
      }
    }
  });

  return {
    dates: finalDates,
    pomodoroTimes: finalPomodoroTimes,
    shortBreakTimes: finalShortBreakTimes,
    longBreakTimes: finalLongBreakTimes,
  };
}

// دالة كبيرة لتحضير جميع الرسوم البيانية
export function createCharts() {
  createBarChart();
  createPieChart();
  createBarChartPomodoro();
}


