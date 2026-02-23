import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", me._id)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                isTyping: args.isTyping,
                lastUpdated: Date.now(),
            });
        } else {
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: me._id,
                isTyping: args.isTyping,
                lastUpdated: Date.now(),
            });
        }
    },
});

export const getTypingIndicators = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) return [];

        const typing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversation_user", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return Promise.all(
            typing
                .filter((t) => t.userId !== me._id && t.isTyping && Date.now() - t.lastUpdated < 5000)
                .map(async (t) => {
                    const user = await ctx.db.get(t.userId);
                    return user?.name || "Someone";
                })
        );
    },
});
