import { useState, useEffect, useRef } from 'react';
import { tasksAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Search } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import TaskToolbar from '../components/TaskToolbar';
import MoreActionsModal from '../components/MoreActionsModal';
import VerifyIdentityModal from '../components/VerifyIdentityModal';
import SetLockModal from '../components/SetLockModal';
import LockOptionModal from '../components/LockOptionModal';
import ShareModal from '../components/ShareModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ViewTaskModal from '../components/ViewTaskModal';
import ConfirmPasswordModal from '../components/ConfirmPasswordModal';
import ResetLockPasswordModal from '../components/ResetLockPasswordModal';

const Tasks = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Translation helper with fallback
  const tr = (key, fallback) => {
    const result = t(key);
    return result === key ? fallback : result;
  };

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [error, setError] = useState('');

  // Add/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    priority: 'medium',
    category_ids: [],
    recurrence: 'none',
  });

  // Toolbar modals
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showSetLock, setShowSetLock] = useState(false);
  const [showLockOption, setShowLockOption] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // View Task & Unlock modals
  const [showViewTask, setShowViewTask] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const [unlockMode, setUnlockMode] = useState('single');
  const [activeTask, setActiveTask] = useState(null);

  // Reset lock password flow
  const [showResetLock, setShowResetLock] = useState(false);
  const [resetLockTask, setResetLockTask] = useState(null);
  const [resetLockAccountPassword, setResetLockAccountPassword] = useState('');

  // Saved lock password & verification state
  const [savedLockPassword, setSavedLockPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  const [actionTarget, setActionTarget] = useState('');
  const pendingLockIds = useRef([]);

  // Load saved password & verification flag
  useEffect(() => {
    const saved = localStorage.getItem('taskflow_lock_password');
    if (saved) setSavedLockPassword(saved);
    const verified = localStorage.getItem('taskflow_verified') === 'true';
    if (verified) setIsVerified(true);
  }, []);

  useEffect(() => {
    setSelectedTasks([]);
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchTasks();
    const handleRestore = () => fetchTasks();
    window.addEventListener('taskRestored', handleRestore);
    return () => window.removeEventListener('taskRestored', handleRestore);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(tr('TasksLoadError', 'Could not load tasks'));
    } finally {
      setLoading(false);
    }
  };

  // ---------- Add/Edit ----------
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      const payload = {
        ...formData,
        category_ids: formData.category_ids || [],
      };
      if (editingTask) {
        response = await tasksAPI.update(editingTask.id, payload);
        setTasks(tasks.map((t) => (t.id === editingTask.id ? response.data : t)));
      } else {
        response = await tasksAPI.create(payload);
        setTasks([...tasks, response.data]);
        window.dispatchEvent(new CustomEvent('notificationCreated'));
      }
      resetModal();
    } catch (err) {
      console.error('Save error:', err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (typeof data === 'object') {
          const messages = [];
          for (const [field, errors] of Object.entries(data)) {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              messages.push(`${field}: ${errors}`);
            } else {
              messages.push(`${field}: ${String(errors)}`);
            }
          }
          setError(messages.join('\n') || tr('SaveError', 'Failed to save task.'));
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(tr('SaveError', 'Failed to save task. Please try again.'));
      }
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      category_ids: task.categories ? task.categories.map(c => c.id) : [],
      recurrence: task.recurrence || 'none',
    });
    setShowModal(true);
    setError('');
  };

  const resetModal = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      status: 'pending',
      priority: 'medium',
      category_ids: [],
      recurrence: 'none',
    });
    setEditingTask(null);
    setShowModal(false);
    setError('');
  };

  // ---------- Selection ----------
  const handleSelect = (id) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredTasks = tasks.filter(task => {
    let passesFilter = true;
    if (filter === 'completed') passesFilter = task.status === 'completed';
    else if (filter === 'pending') passesFilter = task.status !== 'completed';
    else if (filter === 'favorites') passesFilter = task.is_favorite;
    else if (filter === 'pinned') passesFilter = task.is_pinned;
    else if (filter === 'shared') passesFilter = task.has_shared === true;
    // 'all' passes everything

    let passesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      passesSearch = task.title.toLowerCase().includes(q) ||
                     (task.description && task.description.toLowerCase().includes(q));
    }
    return passesFilter && passesSearch;
  });

  // SORT: pinned tasks first
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      const ids = sortedTasks.map(t => t.id);
      setSelectedTasks(ids);
    } else {
      setSelectedTasks([]);
    }
  };

  const getSelectedTaskObjects = () => tasks.filter(t => selectedTasks.includes(t.id));

  // ---------- Toolbar actions ----------
  const handleToolbarAction = async (action) => {
    const selected = getSelectedTaskObjects();
    if (selected.length === 0) return;

    if (action === 'lock') {
      pendingLockIds.current = selected.map(t => t.id);
      if (savedLockPassword && accountPassword && isVerified) {
        setShowLockOption(true);
      } else {
        setActionTarget('lock');
        setShowVerify(true);
      }
    } else if (action === 'unlock') {
      setUnlockMode('bulk');
      setUnlockTarget(selected);
      setShowUnlock(true);
    } else if (action === 'pin' || action === 'unpin') {
      for (const task of selected) {
        try {
          await tasksAPI.togglePin(task.id);
        } catch (err) { console.error('Pin toggle failed', err); }
      }
      fetchTasks();
      setSelectedTasks([]);
    } else if (action === 'share') {
      const hasLocked = selected.some(t => t.is_locked);
      if (hasLocked) {
        alert(tr('UnlockToShare', 'To share, you need to unlock the task first.'));
        return;
      }
      setShowShare(true);
    } else if (action === 'delete') {
      const hasLocked = selected.some(t => t.is_locked);
      if (hasLocked) {
        setUnlockMode('delete');
        setUnlockTarget(selected);
        setShowUnlock(true);
      } else {
        setShowDelete(true);
      }
    } else if (action === 'more') {
      setShowMoreActions(true);
    }
  };

  // ---------- Verify identity ----------
  const handleVerify = async (password) => {
    try {
      const username = user?.username || '';
      if (!username) {
        alert(tr('UserNotLoggedIn', 'User not logged in.'));
        return;
      }
      const response = await authAPI.login(username, password);
      if (response.status === 200) {
        setAccountPassword(password);
        setShowVerify(false);
        if (actionTarget === 'lock') {
          if (savedLockPassword && isVerified) {
            setShowLockOption(true);
          } else {
            setShowSetLock(true);
          }
        } else if (actionTarget === 'resetLock') {
          setResetLockAccountPassword(password);
          setShowResetLock(true);
        }
        setActionTarget('');
      } else {
        alert(tr('InvalidAccountPassword', 'Invalid account password.'));
      }
    } catch (err) {
      alert(tr('InvalidAccountPassword', 'Invalid account password.'));
    }
  };

  // ---------- Lock ----------
  const handleSetLock = async (lockPassword, rememberPassword) => {
    const taskIds = pendingLockIds.current;
    if (taskIds.length === 0) {
      alert(tr('NoTasksSelected', 'No tasks selected.'));
      return;
    }
    try {
      for (const id of taskIds) {
        await tasksAPI.lock(id, {
          account_password: accountPassword,
          lock_password: lockPassword,
        });
      }
      if (rememberPassword) {
        localStorage.setItem('taskflow_lock_password', lockPassword);
        localStorage.setItem('taskflow_verified', 'true');
        setSavedLockPassword(lockPassword);
        setIsVerified(true);
      }
      await fetchTasks();
      setSelectedTasks([]);
      pendingLockIds.current = [];
      setShowSetLock(false);
      setAccountPassword('');
    } catch (err) {
      console.error('Lock error:', err);
      alert(tr('LockFailed', 'Failed to lock tasks. Please try again.'));
    }
  };

  // ---------- Lock Option ----------
  const handleLockOption = (option) => {
    setShowLockOption(false);
    if (option === 'useSaved') {
      const taskIds = pendingLockIds.current;
      if (taskIds.length === 0) return;
      let completed = 0;
      for (const id of taskIds) {
        tasksAPI.lock(id, {
          account_password: accountPassword,
          lock_password: savedLockPassword,
        })
          .then(() => {
            completed++;
            if (completed === taskIds.length) {
              fetchTasks();
              setSelectedTasks([]);
              pendingLockIds.current = [];
              alert(tr('TasksLocked', 'Tasks locked successfully.'));
            }
          })
          .catch((err) => {
            console.error('Lock error:', err);
            alert(tr('LockFailed', 'Failed to lock one or more tasks.'));
          });
      }
    } else if (option === 'setNew') {
      setShowSetLock(true);
    }
  };

  // ---------- Unlock ----------
  const handleUnlockConfirm = async (password) => {
    if (!unlockTarget) return;
    let tasksToUnlock = [];
    if (unlockMode === 'bulk' || unlockMode === 'delete') {
      tasksToUnlock = Array.isArray(unlockTarget) ? unlockTarget : [unlockTarget];
    } else {
      tasksToUnlock = [unlockTarget];
    }
    try {
      for (const task of tasksToUnlock) {
        if (task.is_locked) {
          await tasksAPI.unlock(task.id, { lock_password: password });
        }
      }
      fetchTasks();
      setSelectedTasks([]);
      setShowUnlock(false);
      setUnlockTarget(null);
      if (unlockMode === 'delete') {
        setShowDelete(true);
      }
    } catch (err) {
      alert(tr('InvalidLockPassword', 'Invalid lock password for one or more tasks.'));
    }
  };

  // ---------- Reset Lock Password ----------
  const handleResetLock = (newPassword) => {
    if (!resetLockTask) return;
    tasksAPI.lock(resetLockTask.id, {
      account_password: resetLockAccountPassword,
      lock_password: newPassword,
    })
      .then(() => {
        fetchTasks();
        setShowResetLock(false);
        setResetLockTask(null);
        setResetLockAccountPassword('');
      })
      .catch(() => alert(tr('ResetLockFailed', 'Failed to reset lock password.')));
  };

  // ---------- Delete ----------
  const handleDeleteConfirm = async () => {
    const selected = getSelectedTaskObjects();
    try {
      for (const task of selected) {
        await tasksAPI.delete(task.id);
        // Store in trash (per user)
        const userId = user?.id || 'anonymous';
        const storageKey = `deletedTasks_${userId}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const taskToDelete = { ...task, deleted_at: new Date().toISOString() };
        localStorage.setItem(storageKey, JSON.stringify([...stored, taskToDelete]));
      }
      fetchTasks();
      setSelectedTasks([]);
      setShowDelete(false);
    } catch (err) {
      alert(tr('DeleteFailed', 'Failed to delete tasks.'));
    }
  };

  // ---------- Share ----------
  const handleShare = (format) => {
    alert(tr('ShareComingSoon', `Sharing as ${format} – feature coming soon.`));
    setShowShare(false);
  };

  // ---------- More Actions ----------
  const handleMoreActions = (action) => {
    const selected = getSelectedTaskObjects();
    const hasLocked = selected.some(t => t.is_locked);
    if (action === 'details') {
      setShowDetails(true);
    } else if (action === 'duplicate') {
      if (hasLocked) {
        alert(tr('CannotDuplicateLocked', 'Cannot duplicate locked tasks. Unlock them first.'));
        return;
      }
      for (const task of selected) {
        tasksAPI.duplicate(task.id).catch(() => alert(tr('DuplicateFailed', 'Failed to duplicate task.')));
      }
      fetchTasks();
    } else if (action === 'favorite') {
      Promise.all(selected.map(task => tasksAPI.toggleFavorite(task.id)))
        .then(() => {
          fetchTasks();
          setSelectedTasks([]);
        })
        .catch(() => alert(tr('FavoriteToggleFailed', 'Failed to toggle favorites.')));
    }
    setShowMoreActions(false);
  };

  const allSelectedFavorite = () => {
    const selected = getSelectedTaskObjects();
    if (selected.length === 0) return false;
    return selected.every(t => t.is_favorite);
  };

  // ---------- View Task ----------
  const handleViewTask = (task) => {
    setActiveTask(task);
    setShowViewTask(true);
  };

  // ---------- Reset Trigger ----------
  const handleResetLockFlow = (task) => {
    setResetLockTask(task);
    setActionTarget('resetLock');
    setShowVerify(true);
  };

  // ---------- Details Modal ----------
  const DetailsModal = ({ task, onClose }) => {
    if (!task) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{tr('TaskDetails', 'Task details')}</h2>
          <p><span className="font-semibold">{tr('Created', 'Created')}:</span> {new Date(task.created_at).toLocaleString()}</p>
          <p><span className="font-semibold">{tr('Updated', 'Updated')}:</span> {new Date(task.updated_at).toLocaleString()}</p>
          <button onClick={onClose} className="mt-4 w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg">{tr('Ok', 'OK')}</button>
        </div>
      </div>
    );
  };

  // ---------- Render ----------
  if (loading) return <div className="text-center text-gray-500 dark:text-gray-400">{tr('Loading', 'Loading...')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tr('Tasks', 'Tasks')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> {tr('AddTask', 'Add Task')}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{tr('Filter', 'Filter:')}</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{tr('All', 'All')}</option>
            <option value="pending">{tr('Pending', 'Pending')}</option>
            <option value="completed">{tr('Completed', 'Completed')}</option>
            <option value="favorites">{tr('Favorites', 'Favorites')}</option>
            <option value="pinned">{tr('Pinned', 'Pinned')}</option>
            <option value="shared">{tr('Shared', 'Shared')}</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="flex-1 min-w-[200px] relative">
          <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
            <input
              type="search"
              name="task_search_field"
              id="task_search_field"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder={tr('SearchTasks', 'Search tasks...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white [&:-webkit-autofill]:bg-gray-100 [&:-webkit-autofill]:text-gray-900 [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#f3f4f6] dark:[&:-webkit-autofill]:bg-gray-700 dark:[&:-webkit-autofill]:text-white dark:[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_#374151]"
              style={{ WebkitBoxShadow: '0 0 0 1000px transparent inset' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-visible p-4">
        <div className="mb-2 flex items-center">
          <div className="relative">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedTasks.length === sortedTasks.length && sortedTasks.length > 0}
              onChange={handleSelectAll}
              disabled={sortedTasks.length === 0}
              className="hidden"
            />
            <label
              htmlFor="select-all"
              className={`w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center cursor-pointer transition ${
                selectedTasks.length === sortedTasks.length && sortedTasks.length > 0
                  ? 'border-blue-600 dark:border-blue-400'
                  : ''
              }`}
            >
              {selectedTasks.length === sortedTasks.length && sortedTasks.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-white"></div>
              )}
            </label>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{tr('SelectAll', 'Select all')}</span>
        </div>
        {sortedTasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">{tr('NoTasksFound', 'No tasks found.')}</p>
        ) : (
          sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              selected={selectedTasks.includes(task.id)}
              onSelect={handleSelect}
              onEdit={openEdit}
              onView={handleViewTask}
            />
          ))
        )}
      </div>

      <TaskToolbar
        selectedCount={selectedTasks.length}
        selectedTasks={getSelectedTaskObjects()}
        onAction={handleToolbarAction}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingTask ? tr('EditTask', 'Edit task') : tr('AddTask', 'Add Task')}
            </h2>
            {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('Title', 'Title')}</label>
                  <input
                    type="text"
                    name="title"
                    className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('Description', 'Description')} <span className="text-gray-500">({tr('Optional', '(Optional)')})</span></label>
                  <textarea
                    name="description"
                    rows="3"
                    className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('DueDate', 'Due date')}</label>
                  <input
                    type="date"
                    name="due_date"
                    className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('Status', 'Status')}</label>
                  <select
                    name="status"
                    className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">{tr('Pending', 'Pending')}</option>
                  </select>
                </div>
                {/* Priority – CORRECT: lowercase values */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('Priority', 'Priority')}</label>
                  <select
                    name="priority"
                    className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">{tr('Low', 'Low')}</option>
                    <option value="medium">{tr('Medium', 'Medium')}</option>
                    <option value="high">{tr('High', 'High')}</option>
                  </select>
                </div>
                {/* Recurrence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{tr('Recurrence', 'Recurrence')}</label>
                  <select
                    name="recurrence"
                    className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.recurrence}
                    onChange={handleInputChange}
                  >
                    <option value="none">{tr('None', 'None')}</option>
                    <option value="daily">{tr('Daily', 'Daily')}</option>
                    <option value="weekly">{tr('Weekly', 'Weekly')}</option>
                    <option value="monthly">{tr('Monthly', 'Monthly')}</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={resetModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg">{tr('Cancel', 'Cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  {editingTask ? tr('Update', 'Update') : tr('Create', 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All other modals (unchanged) */}
      {showViewTask && activeTask && (
        <ViewTaskModal task={activeTask} onClose={() => setShowViewTask(false)} />
      )}
      {showUnlock && unlockTarget && (
        <ConfirmPasswordModal
          onConfirm={handleUnlockConfirm}
          onCancel={() => {
            setShowUnlock(false);
            setUnlockTarget(null);
          }}
          onReset={() => {
            const task = Array.isArray(unlockTarget) ? unlockTarget[0] : unlockTarget;
            setShowUnlock(false);
            setUnlockTarget(null);
            handleResetLockFlow(task);
          }}
        />
      )}
      {showResetLock && resetLockTask && (
        <ResetLockPasswordModal
          onReset={handleResetLock}
          onCancel={() => {
            setShowResetLock(false);
            setResetLockTask(null);
            setResetLockAccountPassword('');
          }}
        />
      )}
      {showLockOption && (
        <LockOptionModal
          onUseSaved={() => handleLockOption('useSaved')}
          onSetNew={() => handleLockOption('setNew')}
          onCancel={() => setShowLockOption(false)}
        />
      )}
      {showMoreActions && (
        <MoreActionsModal
          isFavorite={allSelectedFavorite()}
          onClose={() => setShowMoreActions(false)}
          onDetails={() => handleMoreActions('details')}
          onDuplicate={() => handleMoreActions('duplicate')}
          onToggleFavorite={() => handleMoreActions('favorite')}
        />
      )}
      {showVerify && (
        <VerifyIdentityModal
          email={user?.email || ''}
          onVerify={handleVerify}
          onCancel={() => {
            setShowVerify(false);
            setActionTarget('');
          }}
        />
      )}
      {showSetLock && (
        <SetLockModal
          onSet={handleSetLock}
          onCancel={() => setShowSetLock(false)}
        />
      )}
      {showShare && (
        <ShareModal
          onClose={() => setShowShare(false)}
          onShare={handleShare}
        />
      )}
      {showDelete && (
        <DeleteConfirmModal
          count={selectedTasks.length}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {showDetails && getSelectedTaskObjects().length === 1 && (
        <DetailsModal task={getSelectedTaskObjects()[0]} onClose={() => setShowDetails(false)} />
      )}
      {showDetails && getSelectedTaskObjects().length !== 1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{tr('Details', 'Details')}</h2>
            <p>{tr('SelectSingleTask', 'Please select a single task to view details.')}</p>
            <button onClick={() => setShowDetails(false)} className="mt-4 w-full bg-gray-200 dark:bg-gray-600 py-2 rounded-lg">{tr('Ok', 'OK')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;