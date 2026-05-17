import os
import shutil
import sqlite3
from flask import Flask, render_template, request, jsonify, send_from_directory, session

app = Flask(__name__)
app.secret_key = 'super_secret_cloud_key'

UPLOAD_FOLDER = 'uploads'
os.makedirs(os.path.join(UPLOAD_FOLDER, 'users'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_FOLDER, 'parties'), exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS parties (name TEXT PRIMARY KEY, password TEXT, owner TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS party_members (username TEXT, party_name TEXT)')
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def get_real_path(rel_path):
    if '..' in rel_path: return None
    if rel_path.startswith('Party_'):
        return os.path.join(app.config['UPLOAD_FOLDER'], 'parties', rel_path)
    else:
        return os.path.join(app.config['UPLOAD_FOLDER'], 'users', session['username'], rel_path)

@app.route('/')
def home(): return render_template('index.html')

# --- МУЗЫКА ---
@app.route('/music')
def get_music():
    if os.path.exists('1.mp3'):
        return send_from_directory(os.getcwd(), '1.mp3')
    return "No music", 404

# --- АВТОРИЗАЦИЯ ---
@app.route('/auth/me', methods=['GET'])
def check_auth():
    if 'username' in session: return jsonify({'logged_in': True, 'username': session['username']})
    return jsonify({'logged_in': False})

@app.route('/auth/register', methods=['POST'])
def register():
    username = request.form.get('username')
    password = request.form.get('password')
    db = get_db()
    if db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone():
        return jsonify({'success': False, 'error': 'Логин уже занят!'})
    db.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
    db.commit()
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'users', username), exist_ok=True)
    session['username'] = username
    return jsonify({'success': True})

@app.route('/auth/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password)).fetchone()
    if user:
        session['username'] = username
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Неверный логин или пароль!'})

@app.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({'success': True})

# --- ФАЙЛЫ ---
@app.route('/list', methods=['POST'])
def list_files():
    if 'username' not in session: return "Unauthorized", 401
    target_dir = get_real_path(request.form.get('path', ''))
    os.makedirs(target_dir, exist_ok=True)
    items = []
    for f in os.listdir(target_dir):
        items.append({'name': f, 'is_dir': os.path.isdir(os.path.join(target_dir, f))})
    return jsonify(items)

@app.route('/upload', methods=['POST'])
def upload_file():
    target_dir = get_real_path(request.form.get('path', ''))
    file = request.files.get('file')
    if file: file.save(os.path.join(target_dir, file.filename))
    return "ОК", 200

@app.route('/create_folder', methods=['POST'])
def create_folder():
    target_dir = get_real_path(request.form.get('path', ''))
    os.makedirs(os.path.join(target_dir, request.form.get('name', '')), exist_ok=True)
    return "ОК", 200

@app.route('/delete', methods=['POST'])
def delete_item():
    full_path = os.path.join(get_real_path(request.form.get('path', '')), request.form.get('name', ''))
    if os.path.exists(full_path):
        shutil.rmtree(full_path) if os.path.isdir(full_path) else os.remove(full_path)
    return "ОК", 200

@app.route('/download', methods=['GET'])
def download():
    target_dir = get_real_path(request.args.get('path', ''))
    return send_from_directory(target_dir, request.args.get('name', ''), as_attachment=False) # Изменено для предпросмотра

# --- ПРОДВИНУТОЕ ПЕРЕМЕЩЕНИЕ ФАЙЛОВ ---
@app.route('/move_advanced', methods=['POST'])
def move_advanced():
    old_full = os.path.join(get_real_path(request.form.get('old_path', '')), request.form.get('filename', ''))
    new_full = os.path.join(get_real_path(request.form.get('new_path', '')), request.form.get('filename', ''))
    
    if os.path.exists(old_full):
        os.makedirs(get_real_path(request.form.get('new_path', '')), exist_ok=True)
        shutil.move(old_full, new_full)
        return "ОК", 200
    return "Ошибка", 400

# --- PARTY ---
@app.route('/party/create', methods=['POST'])
def create_party():
    name = request.form.get('name')
    password = request.form.get('password')
    username = session['username']
    db = get_db()
    if db.execute('SELECT * FROM parties WHERE name = ?', (name,)).fetchone(): return jsonify({'success': False, 'error': 'Занято!'})
    db.execute('INSERT INTO parties (name, password, owner) VALUES (?, ?, ?)', (name, password, username))
    db.execute('INSERT INTO party_members (username, party_name) VALUES (?, ?)', (username, name))
    db.commit()
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'parties', 'Party_' + name), exist_ok=True)
    return jsonify({'success': True})

@app.route('/party/join', methods=['POST'])
def join_party():
    name = request.form.get('name')
    password = request.form.get('password')
    username = session['username']
    db = get_db()
    party = db.execute('SELECT * FROM parties WHERE name = ? AND password = ?', (name, password)).fetchone()
    if party:
        if not db.execute('SELECT * FROM party_members WHERE username = ? AND party_name = ?', (username, name)).fetchone():
            db.execute('INSERT INTO party_members (username, party_name) VALUES (?, ?)', (username, name))
            db.commit()
        return jsonify({"success": True, "folder": 'Party_' + name})
    return jsonify({"success": False, "error": "Неверный пароль!"})

@app.route('/party/list', methods=['GET'])
def list_parties():
    db = get_db()
    parties = db.execute('SELECT party_name FROM party_members WHERE username = ?', (session['username'],)).fetchall()
    return jsonify([{'name': p['party_name'], 'folder': 'Party_' + p['party_name']} for p in parties])

if __name__ == '__main__':
    app.run(debug=True)