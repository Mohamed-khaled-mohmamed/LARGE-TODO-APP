import { updateUI } from '../util';
import { dateSelectedCalender } from './calender';

export function updateTaskReminder(reminderData, Id) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Find the task that you want to update (replace `taskId` with the actual task ID)
  const taskId = Id;
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex !== -1) {
    // Update the reminder data for the task
    tasks[taskIndex].reminder = reminderData;

    // Save the updated tasks array back to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}

export function monitorReminders() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const now = new Date();

  tasks.forEach((task) => {
    if (task.reminder.enabled && task.reminder.reminderDate) {
      const reminderDate = new Date(task.reminder.reminderDate);

      // Check if the reminder date has passed
      if (reminderDate <= now) {
        // Show reminder notification based on reminderType
        showReminderNotification(task.title);
        updateUI(dateSelectedCalender);
        // Optionally, disable the reminder after it's shown
        task.reminder.enabled = false;
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    }
  });
}

// Function to show the reminder notification
/*
function showReminderNotification(type, taskTitle) {
  if (type === 'popup') {
    alert(`Reminder for task: ${taskTitle}`);
  } else if (type === 'notification') {
    // Show browser notification (make sure to request notification permission first)
    if (Notification.permission === 'granted') {
      new Notification(`Reminder for task: ${taskTitle}`);
    }
  } else if (type === 'email') {
    console.log(`Send email reminder for task: ${taskTitle}`);
    // Add your email sending logic here
  }
}
*/

function showReminderNotification(taskTitle) {
  // نصائح عشوائية
  const tips = [
    'لا تنسى القرآن  من يوميك و مهامك ',
    ' اللهم صلي علي سيدنا محمد',
    '  الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ ۙ يَخَافُونَ يَوْمًا تَتَقَلَّبُ فِيهِ الْقُلُوبُ وَالْأَبْصَارُ ',
    ' مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ ۖ فَمِنْهُم مَّن قَضَىٰ نَحْبَهُ وَمِنْهُم مَّن يَنتَظِرُ ۖ وَمَا بَدَّلُوا تَبْدِيلًا',
    'اللهم انصر اخواننا في فلسطين لاتنسهم من دعائك 🇵🇸',
  ];

  // اختيار نصيحة عشوائية
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  playAudioRrmindr('notification');
  // عرض الرسالة المنبثقة
  displayCustomNotification(taskTitle, randomTip);
}

function displayCustomNotification(taskTitle, taskAdvice) {
  const notification = document.getElementById('custom-notification');
  const titleElement = document.getElementById('task-title');
  const adviceElement = document.getElementById('task-advice');

  // تحديث النصوص
  titleElement.textContent = `Task: ${taskTitle}`;
  adviceElement.textContent = taskAdvice;

  // عرض الرسالة
  notification.style.display = 'block';

  // إغلاق الرسالة عند الضغط على الزر
  document.getElementById('close-notification').addEventListener('click', function () {
    notification.style.display = 'none';
  });

  // // إغلاق الرسالة تلقائيًا بعد 10 ثوانٍ
  // setTimeout(function () {
  //   notification.style.display = 'none';
  // }, 10000);
}

function playAudioRrmindr(audioSrc) {
  // Create a new Audio object with the provided source
  const audio = new Audio(`./audio/${audioSrc}.mp3`);

  // Set the volume of the audio
  audio.volume = 1; // The volume should be between 0 and 1

  audio.addEventListener('loadedmetadata', function () {
    audio.play();
  });
}
