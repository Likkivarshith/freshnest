import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: Date;
}

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTodo, setNewTodo] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Save to localStorage whenever todos change
  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    localStorage.setItem('todos', JSON.stringify(newTodos));
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo.trim()) {
      toast.error('Please enter a task');
      return;
    }

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo,
      description: description || undefined,
      completed: false,
      priority,
      dueDate: dueDate || undefined,
      createdAt: new Date(),
    };

    saveTodos([...todos, todo]);
    setNewTodo('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    toast.success('Task added! ✅');
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((todo) => todo.id !== id);
    saveTodos(updated);
    toast.success('Task deleted');
  };

  const clearCompleted = () => {
    const updated = todos.filter((todo) => !todo.completed);
    saveTodos(updated);
    toast.success('Completed tasks cleared');
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">✅ Todo App</h1>
          <p className="text-lg text-gray-600">
            Organize your tasks with local storage persistence
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            <p className="text-gray-600 text-sm">Total Tasks</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.active}</p>
            <p className="text-gray-600 text-sm">Active</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Task</h2>
          <form onSubmit={addTodo} className="space-y-4">
            <div>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Enter task title..."
                className="input-field"
              />
            </div>

            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description (optional)"
                className="input-field"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 font-bold flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`py-2 px-6 rounded-lg font-bold transition ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4 mb-8">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No tasks found. Create one to get started! 🎯</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-lg shadow-md p-6 flex items-start justify-between hover:shadow-lg transition"
              >
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-1 text-primary-600 hover:text-primary-700 transition"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-lg font-bold ${
                        todo.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-gray-600 text-sm mt-2">{todo.description}</p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                      {todo.dueDate && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          📅 {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="ml-4 text-red-600 hover:text-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Clear Completed Button */}
        {stats.completed > 0 && (
          <button
            onClick={clearCompleted}
            className="w-full btn-outline py-3 font-bold"
          >
            Clear Completed Tasks
          </button>
        )}
      </div>
    </div>
  );
};
