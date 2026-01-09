import Fastify from 'fastify';
import dotenv from 'dotenv';
import leadRoutes from "./modules/leads/lead.routes.js";
// Библиотека для валидации JWT
import { z } from 'zod';
import {connectDB} from './db.js';
import healthRoute from "./routes/health.js";
import authRoutes from "./modules/auth/auth.routes.js";
import fastifyCookie from "@fastify/cookie";
import {fastifyJwt} from "@fastify/jwt";

dotenv.config();
// const fastify = Fastify({logger: true});

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default('0.0.0.0'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    MONGO_URL: z.string().min(1, 'MONGO_URL is required'),
})


// Подключаем плагины
// await  fastify.register(fastifyCookie);
// await fastify.register(fastifyJwt, {secret: process.env.JWT_SECRET});
const env = envSchema.parse(process.env);
const fastify = Fastify({logger: true});


await fastify.register(fastifyCookie, {
    // По умолчанию fastify-cookie поддерживает подписанные и обычные куки.
    // Оставляем настройки простыми, чтобы легче было отлаживать.
});

// Добавляем middleware для защиты приватных маршрутов
fastify.decorate("authenticate", async (request, reply) => {
    try {
        await request.jwtVerify(); // проверяет токен
    } catch (error) {
        return reply.code(401).send({error: "Unauthorized"});
    }
})


// await connectDB();

await fastify.register(fastifyJwt, {secret: process.env.JWT_SECRET});

// Простая CORS-настройка без отдельного плагина, чтобы не зависеть от внешних пакетов
fastify.addHook('onSend', async (request, reply, payload) => {
    reply.header('Access-Control-Allow-Origin', request.headers.origin || "*");
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Headers', request.headers['access-control-request-headers'] || 'Content-Type, Authorization');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    if(request.method === 'OPTIONS'){
        return reply.code(200).send();
    }
    return payload
})

// Middleware для защиты приватных маршрутов
fastify.decorate('authenticate', async (request, reply) => {
    try {
        await request.jwtVerify();
    } catch (error) {
        request.log.warn({ err: error}, 'JWT_SECRET is required');
        return reply.code(401).send({error: "Unauthorized"});
    }
})



await fastify.register(healthRoute);
await fastify.register(authRoutes);
await fastify.register(leadRoutes);

const start = async () => {
    // try {
    //     await fastify.listen({port: process.env.PORT});
    // } catch (error) {
    //     fastify.log.error(error);
    //     process.exit(1);
    // }

    try {
        await fastify.listen({port: env.PORT, host: env.HOST})
        fastify.log.info(`Server listening on http://${env.HOST}:${env.PORT}`);

    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}


start();