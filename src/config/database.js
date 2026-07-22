const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    logger.warn('MONGODB_URI Environment Variable is not set in Vercel Dashboard');
    return null;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 3000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;
