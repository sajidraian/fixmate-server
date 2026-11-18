import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { setServers } from "node:dns";
dotenv.config();
// Fix Node.js DNS resolution
setServers(["1.1.1.1", "1.0.0.1"]);
// MongoDB connection string
const uri = process.env.MONGODB_URI;
// Database name
const dbName = process.env.DB_NAME || "fixmate";
if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
}
const client = new MongoClient(uri);
let database;
// Connect to MongoDB
export const connectDB = async () => {
    try {
        await client.connect();
        database = client.db(dbName);
        console.log("MongoDB Connected Successfully!");
        return database;
    }
    catch (error) {
        console.error("MongoDB Connection Failed:", error);
        throw error;
    }
};
// Get database instance
export const getDB = () => {
    if (!database) {
        throw new Error("Database is not connected");
    }
    return database;
};
