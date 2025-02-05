let deferredPrompt;

// Register the Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

// Listen for the `beforeinstallprompt` event
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallNotification();
});

// Custom function to show install notification
function showInstallNotification() {
  const installNotification = document.getElementById('installNotification');
  installNotification.style.display = 'block';

  // Add event listener to the install button in the notification
  document.getElementById('installBtn').addEventListener('click', () => {
    installNotification.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
}

// Listen for `appinstalled` event to log installation
window.addEventListener('appinstalled', () => {
  console.log('App was installed');
});