require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

// Use your provided MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://deepravikaif:Gp82tq1eBlSVdp8a@cluster0.gks3k.mongodb.net/tollDB";

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "d60623236@gmail.com";
    const plainPassword = "admin123";
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
    } else {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const admin = new Admin({ email, password: hashedPassword });
      await admin.save();
      console.log("Admin created successfully with email:", email);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(" Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
