import { useState } from 'react';
import { MoreVertical, Star, Edit, Eye, Lock, Pin } from 'lucide-react';

const TaskItem = ({ task, selected, onSelect, onEdit, onView }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isLocked = task.is_locked;
  const isFavorite = task.is_favorite;
  const isPinned = task.is_pinned;

  const toggleMenu = () => setShowMenu(!showMenu);

  // Handle click on the container – toggle selection
  const handleContainerClick = () => {
    onSelect(task.id);
  };

  // Prevent propagation from interactive elements
  const handleInteractiveClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`relative border rounded-lg p-4 mb-2 transition cursor-pointer ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${isLocked ? 'opacity-80' : ''}`}
      onClick={handleContainerClick}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox – visual only, toggled by container click */}
        <div className="relative" onClick={handleInteractiveClick}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(task.id)}
            className="hidden"
            id={`task-${task.id}`}
          />
          <label
            htmlFor={`task-${task.id}`}
            className={`w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center cursor-pointer transition ${
              selected ? 'border-blue-600 dark:border-blue-400' : ''
            }`}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-white"></div>}
          </label>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 relative" onClick={handleInteractiveClick}>
          {isFavorite && <Star size={16} className="text-yellow-500 fill-current" />}
          {isLocked && <Lock size={16} className="text-red-500" />}
          {isPinned && <Pin size={16} className="text-blue-500 fill-current" />}

          {!isLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="More actions"
            >
              <MoreVertical size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {!isLocked && showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-3 z-20 min-w-[160px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onView(task);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Eye size={14} className="text-blue-600 dark:text-blue-400" />
                <span>View Task</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <Edit size={14} className="text-blue-600 dark:text-blue-400" />
                <span>Edit Task</span>
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;