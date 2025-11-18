"use client";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getAll, {});
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="max-w-sm w-full mx-auto">
        <p>Widget APP</p>
        {JSON.stringify(users, null, 2)}
      </div>
    </div>
  );
}
