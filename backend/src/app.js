import Fastify from 'fastify';
import dotenv from 'dotenv';
import {connectDB} from './db.js';
import healthRoute from "./routes/health.js";

dotenv.config();
const fastify = Fastify({logger: true});
await connectDB();
await fastify.register(healthRoute);

const start = async () => {
    try {
        await fastify.listen({port: process.env.PORT});
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}


start();