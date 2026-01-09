import Fastify from "fastify";
import dotenv from "dotenv";
import {z} from "zod";
import {connectDB} from "./db.js";
import healthRoute from "./routes/health.js";
import authRoutes from "./modules/auth/auth.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import fastifyCookie from "@fastify/cookie";
import {fastifyJwt} from "@fastify/jwt";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default("0.0.0.0"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    MONGO_URL: z.string().min(1, "MONGO_URL is required"),
});

const env = envSchema.parse(process.env);
const fastify = Fastify({logger: true});

await fastify.register(fastifyCookie);
await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
});

fastify.decorate("authenticate", async (request, reply) => {
    try {
        await request.jwtVerify();
    } catch (error) {
        request.log.warn({err: error}, "JWT verify failed");
        return reply.code(401).send({error: "Unauthorized"});
    }
});


fastify.addHook("onSend", async (request, reply, payload) => {
    reply.header("Access-Control-Allow-Origin",
        request.headers.origin || "*");
    reply.header("Access-Control-Allow-Credentials", "true");
    reply.header("Access-Control-Allow-Headers",
        request.headers["access-control-request-headers"] || "Content-Type, Authorization"
    );
    reply.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    if (request.method === "OPTIONS") {
        return reply.code(204).send();
    }
    return payload;
});


await connectDB(env.MONGO_URL);
await fastify.register(healthRoute);
await fastify.register(authRoutes);
await fastify.register(leadRoutes);


const start = async () => {
    try {
        await fastify.listen({port: env.PORT, host: env.HOST});
        fastify.log.info(`Server listening on http://${env.HOST}:${env.PORT}`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
