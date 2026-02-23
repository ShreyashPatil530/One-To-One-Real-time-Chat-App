"use strict";
"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, Smile, Paperclip, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Id } from "../../convex/_generated/dataModel";

export default function MessageInput({ conversationId }: { conversationId: Id<"conversations"> }) {
    const [content, setContent] = useState("");
    const sendMessage = useMutation(api.messages.sendMessage);
    const setTyping = useMutation(api.typing.setTyping);
    const typingIndicators = useQuery(api.typing.getTypingIndicators, { conversationId }) || [];

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = async (e?: any) => {
        if (e) e.preventDefault();
        if (!content.trim()) return;

        try {
            setContent("");
            await sendMessage({ conversationId, content: content.trim() });
            await setTyping({ conversationId, isTyping: false });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTyping = () => {
        setTyping({ conversationId, isTyping: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setTyping({ conversationId, isTyping: false });
        }, 3000);
    };

    return (
        <div className="p-4 border-t border-white/5 bg-[#111114]/50 backdrop-blur-3xl">
            {/* Typing Indicator */}
            <div className="h-4 mb-2">
                {typingIndicators.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-medium animate-pulse ml-2">
                        <div className="flex gap-0.5">
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" />
                        </div>
                        {typingIndicators.join(", ")} {typingIndicators.length === 1 ? "is" : "are"} typing...
                    </div>
                )}
            </div>

            <div className="flex items-end gap-3 max-w-5xl mx-auto">
                <div className="flex items-center gap-1 mb-1">
                    <button className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
                        <Smile className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 relative group">
                    <Input
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="w-full bg-white/5 border-white/5 focus-visible:ring-purple-500/50 py-6 pr-12 rounded-2xl transition-all resize-none min-h-[52px]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!content.trim()}
                        className={cn(
                            "absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all",
                            content.trim()
                                ? "bg-purple-600 text-white shadow-[0_4px_15px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-95"
                                : "bg-white/5 text-zinc-600 cursor-not-allowed"
                        )}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
