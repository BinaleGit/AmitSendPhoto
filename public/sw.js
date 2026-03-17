self.addEventListener('push', e => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon.png',  // This points to your cute heart icon
        badge: '/icon.png', // This is for the small status bar icon on Android
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        }
    });
});