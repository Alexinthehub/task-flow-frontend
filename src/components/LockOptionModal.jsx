const LockOptionModal = ({ onUseSaved, onSetNew, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lock Task</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          You have a saved lock password. Would you like to use it, or set a new one?
        </p>
        <div className="space-y-2">
          <button
            onClick={onUseSaved}
            className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Use saved password
          </button>
          <button
            onClick={onSetNew}
            className="w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Set new password
          </button>
          <button
            onClick={onCancel}
            className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockOptionModal;