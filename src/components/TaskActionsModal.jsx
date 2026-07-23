import { Pencil } from 'lucide-react';

const TaskActionsModal = ({ onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Task Actions</h3>
        <button
          onClick={onEdit}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          <Pencil size={16} className="text-blue-500" />
          <span>Edit Task</span>
        </button>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TaskActionsModal;