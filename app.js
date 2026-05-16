const API_URL = "https://vortex-dtd5.onrender.com";
let currentUser = null;
let allTracks = [];
let isLogin = true;

window.onload = async () => {
    const u = localStorage.getItem('nova_user');
    const p = localStorage.getItem('nova_pass');
    if(u && p) {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: u, password: p})
        });
        const data = await res.json();
        if(data.status === 'success') { currentUser = data.user; loginSuccess(); }
    }
    loadRecommendations();
};

// ПЕРЕКЛЮЧАТЕЛЬ ВХОД / РЕГИСТРАЦИЯ
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('modal-title').innerText = isLogin ? "Вход" : "Регистрация";
    document.querySelector('.toggle-auth').innerText = isLogin ? "Нет аккаунта? Регистрация" : "Есть аккаунт? Войти";
}

// ЗАКРЕПИТЬ ТРЕК
async function pinTrack(id) {
    if(!currentUser) return alert("Сначала войди!");
    await fetch(`${API_URL}/api/profile/pin`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: currentUser.username, track_id: id})
    });
    alert("Трек закреплен в профиле!");
    location.reload(); // Чтобы обновить список в профиле
}

async function loadRecommendations() {
    const res = await fetch(`${API_URL}/api/recommendations`);
    const data = await res.json();
    allTracks = data.data;
    document.getElementById('tracks-container').innerHTML = allTracks.map(t => `
        <div class="track-card glass-panel">
            <div><b>${t.title}</b><br><small>${t.artist}</small></div>
            <div style="display:flex; gap:10px;">
                <button class="glass-btn" onclick="pinTrack(${t.id})">📌</button>
                <button class="glass-btn accent" onclick="playMusic('${t.url}', '${t.title}', '${t.artist}')">▶</button>
            </div>
        </div>
    `).join('');
    renderPinned();
}

function renderPinned() {
    if(!currentUser) return;
    const pinned = allTracks.filter(t => currentUser.pinned_tracks.includes(t.id));
    document.getElementById('pinned-container').innerHTML = pinned.map(t => `
        <div class="track-card glass-panel">
            <div><b>${t.title}</b><br><small>${t.artist}</small></div>
            <button class="glass-btn accent" onclick="playMusic('${t.url}', '${t.title}', '${t.artist}')">▶</button>
        </div>
    `).join('');
}

async function uploadTrack() {
    const file = document.getElementById('track-file').files[0];
    if(!file) return alert("Выбери файл!");
    const base64 = await toBase64(file);
    await fetch(`${API_URL}/api/admin/add_track`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            title: file.name.replace('.mp3',''),
            artist: document.getElementById('track-artist').value || "Nova Artist",
            url: base64
        })
    });
    alert("Загружено!"); loadRecommendations();
}

async function submitAuth() {
    const u = document.getElementById('auth-user').value;
    const p = document.getElementById('auth-pass').value;
    const path = isLogin ? '/api/login' : '/api/register';
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: u, password: p})
    });
    const data = await res.json();
    if(data.status === 'success') {
        if(!isLogin) { alert("Регистрация ок! Теперь войди."); toggleAuth(); }
        else {
            localStorage.setItem('nova_user', u); localStorage.setItem('nova_pass', p);
            location.reload();
        }
    } else { alert(data.message); }
}

async function searchFriends() {
    const q = document.getElementById('f-search').value;
    const res = await fetch(`${API_URL}/api/users/search`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query: q})
    });
    const data = await res.json();
    document.getElementById('friends-results').innerHTML = data.users.map(u => `
        <div class="track-card glass-panel">
            <b>${u.username}</b>
            <button class="glass-btn" onclick="alert('Профиль: ${u.bio}')">Инфо</button>
        </div>
    `).join('');
}

const toBase64 = f => new Promise((res, rej) => {
    const r = new FileReader(); r.readAsDataURL(f);
    r.onload = () => res(r.result); r.onerror = e => rej(e);
});

function loginSuccess() {
    document.getElementById('auth-section').innerHTML = `<button class="glass-btn" onclick="logout()">Выйти</button>`;
    if(currentUser.role === 'admin') document.getElementById('nav-admin').style.display = 'block';
    renderProfile();
}

function renderProfile() {
    document.getElementById('profile-view').innerHTML = `
        <div class="profile-card glass-panel" style="padding:0; overflow:hidden;">
            <div class="banner" style="background-image:url(${currentUser.banner}); height:120px; background-size:cover; background-color:#222;"></div>
            <div style="text-align:center; padding:20px; margin-top:-40px;">
                <img src="${currentUser.avatar || 'https://via.placeholder.com/100'}" style="width:80px; height:80px; border-radius:50%; border:3px solid #000;">
                <h2>${currentUser.username}</h2>
                <p>${currentUser.bio || 'Nova listener'}</p>
                <button class="glass-btn mt-10" onclick="openModal('edit-modal')">Настроить</button>
            </div>
        </div>
    `;
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function logout() { localStorage.clear(); location.reload(); }
function playMusic(url, t, a) {
    const audio = document.getElementById('main-audio');
    audio.src = url; audio.play();
    document.getElementById('p-title').innerText = t;
    document.getElementById('p-artist').innerText = a;
}
