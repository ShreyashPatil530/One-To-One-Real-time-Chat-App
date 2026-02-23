"use strict";
"use client";

import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { Id } from "@convex/_generated/dataModel";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null);

  return (
    <main className="flex h-screen overflow-hidden bg-[#0a0a0b] selection:bg-purple-500/30">
      <AnimatePresence mode="wait">
        {/* Sidebar */}
        <motion.div
          key="sidebar"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={cn(
            "flex-col h-full z-20",
            activeConversationId ? "hidden md:flex" : "flex w-full md:w-[350px]"
          )}
        >
          <Sidebar
            onSelectConversation={setActiveConversationId}
            activeConversationId={activeConversationId}
          />
        </motion.div>

        {/* Chat Panel */}
        <motion.div
          key={activeConversationId || "empty"}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-1 h-full z-10",
            !activeConversationId ? "hidden md:flex" : "flex flex-col"
          )}
        >
          <ChatPanel
            conversationId={activeConversationId}
            onBack={() => setActiveConversationId(null)}
          />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
