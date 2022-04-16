const TODOS = 'TODOS';

class Todo {
    /**
     * Creates todo element.
     * @param {number} id Identifier.
     * @param {string} [title] Title. Default is empty string;
     */
    constructor(id, title = '') {
        /**
         * @type {number}
         */
        this.id = id;

        /**
         * @type {string}
         */
        this.title = title;
    }
}

class TodoService {
    /**
     * Todo list.
     * @type {Todo[]}
     * @private
     */
    _todos;

    constructor(todos = []) {
        this._init();

        if (!this._todos?.length) {
            this._todos = todos;
            this._commit();
        }
    }

    /**
     * Gets todos.
     * @returns Todos array.
     */
    getTodos() {
        return [...this._todos];
    }

    /**
     * Adds new todo.
     * @param {string} [title] - Todo title. Default is empty string.
     */
    addTodo(title = '') {
        if (!this._todos.some(t => !t.title)) {
            this._todos = [...this._todos,{ id: this._generateId(), title: title.trim() }];
            this._commit();
        } else {
            throw Error('There are empty element in an array.');
        }
    }

    /**
     * Edits todo by identifier.
     * @param {number} id Todo identifier.
     * @param {string} title Todo title.
     */
    editTodo(id, title) {
        if (!title) throw new Error('You can not empty title.');

        const todos = [...this._todos];
        todos[this._getIndex(id)].title = title.trim();
        this._todos = todos;
        this._commit();
    }

    /**
     * Deletes todo by identifier.
     * @param {number} id Todo's identifier.
     */
    deleteTodo(id) {
        this._todos = this._todos.filter(t => t.id !== id);
        this._commit();
    }

    /**
     * Sorts todo array.
     * @param {boolean} [direction] Sorting direction. Default is true. 
     */
    sortTodos(direction = true) {
        const todos = [...this._todos]
            .filter(t => t.title)
            .sort((a, b) => a.title.toUpperCase() > b.title.toUpperCase() ? 1 : -1);

        if (!direction) {
            todos.reverse();
        }

        this._todos = todos;

        this._commit();
    }

    /**
     * Initialize todos from storage.
     * @private
     */
    _init() {
        this._todos = JSON.parse(localStorage.getItem(TODOS) || '[]');
    }

    /**
     * Commits changes to storage.
     * @private
     */
    _commit() {
        localStorage.setItem(TODOS, JSON.stringify(this._todos));
    }

    /**
     * Gets index of todo by given identifier.
     * @param {number} id Todo identifier.
     * @returns Index of todo.
     * @private
     */
    _getIndex(id) {
        const index = this._todos.findIndex(t => t.id === id);

        if (index !== -1) {
            return index;
        }

        throw new Error(`There are no such todo with ${id} id.`);
    }

    /**
     * Generates new identifier.
     * @returns Newly generated identifier.
     * @private
     */
    _generateId() {
        return this._todos?.length
            ? [...this._todos].sort((a, b) => b.id - a.id)[0].id + 1 : 1;
    }
}

class DOMManipulator {
    /**
     * Creates DOM manipulator instance.
     * @param {TodoService} service Todo manipulating service.
     */
    constructor(service) {
        this._service = service;
        this._init();
    }

    _init() {
        /** @type {HTMLUListElement}*/
        this._todoList = this._getElement('#todo-list');

        /** @type {HTMLButtonElement}*/
        this._addBtn = this._getElement('#add-btn');
        this._addBtn.addEventListener('click', _ => this._handleAdd());

        /** @type {HTMLButtonElement}*/
        this._sortBtn = this._getElement('#sort-btn');
        this._sortBtn.addEventListener('click', _ => this._handleSort());
        this._sortDir = true;

        this.displayTodos();
    }

    displayTodos() {
        const todos = this._service.getTodos();
        const items = todos.map(t => {
            const item = document.createElement('li');
            const todoInput = document.createElement('input');
            todoInput.value = t.title;
            todoInput.placeholder = 'Enter todo title.';
            todoInput.addEventListener('change', e => this._handleEdit(t.id, e.target.value))
            item.append(todoInput);
            const delBtn = document.createElement('button');
            delBtn.innerHTML = 'X';
            delBtn.addEventListener('click', _ => this._handleDelete(t.id));
            item.append(delBtn);
            return item;
        });

        this._todoList.innerHTML = '';
        this._todoList.append(...items);
    }

    _handleAdd() {
        try {
            this._service.addTodo();
            this._sortDir = true;
            this.displayTodos();
        } catch (error) {
            this._showError(error.message);
        }
    }

    _handleEdit(id, title) {
        try {
            this._service.editTodo(id, title);
            this._sortDir = true;
            this.displayTodos();
        } catch (error) {
            this._showError(error.message);
        }
    }

    _handleSort() {
        this._service.sortTodos(this._sortDir);
        this._sortDir = !this._sortDir;
        this.displayTodos();
    }

    _handleDelete(id) {
        this._service.deleteTodo(id);
        this.displayTodos();
    }

    _showError(message) {
        alert(message);
        this.displayTodos();
    }

    _getElement(selector) {
        const element = document.querySelector(selector);

        if (element) {
            return element;
        }

        throw new Error(`There are no such element: ${selector}.`);
    }
}

const manipulator = new DOMManipulator(new TodoService([{ id: 1, title: '' }]));
