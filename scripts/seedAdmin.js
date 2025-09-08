import "dotenv/config";
import mongoose from "mongoose";
import User from "../backend/models/User.js";

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cineScope");

const email = process.env.ADMIN_EMAIL || "admin@cinescope.local";
let user = await User.findOne({ email });
if (user) {
  console.log("Admin already exists:", email);
  process.exit(0);
}

user = await User.create({
  name: process.env.ADMIN_NAME || "Admin",
  email,
  password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  isAdmin: true,
});

console.log("✅ Admin created:", user.email);
process.exit(0);
