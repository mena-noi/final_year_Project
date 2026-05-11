const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://menaochan698_db_user:abcd1234@cluster0.okd2awc.mongodb.net/?appName=Cluster0"
    );

    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;