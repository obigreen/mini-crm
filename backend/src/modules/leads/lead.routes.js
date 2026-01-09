import {z} from 'zod';
import {Lead} from './lead.model.js';


// -----------------------------
// ✅ СХЕМА ДЛЯ СОЗДАНИЯ ЛИДА
// -----------------------------
const createLeadSchema = z.object({
    name: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    comment: z.string().optional(),
    source: z.string().optional(),
});


// -----------------------------
// ✅ СХЕМА ДЛЯ ОБНОВЛЕНИЯ ЛИДА
// -----------------------------
const updateLeadSchema = createLeadSchema.partial();


// -----------------------------
// ✅ ЭКСПОРТ МОДУЛЯ МАРШРУТОВ
// -----------------------------
export default async function leadRoutes(fastify) {


    // -------------------------------
    // ✅ CREATE — СОЗДАТЬ ЛИД
    // -------------------------------
    fastify.post("/api/leads", {preHandler: [fastify.authenticate]}, async (request, reply) => {
        const parsed = createLeadSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({error: "Invalid data", details: parsed.error.errors});
        }
        const lead = await Lead.create({
            ...parsed.data,
            manager: request.user.id
        })
        return reply.code(201).send(lead);
    });


    // -------------------------------
    // ✅ READ — ПОЛУЧИТЬ СПИСОК ЛИДОВ
    // -------------------------------
    fastify.get('/api/leads', {preHandler: [fastify.authenticate]}, async (request, reply) => {
        // .sort({ createdAt: -1 }) — сортировка:
        // -1 означает по убыванию (новые сверху).
        const lead = await Lead.find().sort({createdAt: -1})
        return reply.send(lead);
    });


    // -------------------------------
    // ✅ READ ONE — ПОЛУЧИТЬ ЛИД ПО ID
    // -------------------------------
    // /api/leads/:id — двоеточие означает параметр маршрута.
    // То есть URL будет, например: /api/leads/64f1a...
    // request.params.id — значение этого параметра.
    fastify.get('/api/leads/:id', {preHandler: [fastify.authenticate]}, async (request, reply) => {
        const {id} = request.params;
        const lead = await Lead.findById(id);
        if (!lead) {
            return reply.code(404).send({error: "Lead not found"});
        }
        return reply.send(lead);
    });


    // -------------------------------
    // ✅ UPDATE — ОБНОВИТЬ ЛИД
    // -------------------------------
    fastify.patch('/api/leads/:id', {preHandler: [fastify.authenticate]}, async (request, reply) => {
        const parsed = createLeadSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.code(400).send({error: "Invalid data", details: parsed.error.errors});
        }
        const {id} = request.params;
        // Обновляем документ.
        // Lead.findByIdAndUpdate(id, update, options)
        const lead = await Lead.findByIdAndUpdate(
            id,
            // update: { $set: parsed.data } — "установи эти поля"
            {$set: parsed.data},
            // options: {new: true} — верни уже обновлённый документ, а не старый.
            {new: true},
        )
        if (!lead) {
            return reply.code(404).send({error: "Lead not found"});
        }
        return reply.send(lead);
    });


    // -------------------------------
    // ✅ DELETE — УДАЛИТЬ ЛИД
    // -------------------------------
    fastify.delete('/api/leads/:id', async (request, reply) => {
        const {id} = request.params;
        const deleted = await Lead.findByIdAndDelete(id);
        if(!deleted) {
            return reply.code(404).send({error: "Lead not found"});
        }
        return reply.send({success: true});
    })
};









