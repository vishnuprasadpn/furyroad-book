import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-install-prompt-seen', 'true');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-prompt-seen', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">Install App</h3>
            <p className="text-gray-400 text-xs">
              Install FuryRoad for a better experience and quick access.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="btn-primary text-sm px-4 py-2 flex-1"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="btn-secondary text-sm px-4 py-2"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

