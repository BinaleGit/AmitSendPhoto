const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const fs = require('fs'); // Added for file saving
const app = express();
const mongoose = require('mongoose');

app.use(cors()); // Allows GitHub Pages (or any other origin) to talk to this backend
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


// Connect to MongoDB using an Environment Variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("📦 Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Create a simple 'Schema' for the subscription
const SubscriptionSchema = new mongoose.Schema({
  data: Object
});
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

// Update your /subscribe route
app.post('/subscribe', async (req, res) => {
  // Clear old ones so we only have one active subscription
  await Subscription.deleteMany({}); 
  const newSub = new Subscription({ data: req.body });
  await newSub.save();
  res.status(201).json({});
});

// Update your /send-notification route
app.post('/send-notification', async (req, res) => {
  try {
    const subRecord = await Subscription.findOne();
    if (!subRecord) return res.status(400).send('No subscription found.');

    const subscription = subRecord.data;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).send('Invalid subscription in DB (missing endpoint or keys). Re-subscribe from the app.');
    }

    const payload = JSON.stringify({ title: "Lover's Nudge 📸", body: 'Send a photo!' });

    await webpush.sendNotification(subscription, payload);
    res.sendStatus(200);
  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).send(err.message || 'Failed to send notification');
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});