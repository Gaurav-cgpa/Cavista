import "dotenv/config";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";
const id = process.argv[2] || "6999eb5370efa3e840b7ba71";

if (!MONGO_URI) {
  console.error("MONGO_URI not set in environment. Set it in .env or pass via env.");
  process.exit(2);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;

    const cols = await db.listCollections().toArray();
    console.log("Collections:", cols.map(c => c.name));

    // Try ObjectId lookup
    let obj=null;
    try {
      const oid = new mongoose.Types.ObjectId(id);
      obj = await db.collection("users").findOne({ _id: oid });
      console.log("findOne by ObjectId (collection 'users'):", obj ? "FOUND" : "NOT FOUND");
      if (obj) console.log(JSON.stringify(obj, null, 2));
    } catch (e) {
      console.warn("ObjectId lookup failed:", e.message || e);
    }

    // Try string _id lookup
    const obj2 = await db.collection("users").findOne({ _id: id });
    console.log("findOne by string _id (collection 'users'):", obj2 ? "FOUND" : "NOT FOUND");
    if (obj2) console.log(JSON.stringify(obj2, null, 2));

    // If not found in 'users', try other likely collection names
    if (!obj && !obj2) {
      const tryNames = ["user", "User", "accounts", "profiles", "patients"];
      for (const name of tryNames) {
        const r1 = await db.collection(name).findOne({ _id: new mongoose.Types.ObjectId(id) }).catch(()=>null);
        const r2 = await db.collection(name).findOne({ _id: id }).catch(()=>null);
        if (r1 || r2) {
          console.log(`Found in collection '${name}':`, r1?"objectId match":"string match");
          console.log(JSON.stringify(r1||r2, null, 2));
          break;
        }
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error running debug script:", err?.message || err);
    process.exit(3);
  }
}

run();
