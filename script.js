document.addEventListener('DOMContentLoaded', () => {
    // --- СЛОВАРЬ ДЛЯ ПЕРЕВОДА ---
    const translations = {
        home: { ru: 'Главная', ua: 'Головна' }, search: { ru: 'Поиск', ua: 'Пошук' }, settings: { ru: 'Настройки', ua: 'Налаштування' }, album: { ru: 'АЛЬБОМ', ua: 'АЛЬБОМ' }, title: { ru: 'НАЗВАНИЕ', ua: 'НАЗВА' }, artist_col: { ru: 'АРТИСТ', ua: 'АРТИСТ' }, theme: { ru: 'Тема', ua: 'Тема' }, light: { ru: 'Светлая', ua: 'Світла' }, dark: { ru: 'Тёмная', ua: 'Темна' }, language: { ru: 'Язык', ua: 'Мова' }, close: { ru: 'Закрыть', ua: 'Закрити' }, search_placeholder: { ru: 'Что хотите послушать?', ua: 'Що хочете послухати?' }, upload_song: { ru: 'Загрузить свою песню', ua: 'Завантажити свою пісню' }, select_file: { ru: 'Выбрать файл', ua: 'Обрати файл' }
    };

    // --- ДАННЫЕ ПЛЕЙЛИСТА ---
    const defaultPlaylistTitle = 'Хиты ᴀɢʀᴏʜɪꜱǫ';
    const albumCover = 'images/cover1.jpg';
    const basePlaylist = [
        { id: 0, title: '11 - Кишлак', artist: 'Артист 1', duration: '?:??', file: 'sound/1.mp3' },
        { id: 1, title: '104972edf8590', artist: 'Артист 2', duration: '?:??', file: 'sound/2.mp3' },
        { id: 2, title: '1049728590', artist: 'Артист 3', duration: '?:??', file: 'sound/3.mp3' },
        { id: 3, title: 'Юра, Юра - CUPSIZE', artist: 'Артист 4', duration: '?:??', file: 'sound/4.mp3' },
        { id: 4, title: 'Марафеты - dabbackwood', artist: 'Артист 5', duration: '?:??', file: 'sound/5.mp3' },
        { id: 5, title: 'b0lit - dj trippie flameboy', artist: 'Артист 6', duration: '?:??', file: 'sound/6.mp3' },
        { id: 6, title: 'Кончил - Enina', artist: 'Артист 7', duration: '?:??', file: 'sound/7.mp3' },
        { id: 7, title: 'Дай мне посмотреть - Heronwater, BUSHIDO ZHO', artist: 'Артист 8', duration: '?:??', file: 'sound/8.mp3' },
        { id: 8, title: 'Купидон - KERASINN', artist: 'Артист 9', duration: '?:??', file: 'sound/9.mp3' },
        { id: 9, title: 'ЧСВ - Lida, Серега Пират', artist: 'Артист 10', duration: '?:??', file: 'sound/10.mp3' },
        { id: 10, title: 'Барыга - madk1d', artist: 'Артист 11', duration: '?:??', file: 'sound/11.mp3' },
        { id: 11, title: 'Кисы - котики - Measora', artist: 'Артист 12', duration: '?:??', file: 'sound/12.mp3' },
        { id: 12, title: 'Не киряй - Мукка, Три дня дождя', artist: 'Артист 13', duration: '?:??', file: 'sound/13.mp3' },
        { id: 13, title: 'Пошлая Блондинка - nnoluvv', artist: 'Артист 14', duration: '?:??', file: 'sound/14.mp3' },
        { id: 14, title: 'Miss the Rage - Playboi Carti', artist: 'Артист 15', duration: '?:??', file: 'sound/15.mp3' },
        { id: 15, title: 'Sky - Playboi Carti', artist: 'Артист 16', duration: '?:??', file: 'sound/16.mp3' },
        { id: 16, title: 'Rock That Body - The Black Eyed Peas', artist: 'Артист 17', duration: '?:??', file: 'sound/17.mp3' },
        { id: 17, title: 'Катюха - whitek3d', artist: 'Артист 18', duration: '?:??', file: 'sound/18.mp3' },
        { id: 18, title: 'А чё чё - Бьянка', artist: 'Артист 19', duration: '?:??', file: 'sound/19.mp3' },
        { id: 19, title: 'Песня для девочек - Валентин Стрыкало', artist: 'Артист 20', duration: '?:??', file: 'sound/20.mp3' },
        { id: 20, title: 'Буря, метель и мгла - Канги, mzlff, STED.D', artist: 'Артист 21', duration: '?:??', file: 'sound/21.mp3' },
        { id: 21, title: 'Контракт - Пошлая Молли', artist: 'Артист 22', duration: '?:??', file: 'sound/22.mp3' },
        { id: 22, title: 'Клубника - Кузнецкий Сквад', artist: 'Артист 23', duration: '?:??', file: 'sound/23.mp3' },
        { id: 23, title: 'Мулен Руж - Бьянка', artist: 'Артист 24', duration: '?:??', file: 'sound/24.mp3' },
        { id: 24, title: 'Я очень устал - Пасош', artist: 'Артист 25', duration: '?:??', file: 'sound/25.mp3' },
        { id: 25, title: 'Пачка сигарет - Кино (Виктор Цой)', artist: 'Артист 26', duration: '?:??', file: 'sound/26.mp3' },
        { id: 26, title: 'Нон стоп - Пошлая Молли', artist: 'Артист 27', duration: '?:??', file: 'sound/27.mp3' },
        { id: 27, title: 'Паки пуси - Пошлая Молли', artist: 'Артист 28', duration: '?:??', file: 'sound/28.mp3' },
        { id: 28, title: 'Священная война - Урал Гайсин', artist: 'Артист 29', duration: '?:??', file: 'sound/29.mp3' },
        { id: 29, title: '_bedwars_pro_', artist: 'Артист 30', duration: '?:??', file: 'sound/30.mp3' },
        { id: 30, title: 'Новый трек 31', artist: 'Артист 31', duration: '?:??', file: 'sound/31.mp3' }
    ];

    // --- ПОИСК ЭЛЕМЕНТОВ DOM ---
    const musicPlayer = document.getElementById('music-player'), playerBar = document.querySelector('.player-bar'), songListBody = document.getElementById('song-list-body'), mainPlaylistCover = document.getElementById('playlist-cover'), mainPlaylistTitle = document.getElementById('playlist-title'), navItems = { home: document.getElementById('nav-home'), search: document.getElementById('nav-search') }, views = { home: document.getElementById('home-view'), search: document.getElementById('search-view') }, searchInput = document.getElementById('search-input'), searchResultsContainer = document.getElementById('search-results-container'), settingsModal = document.getElementById('settings-modal'), closeModalBtn = document.getElementById('close-modal-btn'), settingsBtnDesktop = document.getElementById('settings-btn-desktop'), settingsBtnMobile = document.getElementById('settings-btn-mobile'), themeToggle = document.getElementById('theme-toggle'), languageSelector = document.getElementById('language-selector'), uploadInput = document.getElementById('upload-input'), uploadMessage = document.getElementById('upload-message');
    let fullPlaylist = [], currentTrackIndex = 0, isPlaying = false, resumeTime = 0, playPauseBtn, prevBtn, nextBtn, progressBar, volumeBar, currentTimeEl, totalDurationEl, nowPlayingCover, nowPlayingTitle, nowPlayingArtist;
    let deviceId, STATE_KEY, USER_TRACKS_KEY;

    // --- УПРАВЛЕНИЕ НАСТРОЙКАМИ И СОСТОЯНИЕМ ---
    function getDeviceId() {
        let id = localStorage.getItem('agrohisq_deviceId');
        if (!id) {
            id = 'device_' + Date.now() + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('agrohisq_deviceId', id);
        }
        return id;
    }

    function saveState() {
        const state = { theme: document.body.classList.contains('light-theme') ? 'light' : 'dark', language: languageSelector.value, playlistTitle: mainPlaylistTitle.textContent, lastTrackIndex: currentTrackIndex, lastTrackTime: isPlaying ? musicPlayer.currentTime : resumeTime };
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }

    function loadState() {
        const savedState = JSON.parse(localStorage.getItem(STATE_KEY)), defaultState = { theme: 'dark', language: 'ru', playlistTitle: defaultPlaylistTitle, lastTrackIndex: 0, lastTrackTime: 0 }, state = { ...defaultState, ...savedState };
        const userTracks = JSON.parse(localStorage.getItem(USER_TRACKS_KEY)) || [];
        fullPlaylist = [...basePlaylist, ...userTracks];
        document.body.classList.toggle('light-theme', state.theme === 'light');
        themeToggle.checked = state.theme === 'dark';
        languageSelector.value = state.language;
        mainPlaylistTitle.textContent = state.playlistTitle;
        currentTrackIndex = state.lastTrackIndex;
        resumeTime = state.lastTrackTime;
        setLanguage(state.language);
    }
    
    // --- ЗАГРУЗКА ФАЙЛОВ ---
    function handleFileUpload(event) {
        const file = event.target.files[0]; if (!file) return;
        if (!file.type.startsWith('audio/mpeg')) { uploadMessage.textContent = 'Ошибка: Пожалуйста, выберите MP3 файл.'; return; }
        if (file.size > 4 * 1024 * 1024) { uploadMessage.textContent = 'Ошибка: Файл слишком большой (макс. 4 МБ).'; return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result, newTrack = { id: `user_${Date.now()}`, title: file.name.replace('.mp3', ''), artist: 'Локальный файл', duration: '?:??', file: dataUrl };
            let userTracks = JSON.parse(localStorage.getItem(USER_TRACKS_KEY)) || [];
            userTracks.push(newTrack); localStorage.setItem(USER_TRACKS_KEY, JSON.stringify(userTracks));
            uploadMessage.textContent = `Трек "${newTrack.title}" успешно добавлен!`; uploadInput.value = '';
            fullPlaylist = [...basePlaylist, ...userTracks]; renderPlaylist(songListBody, fullPlaylist);
        };
        reader.onerror = () => { uploadMessage.textContent = 'Ошибка при чтении файла.'; };
        reader.readAsDataURL(file);
    }
    
    // --- ОСНОВНЫЕ ФУНКЦИИ ---
    function setLanguage(lang) { Object.keys(translations).forEach(key => { const el = document.querySelector(`[data-translate-key="${key}"]`); if(el && translations[key][lang]) el.textContent = translations[key][lang]; const pl = document.querySelector(`[data-translate-placeholder="${key}"]`); if(pl && translations[key][lang]) pl.placeholder = translations[key][lang]; }); }
    function switchView(viewKey) { Object.values(views).forEach(v => v.classList.remove('active-view')); views[viewKey].classList.add('active-view'); Object.values(navItems).forEach(i => i.classList.remove('active')); navItems[viewKey].classList.add('active'); }
    function renderPlaylist(container, data) { container.innerHTML = ''; data.forEach(track => { const index = fullPlaylist.findIndex(p => p.id === track.id); const row = document.createElement('tr'); row.dataset.index = index; row.innerHTML = `<td>${index + 1}</td><td><div style="display:flex; align-items:center;"><img src="${albumCover}" width="40" height="40" style="margin-right:12px;"><div><div>${track.title}</div><div style="font-size:12px; color:var(--text-muted-color);">${track.artist}</div></div></div></td><td>${track.artist}</td><td>${track.duration}</td>`; container.appendChild(row); }); }
    function performSearch() { const query = searchInput.value.toLowerCase(); if (!query) { searchResultsContainer.innerHTML = ''; return; } const results = fullPlaylist.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)); const table = document.createElement('table'); table.className = 'song-table'; const tbody = document.createElement('tbody'); table.appendChild(tbody); searchResultsContainer.innerHTML = ''; searchResultsContainer.appendChild(table); renderPlaylist(tbody, results); }
    function loadTrack(trackIndex) { if(trackIndex >= fullPlaylist.length || trackIndex < 0) trackIndex = 0; currentTrackIndex = trackIndex; const track = fullPlaylist[trackIndex]; musicPlayer.src = track.file; nowPlayingCover.src = track.id.toString().startsWith('user_') ? 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' : albumCover; nowPlayingTitle.textContent = track.title; nowPlayingArtist.textContent = track.artist; document.title = `${track.title} · ${track.artist}`; }
    function play() { isPlaying = true; musicPlayer.play(); playPauseBtn.querySelector('.play-icon').style.display = 'none'; playPauseBtn.querySelector('.pause-icon').style.display = 'block'; }
    function pause() { isPlaying = false; musicPlayer.pause(); resumeTime = musicPlayer.currentTime; playPauseBtn.querySelector('.play-icon').style.display = 'block'; playPauseBtn.querySelector('.pause-icon').style.display = 'none'; }
    function prevTrack() { const newIndex = (currentTrackIndex - 1 + fullPlaylist.length) % fullPlaylist.length; loadTrack(newIndex); play(); }
    function nextTrack() { const newIndex = (currentTrackIndex + 1) % fullPlaylist.length; loadTrack(newIndex); play(); }
    function updateProgress() { const { duration, currentTime } = musicPlayer; if (duration) { progressBar.value = (currentTime / duration) * 100 || 0; const formatTime = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; currentTimeEl.textContent = formatTime(currentTime); totalDurationEl.textContent = formatTime(duration); } }

    // --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ---
    function init() {
        deviceId = getDeviceId();
        STATE_KEY = `agrohisq_state_${deviceId}`;
        USER_TRACKS_KEY = `agrohisq_user_tracks_${deviceId}`;

        playerBar.innerHTML = `<div class="now-playing"><img src="" alt="Now Playing" id="now-playing-cover"><div class="track-info"><div id="now-playing-title"></div><div id="now-playing-artist"></div></div></div><div class="player-controls-center"><div class="player-buttons"><button class="control-btn shuffle"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M14.83,13.41L13.42,14.82L16.24,17.65L14.83,19.06L17.66,21.89L19.07,20.47L14.83,16.23M19.07,3.53L17.66,2.11L14.83,4.94L16.24,6.35L19.07,3.53M7.06,8.5L8.5,7.05L12.7,11.25L7.05,16.9L5.64,15.47L9.85,11.25L7.06,8.5M17.65,11.26L16.24,12.67L14.83,11.26L13.42,12.67L10.59,9.84L12,8.42L16.24,12.67L17.65,11.26Z" /></svg></button><button id="prev-btn" class="control-btn"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" /></svg></button><button id="play-pause-btn" class="control-btn play"><svg class="play-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg><svg class="pause-icon" viewBox="0 0 24 24" style="display:none;"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg></button><button id="next-btn" class="control-btn"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" /></svg></button><button class="control-btn repeat"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z" /></svg></button></div><div class="progress-container-main"><span id="current-time" class="time">0:00</span><input type="range" id="progress-bar" class="progress-bar" value="0"><span id="total-duration" class="time">0:00</span></div></div><div class="player-controls-right"><span class="volume-icon"></span><input type="range" id="volume-bar" class="volume-bar" value="100"></div>`;
        playPauseBtn = document.getElementById('play-pause-btn'); prevBtn = document.getElementById('prev-btn'); nextBtn = document.getElementById('next-btn'); progressBar = document.getElementById('progress-bar'); volumeBar = document.getElementById('volume-bar'); currentTimeEl = document.getElementById('current-time'); totalDurationEl = document.getElementById('total-duration'); nowPlayingCover = document.getElementById('now-playing-cover'); nowPlayingTitle = document.getElementById('now-playing-title'); nowPlayingArtist = document.getElementById('now-playing-artist');
        loadState(); mainPlaylistCover.src = albumCover; renderPlaylist(songListBody, fullPlaylist);
        if (fullPlaylist.length > 0) loadTrack(currentTrackIndex);
        navItems.home.addEventListener('click', () => switchView('home')); navItems.search.addEventListener('click', () => switchView('search'));
        settingsBtnDesktop.addEventListener('click', () => settingsModal.classList.add('show')); settingsBtnMobile.addEventListener('click', () => settingsModal.classList.add('show'));
        closeModalBtn.addEventListener('click', () => settingsModal.classList.remove('show')); window.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.remove('show'); });
        themeToggle.addEventListener('change', () => { document.body.classList.toggle('light-theme', !themeToggle.checked); saveState(); });
        languageSelector.addEventListener('change', () => { setLanguage(languageSelector.value); saveState(); });
        mainPlaylistTitle.addEventListener('blur', saveState);
        searchInput.addEventListener('input', performSearch);
        uploadInput.addEventListener('change', handleFileUpload);
        playPauseBtn.addEventListener('click', () => { if (fullPlaylist.length > 0) isPlaying ? pause() : play(); }); prevBtn.addEventListener('click', () => fullPlaylist.length > 0 && prevTrack()); nextBtn.addEventListener('click', () => fullPlaylist.length > 0 && nextTrack());
        musicPlayer.addEventListener('timeupdate', updateProgress); musicPlayer.addEventListener('ended', nextTrack);
        musicPlayer.addEventListener('loadedmetadata', () => { if (resumeTime) { musicPlayer.currentTime = resumeTime; resumeTime = 0; } updateProgress(); });
        volumeBar.addEventListener('input', e => { musicPlayer.volume = e.target.value / 100; });
        progressBar.addEventListener('input', () => { if(musicPlayer.duration) musicPlayer.currentTime = (progressBar.value / 100) * musicPlayer.duration; });
        document.querySelector('.main-content').addEventListener('click', e => { const row = e.target.closest('tr'); if (row?.dataset.index) { const trackIndex = parseInt(row.dataset.index, 10); if (trackIndex !== currentTrackIndex || !isPlaying) { loadTrack(trackIndex); play(); } } });
        window.addEventListener('beforeunload', saveState);
    }
    init();
});
