
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import url from "url";

import Movie from "../models/Movie.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cineScope";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected", MONGO_URI);

  const adminEmail = "admin@cinescope.local";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) admin = await User.create({ name: "Admin", email: adminEmail, password: "pass", isAdmin: true });

  const reviewers = [];
  for (let i=1;i<=4;i++) {
    const email = `reviewer${i}@cinescope.local`;
    let u = await User.findOne({ email });
    if (!u) u = await User.create({ name: `Reviewer ${i}`, email, password: "pass" });
    reviewers.push(u);
  }

  const moviesPath = path.join(__dirname, "movies.json");
  const movies = JSON.parse(fs.readFileSync(moviesPath, "utf8"));

  for (const m of movies) {
    let doc = await Movie.findOne({ name: m.name });
    if (!doc) doc = new Movie(m);
    else Object.assign(doc, m);

    // add a couple sample reviews
    const pool = [
      { rating: 5, comment: "Loved it!" },
      { rating: 4, comment: "Great cinematography." },
      { rating: 3, comment: "Good but a bit long." },
      { rating: 2, comment: "Not my type." },
      { rating: 1, comment: "Meh." },
    ];
    doc.reviews = [];
    doc.reviews.push({ user: reviewers[0]._id, name: reviewers[0].name, ...pool[0] });
    doc.reviews.push({ user: reviewers[1]._id, name: reviewers[1].name, ...pool[1] });
    doc.recomputeRating();
    await doc.save();
    if (Math.random() < 0.25 && !admin.watchlist?.includes(doc._id)) {
      admin.watchlist = admin.watchlist || [];
      admin.watchlist.push(doc._id);
    }
  }
  await admin.save();
  console.log("Seeding done.");
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
