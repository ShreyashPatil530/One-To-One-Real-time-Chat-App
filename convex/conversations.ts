import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
    args: { participantId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        // Check if conversation exists
        const existing = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.or(
                    q.and(
                        q.eq(q.field("participantIds"), [me._id, args.participantId])
                    ),
                    q.and(
                        q.eq(q.field("participantIds"), [args.participantId, me._id])
                    )
                )
            )
            .unique();

        if (existing) return existing._id;

        return await ctx.db.insert("conversations", {
            participantIds: [me._id, args.participantId],
        });
    },
});

export const getConversations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) return [];

        const conversations = await ctx.db
            .query("conversations")
            .collect();

        const myConversations = conversations.filter(c => c.participantIds.includes(me._id));

        return await Promise.all(
            myConversations.map(async (conv) => {
                const otherId = conv.participantIds.find((id) => id !== me._id)!;
                const otherUser = await ctx.db.get(otherId);
                const lastMessage = conv.lastMessageId
                    ? await ctx.db.get(conv.lastMessageId)
                    : null;

                // Count unread
                const unreadMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
                    .filter(q => q.and(
                        q.eq(q.field("seen"), false),
                        q.neq(q.field("senderId"), me._id)
                    ))
                    .collect();

                return {
                    ...conv,
                    otherUser,
                    lastMessage,
                    unreadCount: unreadMessages.length,
                };
            })
        );
    },
});
