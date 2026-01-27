"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function UserSync() {
  const { user, isLoaded } = useUser();
  // We use the 'store' mutation we created in the users.ts file earlier
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (isLoaded && user) {
      storeUser({
        email: user.emailAddresses[0].emailAddress,
        tokenIdentifier: user.id,
      });
    }
  }, [isLoaded, user, storeUser]);

  return null; // This component doesn't render anything UI-wise
}
