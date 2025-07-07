document.addEventListener('DOMContentLoaded', () => {
    // --- Общий код без изменений (звезды, часы и т.д.) ---
    const canvas = document.getElementById('starfield'); const ctx = canvas.getContext('2d'); function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; } resizeCanvas(); window.addEventListener('resize', resizeCanvas); const stars = []; for (let i = 0; i < 300; i++) { stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 1.5, speed: Math.random() * 0.5 + 0.2 }); } function animateStars() { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'white'; stars.forEach(star => { ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fill(); star.y += star.speed; if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; } }); requestAnimationFrame(animateStars); } animateStars(); const timeEl = document.getElementById('time'); const dateEl = document.getElementById('date'); function updateTime() { const now = new Date(); timeEl.textContent = now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'}); dateEl.textContent = now.toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' }); } setInterval(updateTime, 1000); updateTime();
    
    // --- ОБНОВЛЕННАЯ ЛОГИКА МУЗЫКАЛЬНОГО ПЛЕЕРА ---
    const trackFileFormat = 'mp3'; const coverFileFormat = 'jpg';
    const playlist = [
      const playlist = [
        { artist: "11", title: "11" },
        { artist: "Alavys", title: "Трать мои бабосы" },
        { artist: "CUPSIZE", title: "Юра, Юра" },
        { artist: "dabbackwood", title: "марафеты" },
        { artist: "dj trippie", title: "flameboy - b0lit" },
        { artist: "Enina", title: "кончил" },
        { artist: "enveel", title: "Призрак" },
        { artist: "Bushido zho", title: "Дай мне посмотреть" },
        { artist: "Kempel", title: "Тема Е" },
        { artist: "KERASINN", title: "Купидон" },
        { artist: "Lida", title: "Серега Пират - ЧСВ" },
        { artist: "madk1d", title: "Барыга" },
        { artist: "Measora", title: "кисы - котики" },
        { artist: "nnoluvv", title: "Пошлая Блондинка" },
        { artist: "ooes", title: "зима" },
        { artist: "Playboi", title: "Carti - Miss the Rage" },
        { artist: "Playboi", title: "Carti-Sky" },
        { artist: "The Black Eyed Peas", title: "Rock That Body" },
        { artist: "whitek3d", title: "Катюха" },
        { artist: "А чё чё", title: "Бьянка" },
        { artist: "Валентин", title: "Стрыкло_Песня_для_девочек" },
        { artist: "Канги,_mzlff,", title: "STED_D_Буря,_метель_и_мгла" },
        { artist: "Контракт,", title: " - Пошлая Молли" },
        { artist: "Кузнецкий Сквад", title: "Клубника" },
        { artist: "Мулен Руж", title: "Бьянка" },
        { artist: "Пасош-я", title: "очень устал" },
        { artist: "Пачка", title: " сигарет - В Цой Кино" },
        { artist: "Пошлая Молли", title: "Нон стоп" },
        { artist: "Пошлая Молли", title: "Паки пуси" },
        { artist: "просто лера", title: "Мне 20" },
        { artist: "урал гайсин", title: "священный война" },
        { artist: "ФРЕНДЗОНА", title: "Психолог" },
        { artist: "Юпи, FORTUNA 812", title: "Не думаю" },
        { artist: "Бонд с кнопкой", title: "Кухни" },
    ];
    
    // Элементы плеера
    const audio = new Audio(); const playPauseBtn = document.getElementById('play-pause-btn'); const prevBtn = document.getElementById('prev-btn'); const nextBtn = document.getElementById('next-btn'); const albumCover = document.getElementById('album-cover'); const trackTitleEl = document.getElementById('track-title'); const trackArtistEl = document.getElementById('track-artist'); const progressContainer = document.getElementById('progress-container'); const progressBar = document.getElementById('progress-bar'); const currentTimeEl = document.getElementById('current-time'); const totalTimeEl = document.getElementById('total-time'); const volumeIcon = document.getElementById('volume-icon'); const volumeSlider = document.getElementById('volume-slider'); const repeatBtn = document.getElementById('repeat-btn'); const shuffleBtn = document.getElementById('shuffle-btn'); const playlistToggleBtn = document.getElementById('playlist-toggle-btn'); const playlistMenu = document.getElementById('playlist-menu'); const playlistList = document.getElementById('playlist-list');
    
    let currentTrackIndex = 0; let isRepeat = false; let isShuffle = false;

    // Функции плеера
    function loadTrack(trackIndex) { if (!playlist[trackIndex]) return; const trackData = playlist[trackIndex]; currentTrackIndex = trackIndex; audio.src = `sound/${trackIndex + 1}.${trackFileFormat}`; albumCover.src = `covers/${trackIndex + 1}.${coverFileFormat}`; trackTitleEl.textContent = trackData.title; trackArtistEl.textContent = trackData.artist; highlightActiveSong(); }
    
    // ==========================================================
    // ▼▼▼ ИЗМЕНЕНА ФУНКЦИЯ ВОСПРОИЗВЕДЕНИЯ ▼▼▼
    // ==========================================================
    function playTrack() {
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Воспроизведение успешно началось
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            })
            .catch(error => {
                // Браузер заблокировал воспроизведение
                console.error("Ошибка воспроизведения (вероятно, блокировка автоплея):", error);
                // Показываем пользователю, что нужно нажать Play еще раз
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            });
        }
    }
    
    function pauseTrack() { audio.pause(); playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; }
    function prevTrack() { const newIndex = isShuffle ? getRandomIndex() : (currentTrackIndex - 1 + playlist.length) % playlist.length; loadTrack(newIndex); playTrack(); }
    function nextTrack() { const newIndex = isShuffle ? getRandomIndex() : (currentTrackIndex + 1) % playlist.length; loadTrack(newIndex); playTrack(); }
    function getRandomIndex() { let newIndex; do { newIndex = Math.floor(Math.random() * playlist.length); } while (newIndex === currentTrackIndex && playlist.length > 1); return newIndex; }

    // Обработчики событий
    playPauseBtn.addEventListener('click', () => audio.paused ? playTrack() : pauseTrack()); prevBtn.addEventListener('click', prevTrack); nextBtn.addEventListener('click', nextTrack);
    
    audio.addEventListener('ended', () => {
        if (isRepeat) {
            audio.currentTime = 0;
            playTrack();
        } else {
            // Эта функция теперь безопасна для мобильных устройств
            nextTrack();
        }
    });

    repeatBtn.addEventListener('click', () => { isRepeat = !isRepeat; repeatBtn.classList.toggle('active', isRepeat); });
    shuffleBtn.addEventListener('click', () => { isShuffle = !isShuffle; shuffleBtn.classList.toggle('active', isShuffle); });
    
    // Прогресс бар, время, громкость
    function updateProgress(e) { const { duration, currentTime } = e.srcElement; if (duration) { progressBar.style.width = `${(currentTime / duration) * 100}%`; totalTimeEl.textContent = formatTime(duration); currentTimeEl.textContent = formatTime(currentTime); } }
    function setProgress(e) { const width = this.clientWidth, clickX = e.offsetX, duration = audio.duration; if (duration) audio.currentTime = (clickX / width) * duration; }
    function formatTime(seconds) { if (isNaN(seconds)) return "0:00"; const min = Math.floor(seconds / 60); const sec = Math.floor(seconds % 60); return `${min}:${sec < 10 ? '0' : ''}${sec}`; }
    audio.addEventListener('timeupdate', updateProgress); progressContainer.addEventListener('click', setProgress);
    function setVolume(e) { audio.volume = e.target.value; updateVolumeIcon(); }
    function updateVolumeIcon() { if (audio.volume > 0.5) volumeIcon.className = 'fas fa-volume-high'; else if (audio.volume > 0) volumeIcon.className = 'fas fa-volume-low'; else volumeIcon.className = 'fas fa-volume-xmark'; }
    volumeSlider.addEventListener('input', setVolume); volumeIcon.addEventListener('click', () => { audio.muted = !audio.muted; volumeIcon.style.color = audio.muted ? '#ff6b6b' : '#bbb'; });

    // Логика меню плейлиста
    function renderPlaylist() { playlistList.innerHTML = ''; playlist.forEach((song, index) => { const li = document.createElement('li'); li.dataset.index = index; li.innerHTML = `<span class="track-num">${index + 1}</span><div class="track-details"><div class="title">${song.title}</div><div class="artist">${song.artist}</div></div>`; li.addEventListener('click', () => { loadTrack(index); playTrack(); playlistMenu.classList.remove('active'); }); playlistList.appendChild(li); }); }
    function highlightActiveSong() { const allSongs = playlistList.querySelectorAll('li'); allSongs.forEach(song => song.classList.remove('active-song')); const activeSong = playlistList.querySelector(`li[data-index="${currentTrackIndex}"]`); if (activeSong) { activeSong.classList.add('active-song'); } }
    playlistToggleBtn.addEventListener('click', () => { playlistMenu.classList.toggle('active'); });

    // Инициализация
    if (playlist.length > 0) { renderPlaylist(); loadTrack(currentTrackIndex); } else { trackTitleEl.textContent = "Плейлист пуст"; }
});
