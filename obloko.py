import os
from flask import Flask, render_template, request, redirect, send_from_directory

app = Flask(__name__)

# Папка, куда будут сохраняться файлы
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Главная страница со списком файлов и формой загрузки
@app.route('/')
def index():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    
    # Базовый HTML-шаблон прямо в коде
    html = '''
    <!doctype html>
    <html lang="ru">
    <head>
        <meta charset="utf-8">
        <title>Моё Облако</title>
        <style>
            body { font-family: sans-serif; background: #121214; color: #fff; padding: 40px; }
            a { color: #a970ff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            form { margin-bottom: 30px; background: #1a1a1e; padding: 20px; border-radius: 8px; }
            input[type="submit"] { background: #a970ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
            li { margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>Загрузить новый файл в облако</h1>
        <form method="post" enctype="multipart/form-data" action="/upload">
          <input type="file" name="file">
          <input type="submit" value="Загрузить">
        </form>
        
        <h1>Ваши файлы:</h1>
        <ul>
    '''
    
    for file in files:
        html += f'<li><a href="/download/{file}">{file}</a></li>'
        
    html += '''
        </ul>
    </body>
    </html>
    '''
    return html

# Обработчик загрузки файла (исправлено: только methods=['POST'])
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'Файл не найден в запросе', 400
    file = request.files['file']
    if file.filename == '':
        return 'Файл не выбран', 400
    
    # Сохраняем файл на диск в папку uploads
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return redirect('/')

# Обработчик скачивания файла
@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Получаем порт, который выдал Render (по умолчанию 5000, если локально)
    port = int(os.environ.get("PORT", 5000))
    # host='0.0.0.0' открывает доступ всему интернету
    # debug=False ОБЯЗАТЕЛЬНО для продакшена (хостинга)
    app.run(host='0.0.0.0', port=port, debug=False)
