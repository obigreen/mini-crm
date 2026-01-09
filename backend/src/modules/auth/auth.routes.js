import { z } from 'zod';
import { User } from "./user.model.js";
import { hashPassword, comparePassword } from "./utils.js";

// ---------------------
// 📌 СХЕМЫ ВАЛИДАЦИИ
// ---------------------
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});


export default async function authRoutes(fastify) {

    // ---------------------
    // 📌 Генерация токенов
    // ---------------------
    const issueTokens = (user) => {
        const payload = { id: user._id.toString(), role: user.role };
        const token = fastify.jwt.sign(payload, { expiresIn: '15m' });
        const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' });
        return { token, refreshToken };
    };


    // ---------------------
    // 📌 Установка refresh-token в cookie
    // ---------------------
    const setRefreshCookie = (reply, refreshToken) => {
        reply.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/api/auth',
            maxAge: 60 * 60 * 24 * 7,
        });
    };


    // --------------------------
    // 📍 РЕГИСТРАЦИЯ
    // --------------------------
    fastify.post('/api/auth/register', async (request, reply) => {
        const parse = registerSchema.safeParse(request.body);
        if (!parse.success) {
            return reply.code(400).send({ error: 'Invalid data', details: parse.error.errors });
        }
        const { email, password } = parse.data;
        const exist = await User.findOne({ email });
        if (exist) {
            return reply.code(400).send({ error: 'User already exists' });
        }
        const passwordHash = await hashPassword(password);
        const user = await User.create({ email, passwordHash });
        const { token, refreshToken } = issueTokens(user);
        setRefreshCookie(reply, refreshToken);
        return reply.send({ token, user: { id: user._id, email: user.email } });
    });


    // --------------------------
    // 📍 ЛОГИН
    // --------------------------
    fastify.post('/api/auth/login', async (request, reply) => {
        const parse = loginSchema.safeParse(request.body);
        if (!parse.success) {
            return reply.code(400).send({ error: 'Invalid data', details: parse.error.errors });
        }
        const { email, password } = parse.data;
        const user = await User.findOne({ email });
        if (!user) {
            return reply.code(400).send({ error: 'Invalid email or password' });
        }
        const ok = await comparePassword(password, user.passwordHash);
        if (!ok) {
            return reply.code(400).send({ error: 'Invalid email or password' });
        }
        const { token, refreshToken } = issueTokens(user);
        setRefreshCookie(reply, refreshToken);
        return reply.send({ token, user: { id: user._id, email: user.email } });
    });


    // --------------------------
    // 📍 ОБНОВЛЕНИЕ ACCESS-ТOКЕНА
    // --------------------------
    fastify.post('/api/auth/refresh', async (request, reply) => {
        const refreshToken = request.cookies.refreshToken;
        if (!refreshToken) {
            return reply.code(401).send({ error: 'Missing refresh token' });
        }
        try {
            const payload = await fastify.jwt.verify(refreshToken);
            const user = await User.findById(payload.id);
            if (!user) {
                return reply.code(401).send({ error: 'User not found' });
            }
            const tokens = issueTokens(user);
            setRefreshCookie(reply, tokens.refreshToken);
            return reply.send({ token: tokens.token, user: { id: user._id, email: user.email } });
        } catch (error) {
            request.log.warn({ err: error }, 'Refresh token verification failed');
            return reply.code(401).send({ error: 'Invalid refresh token' });
        }
    });


    // --------------------------
    // 📍 ВЫХОД
    // --------------------------
    fastify.post('/api/auth/logout', async (request, reply) => {
        reply.clearCookie('refreshToken', { path: '/api/auth' });
        return reply.send({ success: true });
    });


    // --------------------------
    // 📍 ПРОФИЛЬ (пример защищённого маршрута)
    // --------------------------
    fastify.get('/api/auth/profile', { preHandler: [fastify.authenticate] }, async (request) => {
        return { user: request.user };
    });
}


