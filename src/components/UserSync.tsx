"use strict";
"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";

export default function UserSync() {
    const { user } = useUser();
    const storeUser = useMutation(api.users.storeUser);

    useEffect(() => {
        if (!user) return;

        const syncUser = async () => {
            try {
                await storeUser({
                    name: user.fullName || user.firstName || "Anonymous",
                    email: user.emailAddresses[0].emailAddress,
                    imageUrl: user.imageUrl,
                    clerkId: user.id,
                });
            } catch (error) {
                console.error("Error syncing user:", error);
            }
        };

        syncUser();
    }, [user, storeUser]);

    return null;
}
