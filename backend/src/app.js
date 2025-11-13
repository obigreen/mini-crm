import Fastify from 'fastify';
import dotenv from 'dotenv';
import {connectDB} from './db.js';
import healthRoute from "./routes/health.js";
import authRoutes from "./modules/auth/auth.routes.js";
import fastifyCookie from "@fastify/cookie";
import {fastifyJwt} from "@fastify/jwt";

dotenv.config();
const fastify = Fastify({logger: true});


// Подключаем плагины
await  fastify.register(fastifyCookie);
await fastify.register(fastifyJwt, {secret: process.env.JWT_SECRET});

// Добавляем middleware для защиты приватных маршрутов
fastify.decorate("authenticate", async (request, reply) => {
    try {
        await request.jwtVerify(); // проверяет токен
    } catch (error) {
        return reply.code(401).send({error: "Unauthorized"});
    }
})


await connectDB();
await fastify.register(healthRoute);
await fastify.register(authRoutes);

const start = async () => {
    try {
        await fastify.listen({port: process.env.PORT});
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}


start();