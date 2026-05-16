const API_URL = "http://127.0.0.1:10000"; // Пока тестируем локально. Потом поменяем на Render.

let currentUser = null; // Храним данные вошедшего пользователя
let isLoginMode = true; // Переключатель логин/регистрация

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(link => link.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.documentElement.setAttribute('data-theme', theme);
}

// --- МОДАЛЬНЫЕ ОКНА И АВТОРИЗАЦИЯ ---
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('modal-title').innerText = isLoginMode ? 'Вход' : 'Регистрация';
    document.getElementById('auth-password-repeat').style.display = isLoginMode ? 'none' : 'block';
    document.querySelector('.toggle-auth').innerText = isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Есть аккаунт? Войти';
}

async function submitAuth() {
    const username = document.getElementById('auth-username').value;
    const pass = document.getElementById('auth-password').value;
    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: pass})
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            alert(data.message || "Успешный вход!");
            closeModal('auth-modal');
            if (isLoginMode) {
                currentUser = data.user;
                document.getElementById('auth-section').innerHTML = `<span style="margin-right:15px;">Привет, ${currentUser.username}</span>`;
                // Если ты админ, показываем вкладку!
                if (currentUser.role === 'admin') {
                    document.getElementById('nav-admin').style.display = 'block';
                }
            }
        } else {
            alert("Ошибка: " + data.message);
        }
    } catch (e) { alert("Сервер недоступен!"); }
}

// --- АДМИН ПАНЕЛЬ ---
async function loadAdminUsers() {
    if (!currentUser || currentUser.role !== 'admin') return;

    const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({admin_username: currentUser.username})
    });
    const data = await res.json();
    
    if (data.status === 'success') {
        const container = document.getElementById('admin-users-list');
        container.innerHTML = '';
        for (let user in data.users) {
            let u = data.users[user];
            container.innerHTML += `
                <div class="admin-user-card">
                    <div>
                        <b>${user}</b><br>
                        <small>Роль: ${u.role} | Подписка: ${u.sub ? 'Есть' : 'Нет'}</small>
                    </div>
                    <div class="admin-actions">
                        ${!u.sub ? `<button class="glass-btn" onclick="adminAction('${user}', 'give_sub')">+ Подписка</button>` : ''}
                        ${u.role !== 'admin' ? `<button class="glass-btn accent" onclick="adminAction('${user}', 'give_admin')">+ Админ</button>` : ''}
                    </div>
                </div>
            `;
        }
    }
}

async function adminAction(targetUser, action) {
    await fetch(`${API_URL}/api/admin/action`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            admin_username: currentUser.username,
            target_user: targetUser,
            action: action
        })
    });
    loadAdminUsers(); // Обновляем список
}

// Лайк
document.querySelector('.heart-btn').addEventListener('click', function() {
    this.classList.toggle('active');
});
