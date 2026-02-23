"use strict";
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Send, Phone, Video, MoreVertical, Sparkles, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatPanel({ conversationId, onBack }: any) {
    const conversation = useQuery(api.conversations.getConversations)?.find(c => c._id === conversationId);
    const markAsRead = useMutation(api.messages.markAsRead);
    const me = useQuery(api.users.getMe);

    useEffect(() => {
        if (conversationId) {
            markAsRead({ conversationId });
        }
    }, [conversationId, markAsRead]);

    if (!conversationId) {
        return (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

                <div className="relative z-10 flex flex-col items-center gap-6 p-8 text-center max-w-sm">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-sm">
                        <Sparkles className="h-12 w-12 text-purple-400 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to ChatPulse</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Experience the next generation of real-time messaging. Select a conversation to start chatting.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!conversation) return null;

    const otherUser = conversation.otherUser;

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0b] h-full relative">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#111114]/50 backdrop-blur-2xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-zinc-400" />
                    </button>
                    <div className="relative group cursor-pointer">
                        <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-purple-500/0 group-hover:ring-purple-500/30 transition-all">
                            <AvatarImage src={otherUser?.imageUrl} />
                            <AvatarFallback>{otherUser?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {otherUser?.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#111114]" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-100 hover:text-purple-300 transition-colors cursor-pointer">
                            {otherUser?.name}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-500/80">
                            {otherUser?.isOnline ? "Online Now" : "Offline"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                        <Phone className="h-4.5 w-4.5" />
                    </button>
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                        <Video className="h-4.5 w-4.5" />
                    </button>
                    <div className="w-px h-6 bg-white/5 mx-1" />
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
                        <MoreVertical className="h-4.5 w-4.5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <MessageList conversationId={conversationId} meId={me?._id} />

            {/* Input */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
}
