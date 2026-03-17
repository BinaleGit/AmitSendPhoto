// public/sw.js
self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received...');
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' // A cute camera icon
    });
});