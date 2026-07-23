import { X } from 'lucide-react';

const ViewTaskModal = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <X size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Task Details</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Title:</span>
            <p className="text-gray-900 dark:text-white">{task.title}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Description:</span>
            <p className="text-gray-900 dark:text-white">{task.description || 'No description'}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Due Date:</span>
            <p className="text-gray-900 dark:text-white">
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
            </p>
          </div>
          <div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
            <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
              {task.status || 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;