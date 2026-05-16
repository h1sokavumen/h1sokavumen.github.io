// Адрес твоего сервера на Render (поменяешь на свой, когда задеплоишь)
const API_URL = "https://твое-имя-на-render.onrender.com";

// Переключение вкладок
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(link => link.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// Смена темы
function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.documentElement.setAttribute('data-theme', theme);
}

// Анимация лайка (Сердечка)
document.querySelector('.heart-btn').addEventListener('click', function() {
    this.classList.toggle('active');
    // Тут в будущем добавим отправку на Python сервер (Добавить в любимое)
});

// Запрос рекомендаций с сервера (пример связи с Python)
async function loadRecommendations() {
    try {
        const response = await fetch(`${API_URL}/api/recommendations`);
        const data = await response.json();
        if(data.status === "success") {
            const container = document.getElementById('tracks-container');
            container.innerHTML = '';
            data.data.forEach(track => {
                container.innerHTML += `
                    <div class="track-card">
                        <b>${track.title}</b> - ${track.artist}
                        <button onclick="playTrack('${track.url}', '${track.title}', '${track.artist}')">▶</button>
                    </div>
                `;
            });
        }
    } catch (e) {
        console.log("Сервер пока не подключен. Работаем локально.");
    }
}

function playTrack(url, title, artist) {
    document.getElementById('player-title').innerText = title;
    document.getElementById('player-artist').innerText = artist;
    // Логика запуска музыки...
}

// Загружаем данные при старте
loadRecommendations();