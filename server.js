const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 MongoDB Atlas URI
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://pandiyagokul_db_user:Gokul123@contact.drtdoir.mongodb.net/?retryWrites=true&w=majority&appName=contact';

const DB_NAME = process.env.DB_NAME || 'portfolio';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'contacts';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

let contactsCollection;

// 🔹 MongoDB Client with TLS fix
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  },
  tls: true,
  tlsAllowInvalidCertificates: true // IMPORTANT for Windows SSL issues
});

// 🔹 Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    contactsCollection = db.collection(COLLECTION_NAME);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}

connectDB();

// 🔹 Contact API
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    if (!contactsCollection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const result = await contactsCollection.insertOne({
      name,
      email,
      message,
      created_at: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert failed' });
  }
});

// 🔹 Admin messages page
app.get('/admin/messages', async (req, res) => {
  try {
    if (!contactsCollection) {
      return res.status(500).send('Database not connected');
    }

    const messages = await contactsCollection
      .find()
      .sort({ created_at: -1 })
      .toArray();

    const html = `
      <h2>📩 Contact Messages</h2>
      <ul>
        ${messages
          .map(
            m => `
          <li>
            <strong>${m.name}</strong> (${m.email})<br/>
            <small>${new Date(m.created_at).toLocaleString()}</small><br/>
            ${m.message}
          </li>
          <hr/>
        `
          )
          .join('')}
      </ul>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading messages');
  }
});

// 🔹 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
