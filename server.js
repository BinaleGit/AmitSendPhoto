const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const fs = require('fs'); // Added for file saving
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

// This tells the code: "Try to find the key in Render's environment, 
// otherwise use my local string for testing."
const publicVapidKey = process.env.PUBLIC_VAPID_KEY 
const privateVapidKey = process.env.PRIVATE_VAPID_KEY 

webpush.setVapidDetails('mailto:roeebina0@gmail.com', publicVapidKey, privateVapidKey);

// 1. Load existing subscription from file if it exists
let girlfriendSubscription = null;
if (fs.existsSync('subs.json')) {
    girlfriendSubscription = JSON.parse(fs.readFileSync('subs.json'));
}

app.post('/subscribe', (req, res) => {
  girlfriendSubscription = req.body;
  // 2. Save to file so it doesn't disappear on restart
  fs.writeFileSync('subs.json', JSON.stringify(girlfriendSubscription));
  res.status(201).json({});
});

app.post('/send-notification', (req, res) => {
  if (!girlfriendSubscription) return res.status(400).send('No subscription found.');

  const payload = JSON.stringify({ title: 'זמן לתמונה!📸', body: 'היי הגיע הזמן לשלוח תמונה שלך❤️' });

  webpush.sendNotification(girlfriendSubscription, payload)
    .then(() => res.sendStatus(200))
    .catch(err => res.status(500).send(err));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});