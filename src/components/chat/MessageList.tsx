"use strict";
"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRef, useEffect, useState } from "react";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { Id } from "@convex/_generated/dataModel";

interface MessageListProps {
    conversationId: Id<"conversations">;
    meId: Id<"users"> | undefined;
}

export default function MessageList({ conversationId, meId }: MessageListProps) {
    const messages = useQuery(api.messages.getMessages, { conversationId }) || [];
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
        setShowScrollButton(!isAtBottom);
    };

    const formatMessageTime = (date: number) => {
        const d = new Date(date);
        if (isToday(d)) return format(d, "HH:mm");
        if (isThisYear(d)) return format(d, "MMM d, HH:mm");
        return format(d, "MMM d yyyy, HH:mm");
    };

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-40">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <CheckCheck className="h-8 w-8 text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-center max-w-[200px]">
                    No messages yet. Send a greeting to start the conversation!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 relative overflow-hidden group/list">
            <ScrollArea
                ref={scrollRef}
                className="h-full px-4"
                onScrollCapture={handleScroll}
            >
                <div className="flex flex-col gap-3 py-6 min-h-full justify-end">
                    {messages.map((msg: any, index: number) => {
                        const isMe = msg.senderId === meId;
                        const prevMsg = messages[index - 1];
                        const showTime = !prevMsg || (msg._creationTime - prevMsg._creationTime > 60000);

                        return (
                            <div key={msg._id} className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}>
                                {showTime && (
                                    <span className="text-[10px] text-zinc-500 font-medium mb-1 mx-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {formatMessageTime(msg._creationTime)}
                                    </span>
                                )}
                                <div className={cn(
                                    "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative",
                                    isMe
                                        ? "bg-purple-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(147,51,234,0.2)]"
                                        : "bg-white/10 text-zinc-100 rounded-tl-none ring-1 ring-white/10"
                                )}>
                                    {msg.content}
                                    {isMe && (
                                        <div className="absolute -bottom-1 -right-1">
                                            <CheckCheck className={cn("h-3 w-3", msg.seen ? "text-blue-400" : "text-white/40")} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 p-3 rounded-full bg-purple-600 text-white shadow-2xl hover:bg-purple-500 transition-all animate-in fade-in slide-in-from-bottom-2 scale-100 active:scale-90"
                >
                    <div className="relative">
                        <ChevronDown className="h-5 w-5" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400 border-2 border-purple-600 animate-ping" />
                    </div>
                </button>
            )}
        </div>
    );
}
