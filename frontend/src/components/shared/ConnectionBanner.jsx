import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext.jsx';

/**
 * Shown whenever the real-time socket connection drops, e.g. due to the
 * customer's WiFi flickering or the server restarting. Offers a manual
 * retry in addition to socket.io's own automatic reconnection attempts.
 */
export default function ConnectionBanner() {
  const { connected, reconnect } = useSocket();

  if (connected) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-center gap-3 animate-fade-in">
      <WifiOff className="w-4 h-4" />
      <span>Connection lost — live updates are paused.</span>
      <button
        onClick={reconnect}
        className="flex items-center gap-1 underline font-medium hover:text-amber-100"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  );
}
