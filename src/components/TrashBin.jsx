import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EXPIRY_DAYS = 30;

const TrashBin = () => {
  const { user } = useAuth();
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Use user-specific storage key
  const userId = user?.id || 'anonymous';
  const STORAGE_KEY = `deletedTasks_${userId}`;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      let tasks = JSON.parse(stored);
      const now = Date.now();
      const filtered = tasks.filter(task => {
        const deletedAt = new Date(task.deleted_at).getTime();
        const expiresAt = deletedAt + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        if (now > expiresAt) {
          return false;
        }
        return true;
      });
      if (filtered.length !== tasks.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      setDeletedTasks(filtered);
    }
  }, [STORAGE_KEY]);

  const saveToLocalStorage = (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    setDeletedTasks(tasks);
  };

  const restoreTask = async (task) => {
    try {
      const response = await tasksAPI.create({
        title: task.title,
        description: task.description || '',
        due_date: task.due_date || '',
        status: task.status || 'pending',
      });
      if (response.status === 201 || response.status === 200) {
        const updated = deletedTasks.filter(t => t.id !== task.id);
        saveToLocalStorage(updated);
        alert('Task restored successfully!');
        window.dispatchEvent(new CustomEvent('taskRestored'));
      } else {
        alert('Failed to restore task.');
      }
    } catch (error) {
      alert('Failed to restore task.');
    }
  };

  const deletePermanently = (taskId) => {
    if (!confirm('Permanently delete this task? This cannot be undone.')) return;
    const updated = deletedTasks.filter(t => t.id !== taskId);
    saveToLocalStorage(updated);
  };

  const emptyTrash = () => {
    if (!confirm('Empty trash? All tasks will be permanently deleted.')) return;
    saveToLocalStorage([]);
  };

  // Compute remaining time
  const getRemainingTime = (deletedAt) => {
    const now = Date.now();
    const deleted = new Date(deletedAt).getTime();
    const expiry = deleted + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const diff = expiry - now;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h left`;
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105"
      >
        <Trash2 size={24} />
        {deletedTasks.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {deletedTasks.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700">
            <h3 className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
              <Trash2 size={16} className="text-red-500" />
              Trash Bin
            </h3>
            <div className="flex gap-2">
              {deletedTasks.length > 0 && (
                <button
                  onClick={emptyTrash}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Empty All
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {deletedTasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">Trash is empty</p>
            ) : (
              deletedTasks.map((task) => {
                const remaining = getRemainingTime(task.deleted_at);
                const isExpired = remaining === 'Expired';
                return (
                  <div key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isExpired ? (
                          <span className="text-red-500">Expired</span>
                        ) : (
                          <span>⏳ {remaining}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => restoreTask(task)}
                        disabled={isExpired}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Restore"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        onClick={() => deletePermanently(task.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded"
                        title="Delete permanently"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashBin;