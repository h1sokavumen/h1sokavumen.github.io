const API_URL = "https://vortex-dtd5.onrender.com";
let currentUser = null;
let isLoginMode = true;

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(tabId === 'recommendations') loadRecommendations();
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('modal-title').innerText = isLoginMode ? 'Вход' : 'Регистрация';
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
            if(!isLoginMode) { isLoginMode = true; submitAuth(); } // Авто-логин после регистрации
            else { loginSuccess(data.user); }
        } else { alert(data.message); }
    } catch(e) { alert("Сервер спит, подожди 20 сек..."); }
}

function loginSuccess(user) {
    currentUser = user;
    closeModal('auth-modal');
    document.getElementById('auth-section').innerHTML = `<button class="glass-btn" onclick="location.reload()">Выйти</button>`;
    if(user.role === 'admin') document.getElementById('nav-admin').style.display = 'block';
    updateProfileUI();
    switchTab('profile');
}

function updateProfileUI() {
    document.getElementById('profile-name').innerText = currentUser.username;
    document.getElementById('profile-bio').innerText = currentUser.bio || "Слушатель Nova Sounds";
    document.getElementById('profile-avatar').src = currentUser.avatar || "https://via.placeholder.com/150";
    document.getElementById('profile-banner').style.backgroundImage = `url(${currentUser.banner})`;
}

async function saveProfile() {
    const data = {
        username: currentUser.username,
        bio: document.getElementById('edit-bio').value,
        avatar: document.getElementById('edit-avatar').value,
        banner: document.getElementById('edit-banner').value
    };
    await fetch(`${API_URL}/api/profile/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    currentUser = {...currentUser, ...data};
    updateProfileUI();
    closeModal('edit-profile-modal');
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

async function uploadTrack() {
    const data = {
        admin_username: currentUser.username,
        title: document.getElementById('track-title').value,
        artist: document.getElementById('track-artist').value,
        url: document.getElementById('track-url').value
    };
    await fetch(`${API_URL}/api/admin/add_track`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    alert("Готово!");
}

loadRecommendations(); // Загрузка песен при старте
