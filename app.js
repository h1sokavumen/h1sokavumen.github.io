const API_URL = "https://vortex-dtd5.onrender.com";
let currentUser = null;
let isLoginMode = true;

// 1. АВТО-ВХОД ПРИ ЗАГРУЗКЕ
window.onload = function() {
    const savedUser = localStorage.getItem('nova_user');
    const savedPass = localStorage.getItem('nova_pass');
    if(savedUser && savedPass) {
        document.getElementById('auth-username').value = savedUser;
        document.getElementById('auth-password').value = savedPass;
        submitAuth();
    } else {
        renderGuest();
    }
    loadRecommendations();
};

function renderGuest() {
    document.getElementById('auth-section').innerHTML = `<button class="glass-btn" onclick="openModal('auth-modal')">Войти</button>`;
}

async function submitAuth() {
    const user = document.getElementById('auth-username').value;
    const pass = document.getElementById('auth-password').value;
    const path = isLoginMode ? '/api/login' : '/api/register';
    
    try {
        const res = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: user, password: pass})
        });
        const data = await res.json();
        if(data.status === 'success') {
            if(!isLoginMode) { alert("Успех! Теперь войдите."); isLoginMode = true; toggleAuthMode(); }
            else { 
                currentUser = data.user;
                localStorage.setItem('nova_user', user);
                localStorage.setItem('nova_pass', pass);
                loginSuccess();
            }
        } else { alert(data.message); }
    } catch(e) { console.log("Ошибка сервера"); }
}

function loginSuccess() {
    closeModal('auth-modal');
    document.getElementById('auth-section').innerHTML = `<button class="glass-btn" onclick="logout()">Выйти</button>`;
    if(currentUser.role === 'admin') document.getElementById('nav-admin').style.display = 'block';
    renderSelfProfile();
}

function logout() {
    localStorage.clear();
    location.reload();
}

// 2. ПРОСМОТР СВОЕГО ПРОФИЛЯ
function renderSelfProfile() {
    const cont = document.getElementById('self-profile-view');
    cont.innerHTML = `
        <div class="profile-card glass-panel">
            <div class="banner" style="background-image: url(${currentUser.banner})"></div>
            <div class="p-info">
                <img src="${currentUser.avatar || 'https://via.placeholder.com/150'}" class="avatar">
                <h2>${currentUser.username}</h2>
                <p>${currentUser.bio || 'Слушатель Nova Sounds'}</p>
                <button class="glass-btn" onclick="openModal('edit-profile-modal')">Настроить профиль</button>
            </div>
        </div>
    `;
}

// 3. ПОИСК ДРУЗЕЙ
async function searchUser() {
    const nick = document.getElementById('user-search-input').value;
    const res = await fetch(`${API_URL}/api/user/${nick}`);
    const data = await res.json();
    const resultDiv = document.getElementById('search-result');
    
    if(data.status === 'success') {
        const u = data.user;
        resultDiv.innerHTML = `
            <div class="track-card glass-panel" onclick="viewUserProfile('${u.username}')" style="cursor:pointer">
                <div style="display:flex; align-items:center; gap:15px;">
                    <img src="${u.avatar || 'https://via.placeholder.com/50'}" style="width:40px; height:40px; border-radius:50%;">
                    <b>${u.username}</b>
                </div>
                <span>Просмотреть →</span>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `<p class="center-message">Пользователь не найден</p>`;
    }
}

async function viewUserProfile(nick) {
    const res = await fetch(`${API_URL}/api/user/${nick}`);
    const data = await res.json();
    const u = data.user;
    document.getElementById('v-user-name').innerText = u.username;
    document.getElementById('v-user-bio').innerText = u.bio || "Нет описания";
    document.getElementById('v-user-avatar').src = u.avatar || "https://via.placeholder.com/150";
    document.getElementById('v-user-banner').style.backgroundImage = `url(${u.banner})`;
    openModal('view-user-modal');
}

// 4. ЗАГРУЗКА ТРЕКА (ФАЙЛ ИЛИ ССЫЛКА)
async function uploadTrack() {
    const fileInput = document.getElementById('track-file');
    let finalUrl = document.getElementById('track-url').value;

    if (fileInput.files.length > 0) {
        // Если выбран файл, превращаем его в Base64 (текстовую ссылку)
        const file = fileInput.files[0];
        finalUrl = await toBase64(file);
    }

    const data = {
        admin_username: currentUser.username,
        title: document.getElementById('track-title').value,
        artist: document.getElementById('track-artist').value,
        url: finalUrl
    };

    await fetch(`${API_URL}/api/admin/add_track`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    alert("Трек загружен!");
    loadRecommendations();
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// ВСПОМОГАТЕЛЬНЫЕ
function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('modal-title').innerText = isLoginMode ? 'Вход' : 'Регистрация';
}

async function loadRecommendations() {
    const res = await fetch(`${API_URL}/api/recommendations`);
    const data = await res.json();
    const cont = document.getElementById('tracks-container');
    cont.innerHTML = data.data.map(t => `
        <div class="track-card glass-panel">
            <div><b>${t.title}</b><br><small>${t.artist}</small></div>
            <button class="glass-btn" onclick="playMusic('${t.url}', '${t.title}', '${t.artist}')">▶</button>
        </div>
    `).join('');
}

function playMusic(url, title, artist) {
    const a = document.getElementById('main-audio');
    a.src = url; a.play();
    document.getElementById('p-title').innerText = title;
    document.getElementById('p-artist').innerText = artist;
}
