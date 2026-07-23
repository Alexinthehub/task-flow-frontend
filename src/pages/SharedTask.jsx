import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Flag, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const SharedTask = () => {
  const { token } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedTask = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/share/${token}/`);
        if (!response.ok) {
          throw new Error('Link expired or invalid.');
        }
        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err.message || 'Failed to load task.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedTask();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Go to TaskFlow
          </Link>
        </div>
      </div>
    );
  }

  // Priority badge styles
  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Shared Task
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            From TaskFlow
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{task.title}</h2>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {task.due_date && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar size={18} className="text-blue-500" />
                <span>Due: {new Date(task.due_date).toLocaleDateString('en-GB')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Flag size={18} className="text-blue-500" />
              <span>
                Priority:{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CheckCircle size={18} className="text-blue-500" />
              <span>
                Status:{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status}
                </span>
              </span>
            </div>
            {task.created_at && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock size={18} className="text-blue-500" />
                <span>Created: {new Date(task.created_at).toLocaleDateString('en-GB')}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This link is valid for 7 days from creation.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Go to TaskFlow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTask;