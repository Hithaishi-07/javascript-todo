// State
let todos = [];
let currentFilter = 'all';
let editingId = null;

// DOM Elements
const newTodoInput = document.getElementById('new-todo');
const todoList = document.getElementById('todo-list');
const footer = document.getElementById('footer');
const activeCountEl = document.getElementById('active-count');
const itemsPlural = document.getElementById('items-plural');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

// Load todos from localStorage
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFilteredTodos() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return todos;
}

function render() {
    const filteredTodos = getFilteredTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = currentFilter === 'completed'
            ? 'No completed tasks yet!'
            : currentFilter === 'active'
                ? 'No active tasks!'
                : 'No tasks yet. Add one above!';
        todoList.appendChild(empty);
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            li.innerHTML = `
                <div class="toggle ${todo.completed ? 'checked' : ''}" data-action="toggle"></div>
                <label class="todo-label">${todo.text}</label>
                <input type="text" class="edit-input" value="${todo.text}">
                <button class="destroy" data-action="delete">×</button>
            `;
            todoList.appendChild(li);
        });
    }

    updateFooter();
}

function updateFooter() {
    const activeCount = todos.filter(t => !t.completed).length;
    activeCountEl.textContent = activeCount;
    itemsPlural.textContent = activeCount === 1 ? '' : 's';

    const hasCompleted = todos.some(t => t.completed);
    clearCompletedBtn.style.display = hasCompleted ? 'block' : 'none';
    footer.style.display = todos.length > 0 ? 'flex' : 'none';
}

// CRUD Functions
function addTodo(text) {
    if (text.trim() === '') return;

    todos.push({
        id: generateId(),
        text: text.trim(),
        completed: false
    });

    saveTodos();
    render();
}

function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    render();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    render();
}

function startEditing(id) {
    editingId = id;
    render();

    setTimeout(() => {
        const input = document.querySelector(`.todo-item[data-id="${id}"] .edit-input`);
        if (input) {
            input.focus();
            input.select();
        }
    }, 10);
}

function saveEdit(id, newText) {
    if (newText.trim() === '') {
        deleteTodo(id);
        return;
    }

    todos = todos.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
    );

    editingId = null;
    saveTodos();
    render();
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    render();
}

function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    render();
}

// Event Listeners
function setupEventListeners() {
    newTodoInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            addTodo(newTodoInput.value);
            newTodoInput.value = '';
        }
    });

    // Event Delegation
    todoList.addEventListener('click', e => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        const id = todoItem.dataset.id;

        if (e.target.dataset.action === 'toggle' || e.target.classList.contains('toggle')) {
            toggleTodo(id);
        } else if (e.target.dataset.action === 'delete' || e.target.classList.contains('destroy')) {
            deleteTodo(id);
        }
    });

    todoList.addEventListener('dblclick', e => {
        if (e.target.classList.contains('todo-label')) {
            startEditing(e.target.closest('.todo-item').dataset.id);
        }
    });

    todoList.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
            const id = e.target.closest('.todo-item').dataset.id;
            saveEdit(id, e.target.value);
        }
        if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
            editingId = null;
            render();
        }
    });

    todoList.addEventListener('blur', e => {
        if (e.target.classList.contains('edit-input')) {
            const id = e.target.closest('.todo-item').dataset.id;
            saveEdit(id, e.target.value);
        }
    }, true);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
}

// Initialize
function init() {
    loadTodos();
    setupEventListeners();
    render();
    newTodoInput.focus();
}

window.onload = init;