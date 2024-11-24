// Получаем элементы страницы
const noteInput = document.getElementById('noteInput');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');

// Получаем токен и userId из localStorage
async function fetchUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Вы не авторизованы!');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('/user', {
        headers: { 'Authorization': token },
    });

    if (response.ok) {
        const { message } = await response.json();
        document.getElementById('welcomeMessage').textContent = message;
    } else {
        alert('Ошибка авторизации. Войдите заново.');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

// Добавление новой заметки
addNoteBtn.addEventListener('click', async () => {
    const note = noteInput.value.trim();
    const userId = localStorage.getItem('userId');

    if (note && userId) {
        try {
            const response = await fetch('/add-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, note })
            });

            const data = await response.json();
            if (data.message === 'Note added successfully.') {
                loadNotes(); // Перезагружаем список заметок
                noteInput.value = ''; // Очищаем поле ввода
            } else {
                console.error('Error adding note:', data.message);
            }
        } catch (err) {
            console.error('Error adding note:', err);
        }
    }
});

// Удаление заметки
async function deleteNote(noteId) {
    try {
        const response = await fetch(`/delete-note/${noteId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.message === 'Note deleted successfully.') {
            loadNotes(); // Перезагружаем список заметок
        } else {
            console.error('Error deleting note:', data.message);
        }
    } catch (err) {
        console.error('Error deleting note:', err);
    }
}

// Загружаем заметки при загрузке страницы
async function loadNotes() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return;  // Прерываем загрузку, если userId нет в localStorage
    }

    try {
        const response = await fetch(`/get-notes/${userId}`);
        const data = await response.json();
        if (data.notes) {
            notesList.innerHTML = ''; // Очищаем список
            data.notes.forEach(note => {
                const li = document.createElement('li');
                li.textContent = note.note;
                // Кнопка для удаления заметки
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deleteNote(note.id);
                li.appendChild(deleteBtn);
                notesList.appendChild(li);
            });
        }
    } catch (err) {
        console.error('Error loading notes:', err);
    }
}

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

fetchUser();  // Загружаем информацию о пользователе при загрузке страницы
loadNotes();  // Загружаем заметки

