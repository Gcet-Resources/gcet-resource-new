import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        setIsIOS(isIOSDevice);

        // Don't show if already installed
        if (isStandalone) return;

        // Check if user has dismissed before
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            // Show again after 7 days
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) return;
        }

        // For non-iOS, listen for the install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, show custom prompt after a delay
        if (isIOSDevice && !isStandalone) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-6 h-6 text-primary dark:text-teal-400" />
                    </div>

                    <div className="flex-1 pr-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Install GCET Resources
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {isIOS ? (
                                <>Tap <span className="font-medium">Share</span> then <span className="font-medium">"Add to Home Screen"</span></>
                            ) : (
                                'Get quick access from your home screen!'
                            )}
                        </p>

                        {!isIOS && deferredPrompt && (
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-teal-600 text-white rounded-lg hover:bg-primary/90 dark:hover:bg-teal-500 transition-colors text-sm font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Install App
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
