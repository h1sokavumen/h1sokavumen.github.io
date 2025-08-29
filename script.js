const clockElement = document.querySelector('.clock');
const alarmTimeInput = document.getElementById('alarmTime');
const setAlarmButton = document.getElementById('setAlarm');
const alarmSound = document.getElementById('alarmSound');
const alarmStatusDiv = document.getElementById('alarmStatus');

// Set default alarm time and status
let alarmTime = '07:50';
let isAlarmSet = true;
let alarmTriggered = false;

// Set the input field value on page load
alarmTimeInput.value = alarmTime;

// Automatically insert a colon after two digits
alarmTimeInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (value.length > 2) {
        value = value.slice(0, 2) + ':' + value.slice(2, 4);
    }
    e.target.value = value;
});

// Update the clock and check for the alarm
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;

    if (isAlarmSet && alarmTime === `${hours}:${minutes}` && !alarmTriggered) {
        console.log('Будильник сработал!');
        alarmSound.play();
        alarmTriggered = true;
    }

    if (alarmTime !== `${hours}:${minutes}` && alarmTriggered) {
        alarmTriggered = false;
    }
}

// Toggle the alarm on and off
function toggleAlarm() {
    if (isAlarmSet) {
        isAlarmSet = false;
        alarmTime = null;
        setAlarmButton.textContent = 'Установить будильник';
        alarmStatusDiv.textContent = 'Будильник выключен.';
        alarmSound.pause();
        alarmSound.currentTime = 0;
        console.log('Будильник отключен');
    } else {
        const newAlarmTime = alarmTimeInput.value;
        if (/^\d{2}:\d{2}$/.test(newAlarmTime)) {
            const [hours, minutes] = newAlarmTime.split(':').map(Number);
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                alarmTime = newAlarmTime;
                isAlarmSet = true;
                setAlarmButton.textContent = 'Отключить будильник';
                alarmStatusDiv.textContent = `Будильник активен на ${alarmTime}.`;
                alarmTriggered = false;
                console.log(`Будильник установлен на ${alarmTime}`);
            } else {
                alert('Неверное время. Часы: 00-23, Минуты: 00-59.');
            }
        } else {
            alert('Неверный формат времени. Используйте HH:MM (например, 07:50).');
        }
    }
}

setAlarmButton.addEventListener('click', toggleAlarm);

// Initial setup
alarmStatusDiv.textContent = `Будильник активен на ${alarmTime}.`;
setAlarmButton.textContent = 'Отключить будильник';
setInterval(updateClock, 1000);
updateClock();