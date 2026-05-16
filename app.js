const API_URL = "https://vortex-dtd5.onrender.com"; // Твой рабочий сервер!

let currentUser = null; 
let isLoginMode = true; 

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
    
    if(!username || !pass) {
        alert("Заполните все поля!");
        return;
    }

    const endpoint = isLoginMode ? '/api/login' : '/api/register';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: username, password: pass})
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            if (!isLoginMode) {
                // Если это была регистрация, сразу автоматически логиним пользователя!
                const loginRes = await fetch(`${API_URL}/api/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username: username, password: pass})
                });
                const loginData = await loginRes.json();
                if(loginData.status === 'success') {
                    completeLogin(loginData.user);
                }
            } else {
                // Если это был обычный вход
                completeLogin(data.user);
            }
        } else {
            alert("Ошибка: " + data.message);
        }
    } catch (e) { 
        alert("Сервер недоступен! Подождите 10 секунд и попробуйте снова (сервер просыпается)."); 
    }
}

// Функция успешного входа (меняем кнопки)
function completeLogin(user) {
    currentUser = user;
    closeModal('auth-modal');
    
    // Прячем кнопку "Войти", показываем Имя и кнопку "Выйти"
    document.getElementById('auth-section').innerHTML = `
        <span style="margin-right:15px;">Привет, <b>${currentUser.username}</b></span>
        <button class="glass-btn" onclick="logout()">Выйти</button>
    `;
    
    // Показываем админ-панель, если это админ
    if (currentUser.role === 'admin') {
        document.getElementById('nav-admin').style.display = 'block';
    }
}

// Функция выхода из аккаунта
function logout() {
    currentUser = null;
    document.getElementById('auth-section').innerHTML = `<button class="glass-btn" onclick="openModal('auth-modal')">Войти</button>`;
    document.getElementById('nav-admin').style.display = 'none';
    switchTab('recommendations'); // перекидываем на главную
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
                        <small>Роль: ${u.role} | Подписка: ${u.sub ? 'Есть ✅' : 'Нет ❌'}</small>
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
    loadAdminUsers(); // Обновляем список после нажатия
}

// Лайк (сердечко)
document.querySelector('.heart-btn').addEventListener('click', function() {
    this.classList.toggle('active');
});
