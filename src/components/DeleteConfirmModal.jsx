const DeleteConfirmModal = ({ count, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Move {count} task(s) to recycle bin?</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete?</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg">Move to Recycle Bin</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;