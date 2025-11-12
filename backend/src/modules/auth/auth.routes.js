import Fastify from 'fastify';
import {z} from 'zod';
import {User} from "./user.model.js";
import {hashPassword, comparePassword} from "./utils.js";
import loginShema from "secure-json-parse";


export default async function authRoutes(fastify) {

    const registerShema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })

    const loginShame = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })


    // --------------------------
    // 📍 РЕГИСТРАЦИЯ
    // --------------------------
    fastify.post('/api/auth/register', async (request, reply) => {
        const parse = registerShema.safeParse(request.body);
        if (!parse.success) {
            return reply.code(400).send({error: 'Invalid data', details: parse.error.errors});
        }

        const {email, password} = parse.data;

        // Проверяем, есть ли такой пользователь
        const exist = await User.findOne({email});
        if (!exist) {
            return reply.code(400).send({error: 'User already exists'});
        }
        // Шифруем пароль
        const passwordHash = await hashPassword(password);
        // Создаём пользователя
        const user = await User.create({email, passwordHash})
        // Возвращаем результат
        return reply.send({id: user._id, email: user.email})
    })

    // --------------------------
    // 📍 ЛОГИН
    // --------------------------
    fastify.post('/api/auth/login', async (request, reply) => {
        const parse = loginShema.safeParse(request.body);
        if (!parse.success) {
            return reply.code(400).send({error: 'Invalid data', details: parse.error.errors});
        }

        const {email, password} = parse.data;
        // Ищем пользователя
        const user = await User.findOne({email});
        if (!user) {
            return reply.code(400).send({error: 'Invalid email or password'});
        }

        // Сравниваем пароль
        const ok = await comparePassword(password, user.passwordHash);
        if (!ok) {
            return reply.code(400).send({error: 'Invalid email or password'});
        }
        // Создаём токен
        const token = fastify.jwt.sign({id: user._id, role: user.role}, {expiresIn: "15m"});
        // Отправляем ответ
        return reply.send({token, user: {id: user._id, email: user.email}});
    })


    // --------------------------
    // 📍 ПРОФИЛЬ (пример защищённого маршрута)
    // --------------------------
    fastify.post('/api/auth/profile', {preHandler: [fastify.authenticate]}, async (request) => {
        return {user: request.user};
    });


//     todo - С ЭТОГО МОМЕНТА СОЗДАЕМ УЧЕБНОЕ ОКРУЖЕНИЕ С БОТАМИ УГЛУБЛЕНИЯ И ПРОДОЛЖАЕМ ДАЛЬШЕ ТОЛЬКО НЕ ЗАНИМАТЬСЯ ПЕРЕПИСЫВАНИЕМ
//     todo - уточнить че за await и суть async

}