"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupFriendRoutes = setupFriendRoutes;
async function setupFriendRoutes(fastify) {
    const auth = { preValidation: [fastify.authenticate] };
    // Envoyer une demande d'ami
    fastify.post('/api/friends/request', auth, async (req, reply) => {
        const { pseudo } = req.body;
        const user = req.user;
        const fromUserId = user.id;
        const targetUser = await fastify.prisma.user.findUnique({
            where: { pseudo },
        });
        if (!targetUser) {
            return reply.status(404).send({ message: "Target user not found." });
        }
        const toUserId = targetUser.id;
        if (fromUserId === toUserId) {
            return reply.status(400).send({ message: 'You cannot send a friend request to yourself.' });
        }
        const existingRequest = await fastify.prisma.friendRequest.findFirst({
            where: {
                AND: [
                    { status: 'pending' },
                    {
                        OR: [
                            { fromUserId, toUserId },
                            { fromUserId: toUserId, toUserId: fromUserId },
                        ],
                    },
                ],
            },
        });
        if (existingRequest) {
            return reply.status(400).send({ message: 'A friend request is already pending.' });
        }
        const request = await fastify.prisma.friendRequest.create({
            data: {
                fromUserId,
                toUserId,
            },
        });
        return reply.send({ message: 'Friend request sent.', request });
    });
    fastify.post('/api/friends/request/:id/accept', auth, async (req, reply) => {
        const { id } = req.params;
        const requestId = parseInt(id, 10);
        const user = req.user;
        const toUserId = user.id;
        // 🧠 Récupérer la demande avec son ID
        const request = await fastify.prisma.friendRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            return reply.status(404).send({ message: 'Request not found.' });
        }
        // ✅ Vérifier que c’est bien ce user qui est censé l’accepter
        if (request.toUserId !== toUserId) {
            return reply.status(403).send({ message: 'Unauthorized access.' });
        }
        const fromUserId = request.fromUserId;
        // ✅ Connexion bidirectionnelle
        await fastify.prisma.user.update({
            where: { id: fromUserId },
            data: {
                friends: {
                    connect: { id: toUserId },
                },
            },
        });
        await fastify.prisma.user.update({
            where: { id: toUserId },
            data: {
                friends: {
                    connect: { id: fromUserId },
                },
            },
        });
        // ✅ Mettre à jour le statut
        await fastify.prisma.friendRequest.update({
            where: { id: request.id },
            data: { status: 'accepted' },
        });
        return reply.send({ message: 'Friend request accepted.' });
    });
    /**
     * ### AJOUTÉ : Nouvelle route pour annuler/refuser une demande d'ami via l'ID de la requête
     */
    fastify.delete('/api/friends/request/:id', auth, async (req, reply) => {
        const requestId = parseInt(req.params.id, 10);
        const meId = req.user.id;
        const reqEntity = await fastify.prisma.friendRequest.findUnique({
            where: { id: requestId },
        });
        if (!reqEntity) {
            return reply.status(404).send({ message: 'Request not found.' });
        }
        if (![reqEntity.fromUserId, reqEntity.toUserId].includes(meId)) {
            return reply.status(403).send({ message: 'Unauthorized access.' });
        }
        await fastify.prisma.friendRequest.delete({ where: { id: requestId } });
        return reply.send({ message: 'Request deleted.' });
    });
    // Supprimer un ami existant (déconnexion de la relation)
    fastify.delete('/api/friends/:id', auth, async (req, reply) => {
        const friendId = parseInt(req.params.id, 10);
        const meId = req.user.id;
        try {
            // ### MODIFIÉ : on ne touche plus aux friendRequest ici
            await fastify.prisma.user.update({
                where: { id: meId },
                data: {
                    friends: { disconnect: { id: friendId } },
                },
            });
            await fastify.prisma.user.update({
                where: { id: friendId },
                data: {
                    friends: { disconnect: { id: meId } },
                },
            });
            return reply.send({ message: 'Ami supprimé.' });
        }
        catch (err) {
            console.error('❌ Error deleting friend:', err);
            return reply.status(500).send({ message: 'Error while deleting friend.' });
        }
    });
    // Récupérer les amis et demandes
    fastify.get('/api/friends', auth, async (req, reply) => {
        const userx = req.user;
        const userId = userx.id;
        const user = await fastify.prisma.user.findUnique({
            where: { id: userId },
            include: {
                friends: true,
                sentRequests: {
                    where: { status: 'pending' }, // ✅ MODIFIÉ : on récupère seulement les "pending"
                    include: { toUser: true },
                },
                receivedRequests: {
                    where: { status: 'pending' },
                    include: { fromUser: true },
                },
            },
        });
        if (!user)
            return reply.status(404).send({ message: 'User not found' });
        return reply.send({
            friends: user.friends,
            sentRequests: user.sentRequests.map((r) => r.toUser),
            receivedRequests: user.receivedRequests.map((r) => r.fromUser),
        });
    });
    // Récupérer les demandes reçues (séparé si besoin)
    fastify.get('/api/friends/requests/received', auth, async (req, reply) => {
        const user = req.user;
        const userId = user.id;
        const requests = await fastify.prisma.friendRequest.findMany({
            where: {
                toUserId: userId,
                status: 'pending',
            },
            include: {
                fromUser: true,
            },
        });
        if (!requests)
            return reply.status(404).send({ message: 'No requests found' });
        return requests.map((request) => ({
            id: request.id,
            from: {
                id: request.fromUser.id,
                pseudo: request.fromUser.pseudo,
                avatarUrl: request.fromUser.avatarUrl,
            },
        }));
    });
    // Récupérer les demandes envoyées (filtrées) ### MODIFIÉ : status = 'pending'
    fastify.get('/api/friends/requests/sent', auth, async (req, reply) => {
        const user = req.user;
        const userId = user.id;
        const requests = await fastify.prisma.friendRequest.findMany({
            where: { fromUserId: userId, status: 'pending' },
            include: { toUser: true },
        });
        return requests.map((r) => ({
            id: r.id,
            to: {
                id: r.toUser.id,
                pseudo: r.toUser.pseudo,
                avatarUrl: r.toUser.avatarUrl,
            },
        }));
    });
    // Endpoint jeux (inchangé)
    fastify.post('/api/games', async (req, res) => {
        try {
            const { player1Id, player2Id, player1Score, player2Score, winnerId, reason, gameId } = req.body;
            console.log("📥 API received game result:", req.body);
            const result = await fastify.prisma.gameResult.create({
                data: {
                    id: gameId || undefined,
                    player1Id,
                    player2Id,
                    player1Score,
                    player2Score,
                    winnerId,
                    reason: reason || 'normal',
                },
            });
            console.log("✅ Game saved:", result);
            return res.status(201).send(result);
        }
        catch (err) {
            console.error("❌ Error in /api/games:", err);
            return res.status(500).send({
                error: 'Internal server error',
                detail: err?.message || 'Unknown error',
            });
        }
    });
}
