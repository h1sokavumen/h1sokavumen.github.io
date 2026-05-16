const API_URL = "https://vortex-dtd5.onrender.com";
let currentUser = null;
let allTracks = [];

window.onload = async () => {
    const user = localStorage.getItem('nova_user');
    const pass = localStorage.getItem('nova_pass');
    if(user && pass) {
        const res = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: user, password: pass})
        });
        const data = await res.json();
        if(data.status === 'success') { currentUser = data.user; loginSuccess(); }
    }
    loadRecommendations();
};

// ТЕМЫ
function changeTheme() {
    const t = document.getElementById('theme-selector').value;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('nova_theme', t);
}

// ЗАГРУЗКА ТРЕКА С АВТО-НАЗВАНИЕМ
async function uploadTrack() {
    const fileInput = document.getElementById('track-file');
    if(!fileInput.files[0]) return alert("Выбери файл!");
    
    const file = fileInput.files[0];
    const base64 = await toBase64(file);
    
    // Берем название файла как название трека
    const fileName = file.name.replace('.mp3', '');
    const artist = document.getElementById('track-artist').value || "Неизвестен";

    await fetch(`${API_URL}/api/admin/add_track`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            admin_username: currentUser.username,
            title: fileName,
            artist: artist,
            url: base64
        })
    });
    alert("Трек загружен!");
    loadRecommendations();
}

// ВЫДАЧА ПРАВ
async function grantRights(right) {
    const target = document.getElementById('grant-username').value;
    const res = await fetch(`${API_URL}/api/admin/grant`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            admin_username: currentUser.username,
            target_user: target,
            right: right
        })
    });
    const data = await res.json();
    alert(data.message);
}

// СОХРАНЕНИЕ ПРОФИЛЯ (ФАЙЛЫ)
async function saveProfile() {
    const avFile = document.getElementById('edit-avatar-file').files[0];
    const bnFile = document.getElementById('edit-banner-file').files[0];
    
    const data = {
        username: currentUser.username,
        bio: document.getElementById('edit-bio').value,
        avatar: avFile ? await toBase64(avFile) : currentUser.avatar,
        banner: bnFile ? await toBase64(bnFile) : currentUser.banner
    };

    await fetch(`${API_URL}/api/profile/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    location.reload();
}

// ПРИКРЕПИТЬ ТРЕК К ПРОФИЛЮ
async function pinTrack(id) {
    await fetch(`${API_URL}/api/profile/pin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: currentUser.username, track_id: id})
    });
    alert("Трек прикреплен к профилю!");
}

async function loadRecommendations() {
    const res = await fetch(`${API_URL}/api/recommendations`);
    const data = await res.json();
    allTracks = data.data;
    const cont = document.getElementById('tracks-container');
    cont.innerHTML = allTracks.map(t => `
        <div class="track-card glass-panel">
            <div><b>${t.title}</b><br><small>${t.artist}</small></div>
            <div style="display:flex; gap:10px;">
                <button class="glass-btn" onclick="pinTrack(${t.id})">📌</button>
                <button class="glass-btn" onclick="playMusic('${t.url}', '${t.title}', '${t.artist}')">▶</button>
            </div>
        </div>
    `).join('');
    renderPinned();
}

function renderPinned() {
    if(!currentUser) return;
    const cont = document.getElementById('pinned-tracks-container');
    const pinned = allTracks.filter(t => currentUser.pinned_tracks.includes(t.id));
    cont.innerHTML = pinned.map(t => `
        <div class="track-card glass-panel">
            <div><b>${t.title}</b><br><small>${t.artist}</small></div>
            <button class="glass-btn" onclick="playMusic('${t.url}', '${t.title}', '${t.artist}')">▶</button>
        </div>
    `).join('');
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
const toBase64 = file => new Promise((res, rej) => {
    const r = new FileReader(); r.readAsDataURL(file);
    r.onload = () => res(r.result); r.onerror = e => rej(e);
});

function loginSuccess() {
    document.getElementById('auth-section').innerHTML = `<button class="glass-btn" onclick="logout()">Выйти</button>`;
    if(currentUser.role === 'admin') document.getElementById('nav-admin').style.display = 'block';
    renderProfile();
}

function renderProfile() {
    const cont = document.getElementById('self-profile-view');
    cont.innerHTML = `
        <div class="profile-card glass-panel">
            <div class="banner" style="background-image:url(${currentUser.banner})"></div>
            <div class="p-info">
                <img src="${currentUser.avatar || 'https://via.placeholder.com/150'}" class="avatar">
                <h2>${currentUser.username} ${currentUser.sub ? '⭐' : ''}</h2>
                <p>${currentUser.bio || 'Слушатель Nova Sounds'}</p>
                <button class="glass-btn" onclick="openModal('edit-profile-modal')">Настроить профиль</button>
            </div>
        </div>
    `;
    renderPinned();
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    event.target.classList.add('active');
}
function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function logout() { localStorage.clear(); location.reload(); }
async function submitAuth() {
    const user = document.getElementById('auth-username').value;
    const pass = document.getElementById('auth-password').value;
    const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: user, password: pass})
    });
    const data = await res.json();
    if(data.status === 'success') {
        localStorage.setItem('nova_user', user); localStorage.setItem('nova_pass', pass);
        location.reload();
    } else { alert("Ошибка!"); }
}
function playMusic(url, title, artist) {
    const a = document.getElementById('main-audio');
    a.src = url; a.play();
    document.getElementById('p-title').innerText = title;
    document.getElementById('p-artist').innerText = artist;
}
