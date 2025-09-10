from flask import Flask, render_template, request, redirect, url_for, session, flash
import uuid

app = Flask(__name__)
app.secret_key = 'your_super_secret_key_here' # Замените на сложный и уникальный ключ!

# Временная база данных для пользователей
users = {}
# Установка статуса премиум для пользователя captil762
users['captil762'] = {'password': 'test_password', 'is_premium': True, 'submission_id': None}

# Временное хранилище для анкет, теперь с уникальными ID и статусом
anketa_submissions = {}

# Переменные для рекламы и ссылок
TELEGRAM_LINK = "https://t.me/caprials"
DISCORD_LINK = "https://discord.gg/XEsvGGZXC3"
AD_MESSAGE = "Мы ищем талантливых разработчиков! Присоединяйтесь к нашему сообществу в Telegram и Discord."

# --- ОСНОВНЫЕ МАРШРУТЫ ПРИЛОЖЕНИЯ ---

@app.route('/')
def home():
    username = session.get('username')
    return render_template('index.html', 
                           username=username, 
                           telegram_link=TELEGRAM_LINK, 
                           discord_link=DISCORD_LINK, 
                           ad_message=AD_MESSAGE)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users:
            flash('Имя пользователя уже занято. Попробуйте другое.')
            return redirect(url_for('register'))
        users[username] = {'password': password, 'is_premium': False, 'submission_id': None}
        flash('Регистрация прошла успешно! Теперь вы можете войти.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and users[username]['password'] == password:
            session['username'] = username
            flash('Вы успешно вошли в систему.')
            return redirect(url_for('home'))
        flash('Неверное имя пользователя или пароль.')
        return render_template('login.html')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('Вы вышли из системы.')
    return redirect(url_for('home'))

# --- МАРШРУТЫ АНКЕТЫ ---

@app.route('/anketa')
def anketa():
    if 'username' not in session or session['username'] not in users:
        flash('Ваша сессия устарела. Пожалуйста, войдите снова.')
        session.pop('username', None)
        return redirect(url_for('login'))
    
    username = session['username']
    submission_id = users[username].get('submission_id')
    
    if submission_id:
        submission = anketa_submissions.get(submission_id)
        if submission and submission.get('status') in ['pending', 'accepted', 'rejected', 'resubmit']:
            return render_template('anketa_status.html', submission=submission)
    
    return render_template('anketa.html')

@app.route('/submit_anketa', methods=['POST'])
def submit_anketa():
    if 'username' not in session or session['username'] not in users:
        flash('Чтобы заполнить анкету, пожалуйста, войдите в систему.')
        return redirect(url_for('login'))
        
    username = session['username']
    
    new_submission_id = str(uuid.uuid4())
    is_premium = users[username]['is_premium']
    
    submission = {
        'id': new_submission_id,
        'user': username,
        'name': request.form['name'],
        'telegram': request.form['telegram'],
        'experience': request.form['experience'],
        'goals': request.form['goals'],
        'status': 'pending',
        'admin_message': None,
        'priority': 'High' if is_premium else 'Normal'
    }
    
    anketa_submissions[new_submission_id] = submission
    users[username]['submission_id'] = new_submission_id
    
    if is_premium:
        flash('Спасибо! Ваша анкета отправлена вне очереди.')
    else:
        flash('Спасибо, ваша анкета успешно отправлена на рассмотрение!')
    return redirect(url_for('anketa'))

# --- МАРШРУТЫ АДМИН-ПАНЕЛИ ---

@app.route('/admin/anketa_list')
def view_anketa_list():
    submissions_list = list(anketa_submissions.values())
    submissions_list.sort(key=lambda x: x['priority'], reverse=True)
    return render_template('anketa_list.html', submissions=submissions_list)

@app.route('/admin/accept_anketa/<submission_id>')
def accept_anketa(submission_id):
    submission = anketa_submissions.get(submission_id)
    if submission:
        submission['status'] = 'accepted'
        submission['admin_message'] = 'Ваша анкета принята! Мы скоро с вами свяжемся.'
        flash(f'Анкета от {submission["user"]} успешно принята.')
    return redirect(url_for('view_anketa_list'))

@app.route('/admin/reject_anketa/<submission_id>')
def reject_anketa(submission_id):
    submission = anketa_submissions.get(submission_id)
    if submission:
        submission['status'] = 'rejected'
        submission['admin_message'] = 'К сожалению, ваша анкета была отклонена. Спасибо за интерес.'
        flash(f'Анкета от {submission["user"]} отклонена.')
    return redirect(url_for('view_anketa_list'))

@app.route('/admin/resubmit_anketa/<submission_id>')
def resubmit_anketa(submission_id):
    submission = anketa_submissions.get(submission_id)
    if submission:
        submission['status'] = 'resubmit'
        submission['admin_message'] = 'Ваша анкета требует доработки. Пожалуйста, заполните её повторно, указав более подробную информацию о своих целях.'
        flash(f'Для анкеты от {submission["user"]} запрошена пересдача.')
    return redirect(url_for('view_anketa_list'))

# --- ДОПОЛНИТЕЛЬНЫЕ МАРШРУТЫ (ПРЕМИУМ) ---

@app.route('/premium')
def premium_page():
    if 'username' not in session or session['username'] not in users:
        flash('Для доступа к этой странице вам нужно войти.')
        return redirect(url_for('login'))
    
    user_info = users.get(session['username'])
    
    if not user_info['is_premium']:
        flash('Оформите премиум-подписку для доступа к этому контенту.')
        return redirect(url_for('home'))
        
    return render_template('premium.html')

@app.route('/buy_premium')
def buy_premium():
    if 'username' not in session or session['username'] not in users:
        flash('Для покупки подписки вам нужно войти.')
        return redirect(url_for('login'))
        
    user_info = users.get(session['username'])
    user_info['is_premium'] = True
    flash('Поздравляем! Вы оформили премиум-подписку. Теперь у вас есть доступ к эксклюзивному контенту.')
    return redirect(url_for('premium_page'))

if __name__ == '__main__':
    from waitress import serve
    serve(app, host='0.0.0.0', port=5000)