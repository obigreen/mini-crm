import Fastify from 'fastify';
import {z} from 'zod';
import {User} from "./user.model.js";
import {hashPassword, comparePassword} from "./utils.js";


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
    })



//     todo - С ЭТОГО МОМЕНТА СОЗДАЕМ УЧЕБНОЕ ОКРУЖЕНИЕ С БОТАМИ УГЛУБЛЕНИЯ И ПРОДОЛЖАЕМ ДАЛЬШЕ ТОЛЬКО НЕ ЗАНИМАТЬСЯ ПЕРЕПИСЫВАНИЕМ

}