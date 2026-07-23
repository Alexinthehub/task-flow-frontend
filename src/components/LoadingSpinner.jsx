import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-50">
    <Loader2 className="w-16 h-16 text-white animate-spin" />
  </div>
);

export default LoadingSpinner;