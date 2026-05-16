const API_URL = "https://vortex-dtd5.onrender.com";
let currentUser = null;
let allTracks = [];

window.onload = async () => {
    const user = localStorage.getItem('nova_user');
    const pass = localStorage.getItem('nova_pass');
    if(user && pass) {
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username: user, password: pass})
            });
            const data = await res.json();
            if(data.status === 'success') { currentUser = data.user; loginSuccess(); }
        } catch(e) { console.log("Сервер не отвечает"); }
    }
    loadRecommendations();
};

// ПОИСК ДРУЗЕЙ
async function searchFriends() {
    const query = document.getElementById('friend-search-input').value;
    if(!query) return;

    const res = await fetch(`${API_URL}/api/users/search`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query: query })
    });
    const data = await res.json();
    const resultsCont = document.getElementById('friends-results');
    
    if(data.status === 'success' && data.users.length > 0) {
        resultsCont.innerHTML = data.users.map(u => `
            <div class="track-card glass-panel" onclick="viewUser('${u.username}')" style="cursor:pointer;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${u.avatar || 'https://via.placeholder.com/50'}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <b>${u.username}</b>
                </div>
                <span>Профиль →</span>
            </div>
        `).join('');
    } else {
        resultsCont.innerHTML = `<p class="center-message">Никто не найден :(</p>`;
    }
}

// ПРОСМОТР ЧУЖОГО ПРОФИЛЯ
async function viewUser(username) {
    // Просто находим его данные через поиск (для упрощения)
    const res = await fetch(`${API_URL}/api/users/search`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ query: username })
    });
    const data = await res.json();
    const u = data.users.find(user => user.username === username);
    
    if(u) {
        document.getElementById('v-user-name').innerText = u.username;
        document.getElementById('v-user-bio').innerText = u.bio || "Слушатель Nova Sounds";
        document.getElementById('v-user-avatar').src = u.avatar || "https://via.placeholder.com/150";
        // Баннер тут не передаем для экономии места, но можно добавить
        openModal('view-user-modal');
    }
}

// ТЕМЫ
function changeTheme() {
    const t = document.getElementById('theme-selector').value;
    document.documentElement.setAttribute('data-theme', t);
}

// ЗАГРУЗКА ТРЕКА
async function uploadTrack() {
    const fileInput = document.getElementById('track-file');
    if(!fileInput.files[0]) return alert("Выбери файл!");
    
    const file = fileInput.files[0];
    const fileName = file.name.replace('.mp3', '');
    const artist = document.getElementById('track-artist').value || "Неизвестен";
    
    alert("Начинаем загрузку... Это может занять время для больших файлов.");
    const base64 = await toBase64(file);

    await fetch(`${API_URL}/api/admin/add_track`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            admin_username: currentUser.username,
            title: fileName, artist: artist, url: base64
        })
    });
    alert("Трек на сайте!");
    loadRecommendations();
}

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

// ОСТАЛЬНАЯ ЛОГИКА
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
        <div class="profile-card glass-panel" style="padding:0; overflow:hidden;">
            <div class="banner" style="background-image:url(${currentUser.banner}); height:150px; background-size:cover;"></div>
            <div class="p-info" style="text-align:center; padding:20px; margin-top:-50px;">
                <img src="${currentUser.avatar || 'https://via.placeholder.com/150'}" class="avatar" style="width:100px; height:100px; border-radius:50%; border:3px solid #000;">
                <h2>${currentUser.username} ${currentUser.sub ? '⭐' : ''}</h2>
                <p>${currentUser.bio || 'Слушатель Nova Sounds'}</p>
                <button class="glass-btn" onclick="openModal('edit-profile-modal')">Настроить профиль</button>
            </div>
        </div>
    `;
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    if(event) event.target.classList.add('active');
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

async function loadRecommendations() {
    const res = await fetch(`${API_URL}/api/recommendations`);
    const data = await res.json();
    allTracks = data.data;
    document.getElementById('tracks-container').innerHTML = allTracks.map(t => `
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
