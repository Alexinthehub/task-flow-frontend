const ShareModal = ({ onClose, onShare }) => {
  const options = ['PDF file', 'Microsoft Word file', 'Image file', 'Text file'];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Task</h2>
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onShare(opt)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              {opt}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg">Cancel</button>
      </div>
    </div>
  );
};

export default ShareModal;