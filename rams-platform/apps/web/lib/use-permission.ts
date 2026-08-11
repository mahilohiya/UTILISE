"use client";

import { useSession } from "next-auth/react";
import { can, type Action, type Resource } from "./rbac";

export function usePermission(action: Action, resource: Resource) {
  const { data: session } = useSession();
  return can(session?.user, action, resource);
}
