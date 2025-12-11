import mongoose from 'mongoose';


export async function connectDB(mongoUrl) {
    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        })
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log("❌ Mongo connection error:", error.message);
        throw error;
    }
}

