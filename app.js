/**
 * =========================================================
 * 待辦清單邏輯腳本 (app.js)
 * 原生 JavaScript 實作，支援 localStorage 持久化儲存
 * =========================================================
 */

// 當 DOM 內容加載完成後啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
  // ---------------------------------------------------------
  // 1. 常數與 DOM 元素選取
  // ---------------------------------------------------------
  const STORAGE_KEY = 'simple_todo_list_data';

  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  const pendingCount = document.getElementById('pending-count');

  // 待辦事項資料陣列：格式為 { id: number, text: string, completed: boolean }
  let todos = loadTodos();

  // ---------------------------------------------------------
  // 2. 本地儲存 (localStorage) 讀取與寫入函式
  // ---------------------------------------------------------
  /**
   * 從 localStorage 讀取待辦事項
   * @returns {Array} 待辦事項陣列
   */
  function loadTodos() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('讀取 localStorage 失敗:', error);
      return [];
    }
  }

  /**
   * 將當前待辦事項儲存至 localStorage
   */
  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('儲存至 localStorage 失敗:', error);
    }
  }

  // ---------------------------------------------------------
  // 3. 畫面渲染函式
  // ---------------------------------------------------------
  /**
   * 重新渲染整個待辦事項清單與統計資訊
   */
  function render() {
    // 清空現有清單 DOM
    todoList.innerHTML = '';

    // 若清單為空，顯示提示訊息；否則隱藏提示
    if (todos.length === 0) {
      emptyState.style.display = 'flex';
    } else {
      emptyState.style.display = 'none';

      // 依序建立每個待辦項目
      todos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = `todo-item${todo.completed ? ' completed' : ''}`;
        li.dataset.id = todo.id;

        // 左側：勾選框與內容文字
        const leftWrap = document.createElement('label');
        leftWrap.className = 'todo-item-left';

        // 勾選框
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.setAttribute('aria-label', `標記「${todo.text}」為已完成`);
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        // 事項文字 (使用 textContent 避免 XSS)
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;

        leftWrap.appendChild(checkbox);
        leftWrap.appendChild(textSpan);

        // 右側：刪除按鈕
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'todo-delete-btn';
        deleteBtn.setAttribute('aria-label', `刪除「${todo.text}」`);
        deleteBtn.title = '刪除此項目';
        // 垃圾桶圖示 (SVG)
        deleteBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        `;
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(leftWrap);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
      });
    }

    // 更新底部「未完成: N 項」統計
    updatePendingCount();
  }

  /**
   * 計算並更新未完成事項數量
   */
  function updatePendingCount() {
    const uncompletedCount = todos.filter((item) => !item.completed).length;
    pendingCount.textContent = `未完成: ${uncompletedCount} 項`;
  }

  // ---------------------------------------------------------
  // 4. 事件與業務操作
  // ---------------------------------------------------------
  /**
   * 新增待辦事項
   * @param {string} text - 輸入的文字
   */
  function addTodo(text) {
    const trimmedText = text.trim();

    // 檢查空白：如果內容只有空白字元則不新增
    if (!trimmedText) {
      todoInput.focus();
      return;
    }

    const newTodo = {
      id: Date.now(), // 使用時間戳記作為唯一識別識別碼
      text: trimmedText,
      completed: false,
    };

    todos.push(newTodo);
    saveTodos();
    render();

    // 清空輸入框並維持聚焦
    todoInput.value = '';
    todoInput.focus();
  }

  /**
   * 切換待辦事項的完成狀態
   * @param {number} id - 事項識別碼
   */
  function toggleTodo(id) {
    todos = todos.map((item) => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    saveTodos();
    render();
  }

  /**
   * 刪除特定待辦事項
   * @param {number} id - 事項識別碼
   */
  function deleteTodo(id) {
    todos = todos.filter((item) => item.id !== id);
    saveTodos();
    render();
  }

  // ---------------------------------------------------------
  // 5. 事件監聽器綁定
  // ---------------------------------------------------------
  // 表單送出事件 (按下 Enter 或點擊「新增」按鈕皆會觸發)
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(todoInput.value);
  });

  // ---------------------------------------------------------
  // 6. 初始化渲染
  // ---------------------------------------------------------
  render();
});
