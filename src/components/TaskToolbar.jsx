import { Lock, Unlock, Share2, Trash2, MoreHorizontal, Pin, PinOff } from 'lucide-react';

const TaskToolbar = ({ selectedCount, selectedTasks, onAction }) => {
  if (selectedCount === 0) return null;

  // Determine if all selected tasks are locked
  const allLocked = selectedTasks.every(t => t.is_locked);
  const someLocked = selectedTasks.some(t => t.is_locked);
  const allPinned = selectedTasks.every(t => t.is_pinned);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl shadow-lg border border-yellow-300 dark:border-yellow-700 px-6 py-3 flex items-center gap-6 z-50">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedCount} selected</span>
      <button
        onClick={() => onAction(allLocked ? 'unlock' : 'lock')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 rounded-lg transition"
      >
        {allLocked ? <Unlock size={20} className="text-gray-700 dark:text-gray-300" /> : <Lock size={20} className="text-gray-700 dark:text-gray-300" />}
        <span className="text-xs text-gray-600 dark:text-gray-400">{allLocked ? 'Unlock' : 'Lock'}</span>
      </button>
      <button
        onClick={() => onAction(allPinned ? 'unpin' : 'pin')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 rounded-lg transition"
      >
        {allPinned ? <PinOff size={20} /> : <Pin size={20} />}
        <span className="text-xs text-gray-600 dark:text-gray-400">{allPinned ? 'Unpin' : 'Pin'}</span>
      </button>
      <button
        onClick={() => onAction('share')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 rounded-lg transition"
      >
        
        <Share2 size={20} className="text-gray-700 dark:text-gray-300" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Share</span>
      </button>
      <button
        onClick={() => onAction('delete')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 rounded-lg transition"
      >
        <Trash2 size={20} className="text-gray-700 dark:text-gray-300" />
        <span className="text-xs text-gray-600 dark:text-gray-400">Delete</span>
      </button>
      <button
        onClick={() => onAction('more')}
        className="flex flex-col items-center gap-1 p-2 hover:bg-yellow-200 dark:hover:bg-yellow-800/50 rounded-lg transition"
      >
        <MoreHorizontal size={20} className="text-gray-700 dark:text-gray-300" />
        <span className="text-xs text-gray-600 dark:text-gray-400">More</span>
      </button>
    </div>
  );
};


export default TaskToolbar;