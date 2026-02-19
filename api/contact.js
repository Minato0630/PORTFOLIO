import { MongoClient } from "mongodb";

let client;
let clientPromise;

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Please define MONGO_URI in Vercel Environment Variables");
}

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("portfolio");

    await db.collection("contacts").insertOne({
      name,
      email,
      message,
      created_at: new Date()
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
}
