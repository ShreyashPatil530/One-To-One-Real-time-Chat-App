"use strict";
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Search, MessageSquare, Users, UserCircle2, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Sidebar({ onSelectConversation, activeConversationId }: any) {
    const { signOut, user } = useClerk();
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"conversations" | "users">("conversations");

    const conversations = useQuery(api.conversations.getConversations) || [];
    const allUsers = useQuery(api.users.getUsers, { searchTerm }) || [];
    const startConversation = useMutation(api.conversations.getOrCreateConversation);

    const handleStartChat = async (userId: any) => {
        const id = await startConversation({ participantId: userId });
        onSelectConversation(id);
        setView("conversations");
    };

    return (
        <div className="flex flex-col h-full bg-[#111114] border-r border-white/5 w-full md:w-[350px] shrink-0">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#111114]/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white/10 ring-2 ring-purple-500/20">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate max-w-[120px]">
                            {user?.fullName || "Me"}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-zinc-400 font-medium">Online</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                >
                    <LogOut className="h-4 w-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
                </button>
            </div>

            {/* View Toggle */}
            <div className="p-4 flex gap-2">
                <button
                    onClick={() => setView("conversations")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-xs font-medium",
                        view === "conversations"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                            : "text-zinc-400 hover:bg-white/5"
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    Chats
                </button>
                <button
                    onClick={() => setView("users")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all text-xs font-medium",
                        view === "users"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                            : "text-zinc-400 hover:bg-white/5"
                    )}
                >
                    <Users className="h-4 w-4" />
                    People
                </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                    <Input
                        placeholder={view === "users" ? "Search people..." : "Search messages..."}
                        className="pl-9 bg-white/5 border-white/5 focus-visible:ring-purple-500/50 h-10 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1 px-2">
                <div className="flex flex-col gap-1 pb-4">
                    {view === "users" ? (
                        allUsers.length > 0 ? (
                            allUsers.map((u) => (
                                <motion.button
                                    key={u._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleStartChat(u._id)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                                >
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                                            <AvatarImage src={u.imageUrl} />
                                            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {u.isOnline && (
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#111114]" />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                                            {u.name}
                                        </span>
                                        <span className="text-xs text-zinc-500 truncate">
                                            {u.isOnline ? "Available to chat" : "Last seen recently"}
                                        </span>
                                    </div>
                                </motion.button>
                            ))
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center gap-3 opacity-50">
                                <UserCircle2 className="h-10 w-10 text-zinc-600" />
                                <p className="text-sm text-zinc-500 font-medium">No users found</p>
                            </div>
                        )
                    ) : (
                        conversations.length > 0 ? (
                            conversations.map((conv) => (
                                <motion.button
                                    key={conv._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelectConversation(conv._id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl transition-all text-left relative group",
                                        activeConversationId === conv._id
                                            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/10 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                                            : "hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-11 w-11 border border-white/10">
                                            <AvatarImage src={conv.otherUser?.imageUrl} />
                                            <AvatarFallback>{conv.otherUser?.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {conv.otherUser?.isOnline && (
                                            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#111114]" />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={cn(
                                                "text-sm font-semibold truncate transition-colors",
                                                activeConversationId === conv._id ? "text-purple-300" : "text-zinc-200 group-hover:text-white"
                                            )}>
                                                {conv.otherUser?.name}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                                    {new Date(conv.lastMessage._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-1 mt-0.5">
                                            <span className={cn(
                                                "text-xs truncate transition-colors",
                                                conv.unreadCount > 0 ? "text-zinc-100 font-medium" : "text-zinc-500"
                                            )}>
                                                {conv.lastMessage?.content || "Tap to start chatting"}
                                            </span>
                                            {conv.unreadCount > 0 && (
                                                <div className="h-4.5 min-w-[18px] px-1 flex items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white shadow-[0_2px_10px_rgba(168,85,247,0.4)] animate-in zoom-in-50">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            ))
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center gap-4">
                                <div className="p-4 rounded-full bg-purple-500/5 ring-1 ring-purple-500/10">
                                    <MessageSquare className="h-8 w-8 text-zinc-600" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-zinc-300">No conversations</p>
                                    <p className="text-xs text-zinc-500 max-w-[180px] leading-relaxed">
                                        Select a user from the People tab to start messaging.
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
