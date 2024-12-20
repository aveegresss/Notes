# Веб-приложение для создания заметок

## Описание
Проект **веб-приложение для создания заметок** - это веб-приложение с формой аутентификации пользователя и страницей пользователя, где он может хранить свои заметки.

## Основные возможности
- регистрация / вход пользователя с храненением логина и пароля в базе данных
- добавление и удаление заметок
- шифрование заметок иттеративным блочным шифром ГОСТ 28147-89 для их хранения в базе данных
- дешифрование заметок для их вывода на странице пользователя 

## Технологии
Проект написан на языке **JavaScript**, языке разметки **HTML** и **CSS**, для сервера был использован **Node.js Express**, база данных **SQLite**

## Установка и запуск

### 1. Клонирование репозитория
```bash
https://github.com/aveegresss/Notes.git
```
### 2. Установка необходимых зависимостей
Открыть терминал проекта и написать команду
```bash
npm install express sqlite3 body-parser bcrypt jsonwebtoken
```

### 3. Запуск проекта
Открыть терминал проекта и написать команду
```bash
node server.js
```

## Шаги работы:
**Вход пользователя:**  

![image](https://github.com/user-attachments/assets/6274a2b8-0eb4-4000-ad06-9787a5327745)

**Страница пользователя:**  

![image](https://github.com/user-attachments/assets/32fb87fd-1ca1-4333-8643-1fb594066371)

**БД users:**  

![image](https://github.com/user-attachments/assets/66c3d857-8504-4db5-aa4e-5ae539455933)

**БД notes в зашифрованном виде:"**  

![image](https://github.com/user-attachments/assets/d00d36c9-7478-4332-899a-8a32b8feaa5f)

