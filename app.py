from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json, os, subprocess, tempfile, sys, hashlib, secrets, re
from datetime import datetime

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    # Default users
    users = {
        "maloshko": {
            "password": hashlib.sha256("maksjmka2607".encode()).hexdigest(),
            "subscription": True,
            "admin": True,
            "created": datetime.now().isoformat()
        }
    }
    save_users(users)
    return users

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

# ───── Routes ─────

@app.route('/')
def index():
    return render_template('index.html', user=session.get('username'))

@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username','').strip()
        password = data.get('password','').strip()
        users = load_users()
        if not username or not password:
            return jsonify({'ok': False, 'msg': 'Заполните все поля'})
        if len(username) < 3:
            return jsonify({'ok': False, 'msg': 'Имя минимум 3 символа'})
        if username in users:
            return jsonify({'ok': False, 'msg': 'Пользователь уже существует'})
        users[username] = {
            "password": hash_password(password),
            "subscription": False,
            "admin": False,
            "created": datetime.now().isoformat()
        }
        save_users(users)
        session['username'] = username
        return jsonify({'ok': True})
    return render_template('register.html')

@app.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username','').strip()
        password = data.get('password','').strip()
        users = load_users()
        user = users.get(username)
        if not user or user['password'] != hash_password(password):
            return jsonify({'ok': False, 'msg': 'Неверный логин или пароль'})
        session['username'] = username
        return jsonify({'ok': True, 'admin': user.get('admin', False)})
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/learn/python')
def learn_python():
    return render_template('learn_python.html', user=session.get('username'))

@app.route('/learn/html')
def learn_html():
    return render_template('learn_html.html', user=session.get('username'))

@app.route('/editor')
def editor():
    username = session.get('username')
    if not username:
        return redirect('/login')
    users = load_users()
    user = users.get(username, {})
    has_sub = user.get('subscription', False) or user.get('admin', False)
    return render_template('editor.html', user=username, has_sub=has_sub)

@app.route('/admin')
def admin():
    username = session.get('username')
    if not username:
        return redirect('/login')
    users = load_users()
    user = users.get(username, {})
    if not user.get('admin', False):
        return redirect('/')
    return render_template('admin.html', user=username, users=users)

@app.route('/admin/grant', methods=['POST'])
def admin_grant():
    username = session.get('username')
    users = load_users()
    if not users.get(username, {}).get('admin'):
        return jsonify({'ok': False})
    data = request.get_json()
    target = data.get('target')
    action = data.get('action')  # 'grant' or 'revoke'
    if target in users:
        users[target]['subscription'] = (action == 'grant')
        save_users(users)
        return jsonify({'ok': True})
    return jsonify({'ok': False, 'msg': 'Пользователь не найден'})

@app.route('/run_python', methods=['POST'])
def run_python():
    username = session.get('username')
    if not username:
        return jsonify({'ok': False, 'output': 'Войдите в аккаунт'})
    users = load_users()
    user = users.get(username, {})
    if not user.get('subscription') and not user.get('admin'):
        return jsonify({'ok': False, 'output': '🔒 Нужна подписка (30 грн/мес)'})
    code = request.get_json().get('code', '')
    try:
        with tempfile.NamedTemporaryFile(suffix='.py', mode='w', delete=False) as f:
            f.write(code)
            fname = f.name
        result = subprocess.run(
            [sys.executable, fname],
            capture_output=True, text=True, timeout=5
        )
        os.unlink(fname)
        out = result.stdout + result.stderr
        return jsonify({'ok': True, 'output': out or '✅ Выполнено без вывода'})
    except subprocess.TimeoutExpired:
        return jsonify({'ok': True, 'output': '⏱ Превышено время выполнения (5с)'})
    except Exception as e:
        return jsonify({'ok': True, 'output': f'Ошибка: {e}'})

@app.route('/check_sub')
def check_sub():
    username = session.get('username')
    if not username:
        return jsonify({'has_sub': False})
    users = load_users()
    user = users.get(username, {})
    return jsonify({'has_sub': user.get('subscription', False) or user.get('admin', False)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
