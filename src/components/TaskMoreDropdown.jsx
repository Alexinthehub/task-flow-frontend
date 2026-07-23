import { Pencil } from 'lucide-react';

const TaskMoreDropdown = ({ onEdit, onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
      <button
        onClick={() => { onEdit(); onClose(); }}
        className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition"
      >
        <Pencil size={16} className="text-blue-600 dark:text-blue-400" />
        <span>Edit Task</span>
      </button>
    </div>
  );
};

export default TaskMoreDropdown;