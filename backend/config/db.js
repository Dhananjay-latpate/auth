const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

const connectDB = async (retries = MAX_RETRIES) => {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_DB;

  if (!mongoUri) {
    console.error(
      "No MongoDB connection URI found. Set MONGO_URI, MONGODB_URL, or MONGO_URL environment variable."
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);

    if (retries > 0) {
      console.log(
        `Retrying connection in ${RETRY_INTERVAL_MS / 1000}s... (${retries} attempts remaining)`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      return connectDB(retries - 1);
    }

    console.error(`Could not connect to MongoDB after ${MAX_RETRIES} attempts. Exiting.`);
    process.exit(1);
  }
};

module.exports = connectDB;
