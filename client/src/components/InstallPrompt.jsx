import { useEffect, useState } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  useEffect(() => {
    // Check if user dismissed the prompt recently (within 7 days)
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      const daysSinceDismissal = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        setShowInstallButton(false);
      }
    }
  }, []);

  if (!showInstallButton) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-2xl p-6 border-4 border-amber-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
              🌺
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{fontFamily: "'Dancing Script', cursive"}}>
                Install App
              </h3>
              <p className="text-sm text-amber-100">
                Add to your home screen
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-amber-200 text-2xl leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        <p className="text-sm mb-4 text-amber-50">
          Install the Madrigal Family Reunion app for quick access and offline support!
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-amber-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-100 transition transform hover:scale-105"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-3 text-white hover:text-amber-200 transition"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
