import { z } from "zod";
import { Lead } from "./lead.model.js";

const createLeadSchema = z.object({
    name: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    comment: z.string().optional(),
    source: z.string().optional(),
});

const updateLeadSchema = createLeadSchema.partial();

export default async function leadRoutes(fastify) {
    fastify.post(
        "/api/leads",
        { preHandler: [fastify.authenticate] },
        async (request, reply) => {
            const parsed = createLeadSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply
                    .code(400)
                    .send({ error: "Invalid data", details: parsed.error.errors });
            }

            const lead = await Lead.create({
                ...parsed.data,
                manager: request.user.id,
            });

            return reply.code(201).send(lead);
        }
    );

    fastify.get(
        "/api/leads",
        { preHandler: [fastify.authenticate] },
        async (request, reply) => {
            const leads = await Lead.find().sort({ createdAt: -1 });
            return reply.send(leads);
        }
    );

    fastify.get(
        "/api/leads/:id",
        { preHandler: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const lead = await Lead.findById(id);
            if (!lead) return reply.code(404).send({ error: "Lead not found" });
            return reply.send(lead);
        }
    );

    fastify.patch(
        "/api/leads/:id",
        { preHandler: [fastify.authenticate] },
        async (request, reply) => {
            const parsed = updateLeadSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply
                    .code(400)
                    .send({ error: "Invalid data", details: parsed.error.errors });
            }

            const { id } = request.params;

            const lead = await Lead.findByIdAndUpdate(
                id,
                { $set: parsed.data },
                { new: true }
            );

            if (!lead) return reply.code(404).send({ error: "Lead not found" });
            return reply.send(lead);
        }
    );

    fastify.delete(
        "/api/leads/:id",
        { preHandler: [fastify.authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const deleted = await Lead.findByIdAndDelete(id);
            if (!deleted) return reply.code(404).send({ error: "Lead not found" });
            return reply.send({ success: true });
        }
    );
}
