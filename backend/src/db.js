import mongoose from 'mongoose';


export async function connect() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log("❌ Mongo connection error:", error.message);
    }
}

