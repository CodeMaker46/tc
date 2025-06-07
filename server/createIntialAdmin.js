const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Ensure this path is correct

dotenv.config();

const createOrUpdateInitialAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for admin setup...');

    const adminEmail = 'd60623236@gmail.com';
    const adminPassword = 'admin123';
    const adminName = 'Deepanshu';

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      // If admin user already exists, update their details
      console.log(`User with email ${adminEmail} found. Updating to admin...`);
      adminUser.name = adminName;
      adminUser.password = hashedPassword; // Update password just in case
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log('Existing user updated to admin successfully!');
    } else {
      // If admin user does not exist, create a new one
      console.log(`User with email ${adminEmail} not found. Creating new admin user...`);
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      });
      console.log('New admin user created successfully!');
    }
  } catch (error) {
    console.error('Error during initial admin setup:', error);
    process.exit(1); // Exit with failure
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

createOrUpdateInitialAdmin();