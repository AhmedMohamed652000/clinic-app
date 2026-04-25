const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/user.model');

const seedAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    const email = process.env.ADMIN_SEED_EMAIL || 'admin@clinic-platform.com';
    const password = process.env.ADMIN_SEED_PASSWORD;

    if (!password) {
      console.error('ADMIN_SEED_PASSWORD is required in .env');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email, role: 'admin' });

    if (adminExists) {
      console.log('Admin user already exists. Updating password...');
      adminExists.passwordHash = await bcrypt.hash(password, 12);
      adminExists.status = 'active';
      await adminExists.save();
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        passwordHash,
        role: 'admin',
        status: 'active'
      });
      console.log('Admin user created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
