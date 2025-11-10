export default async function healthRoute(fastify) {
    fastify.get('/health', async () => {
        return {
            ok: true,
            time: new Date().toISOString()
        };
    })
}