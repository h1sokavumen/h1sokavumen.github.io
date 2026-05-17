import os
import sqlite3
from flask import Flask, render_template_string, request, redirect, session, send_from_directory, flash
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'super-secret-key-change-this'  # Ключ для сессий

# Настраиваем абсолютные пути
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
DB_NAME = os.path.join(BASE_DIR, 'cloud.db')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- БАЗА ДАННЫХ ---
def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        conn.commit()

init_db()

# --- КРАСИВЫЙ ДИЗАЙН (HTML + CSS) ---
CSS_STYLES = '''
<style>
    :root { --bg: #0f0f11; --card: #16161a; --primary: #7c3aed; --primary-hover: #6d28d9; --text: #ededf0; --text-muted: #94a3b8; --danger: #ef4444; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 20px; display: flex; justify-content: center; }
    .container { width: 100%; max-width: 800px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid #27272a; padding-bottom: 15px; }
    .card { background: var(--card); border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h2 { margin-top: 0; font-weight: 600; }
    .btn { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; transition: background 0.2s; }
    .btn:hover { background: var(--primary-hover); }
    .btn-danger { background: transparent; color: var(--danger); border: 1px solid var(--danger); padding: 6px 12px; }
    .btn-danger:hover { background: var(--danger); color: white; }
    .btn-logout { background: #27272a; color: var(--text); font-size: 14px; padding: 6px 12px; }
    .btn-logout:hover { background: #3f3f46; }
    .form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
    input[type="text"], input[type="password"] { background: #202024; border: 1px solid #3f3f46; color: white; padding: 10px; border-radius: 6px; font-size: 16px; width: 94%; }
    input[type="file"] { color: var(--text-muted); }
    .file-list { list-style: none; padding: 0; margin: 0; }
    .file-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #27272a; }
    .file-item:last-child { border-bottom: none; }
    .file-info a { color: var(--text); text-decoration: none; font-weight: 500; }
    .file-info a:hover { color: var(--primary); text-decoration: underline; }
    .alert { background: #2e1065; border: 1px solid var(--primary); color: #ddd6fe; padding: 12px; border-radius: 6px; margin-bottom: 20px; text-align: center; }
    .auth-box { max-width: 400px; margin: 80px auto; }
    .switch-link { text-align: center; margin-top: 15px; font-size: 14px; color: var(--text-muted); }
    .switch-link a { color: var(--primary); text-decoration: none; }
</style>
'''

# Вспомогательная функция для сборки страниц без использования внешних файлов
def render_page(content_html, **kwargs):
    full_html = f'''
    <!doctype html>
    <html lang="ru">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Личное Облако</title>
        {CSS_STYLES}
    </head>
    <body>
        <div class="container">
            {"{% with messages = get_flashed_messages() %}{% if messages %}{% for message in messages %}<div class='alert'>{{ message }}</div>{% endfor %}{% endif %}{% endwith %}"}
            {content_html}
        </div>
    </body>
    </html>
    '''
    return render_template_string(full_html, **kwargs)

# --- МАРШРУТЫ (ROUTES) ---

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect('/login')
    
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT filename FROM files WHERE user_id = ?', (session['user_id'],))
        user_files = cursor.fetchall()
        
    content = '''
    <div class="header">
        <h1>Привет, {{ session['username'] }}! 👋</h1>
        <a href="/logout" class="btn btn-logout">Выйти</a>
    </div>

    <div class="card">
        <h2>Загрузить файл</h2>
        <form method="post" enctype="multipart/form-data" action="/upload" style="display: flex; gap: 15px; align-items: center;">
            <input type="file" name="file" required>
            <button type="submit" class="btn">Загрузить</button>
        </form>
    </div>

    <div class="card">
        <h2>Ваши файлы в безопасности</h2>
        {% if files %}
            <ul class="file-list">
            {% for file in files %}
                <li class="file-item">
                    <div class="file-info">
                        <a href="/download/{{ file[0] }}">{{ file[0] }}</a>
                    </div>
                    <div class="actions">
                        <a href="/delete/{{ file[0] }}" class="btn btn-danger">Удалить</a>
                    </div>
                </li>
            {% endfor %}
            </ul>
        {% else %}
            <p style="color: var(--text-muted); margin: 0;">Вы еще не загрузили ни одного файла.</p>
        {% endif %}
    </div>
    '''
    return render_page(content, files=user_files)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']
        
        if not username or not password:
            flash('Заполните все поля!')
            return redirect('/register')
            
        hashed_password = generate_password_hash(password)
        try:
            with sqlite3.connect(DB_NAME) as conn:
                cursor = conn.cursor()
                cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
                conn.commit()
            flash('Регистрация успешна! Войдите в аккаунт.')
            return redirect('/login')
        except sqlite3.IntegrityError:
            flash('Этот логин уже занят!')
            
    content = '''
    <div class="card auth-box">
        <h2>Регистрация</h2>
        <form method="post">
            <div class="form-group">
                <label>Придумайте логин</label>
                <input type="text" name="username" required autocomplete="off">
            </div>
            <div class="form-group">
                <label>Придумайте пароль</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="btn" style="width: 100%; justify-content: center;">Создать аккаунт</button>
        </form>
        <div class="switch-link">Уже есть аккаунт? <a href="/login">Войти</a></div>
    </div>
    '''
    return render_page(content)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']
        
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, password FROM users WHERE username = ?', (username,))
            user = cursor.fetchone()
            
        if user and check_password_hash(user[1], password):
            session['user_id'] = user[0]
            session['username'] = username
            return redirect('/')
        else:
            flash('Неверный логин или пароль!')
            
    content = '''
    <div class="card auth-box">
        <h2>Вход в Облако</h2>
        <form method="post">
            <div class="form-group">
                <label>Логин</label>
                <input type="text" name="username" required autocomplete="off">
            </div>
            <div class="form-group">
                <label>Пароль</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="btn" style="width: 100%; justify-content: center;">Войти</button>
        </form>
        <div class="switch-link">Ещё нет аккаунта? <a href="/register">Регистрация</a></div>
    </div>
    '''
    return render_page(content)

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'user_id' not in session:
        return redirect('/login')
        
    if 'file' not in request.files:
        return 'Файл не найден', 400
    file = request.files['file']
    if file.filename == '':
        return 'Файл не выбран', 400
    
    secure_filename = f"{session['user_id']}_{file.filename}"
    file.save(os.path.join(UPLOAD_FOLDER, secure_filename))
    
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO files (user_id, filename) VALUES (?, ?)', (session['user_id'], file.filename))
        conn.commit()
        
    return redirect('/')

@app.route('/download/<filename>')
def download_file(filename):
    if 'user_id' not in session:
        return redirect('/login')
        
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM files WHERE user_id = ? AND filename = ?', (session['user_id'], filename))
        has_access = cursor.fetchone()
        
    if not has_access:
        return 'Доступ запрещен', 403
        
    secure_filename = f"{session['user_id']}_{filename}"
    return send_from_directory(UPLOAD_FOLDER, secure_filename, as_attachment=True)

@app.route('/delete/<filename>')
def delete_file(filename):
    if 'user_id' not in session:
        return redirect('/login')
        
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM files WHERE user_id = ? AND filename = ?', (session['user_id'], filename))
        if cursor.rowcount > 0:
            conn.commit()
            secure_filename = f"{session['user_id']}_{filename}"
            file_path = os.path.join(UPLOAD_FOLDER, secure_filename)
            if os.path.exists(file_path):
                os.remove(file_path)
            flash('Файл успешно удален!')
        else:
            flash('Ошибка удаления.')
            
    return redirect('/')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
