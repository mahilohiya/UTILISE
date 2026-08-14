// Simple custom policy engine inspired by CASL for Attribute-Based Access Control
export type Role = "STUDENT" | "FACULTY" | "LIBRARIAN" | "ADMIN" | "SUPERADMIN";
export type Action = "read" | "create" | "update" | "delete" | "reserve" | "issue";
export type Resource = "Book" | "User" | "Reservation" | "Fine" | "AuditLog";

interface UserContext {
    id: string;
    role: Role;
}

export function can(user: UserContext | null | undefined, action: Action, resource: Resource): boolean {
    if (!user) return false;
    if (user.role === "SUPERADMIN") return true;

    switch (resource) {
        case "Book":
            if (action === "read") return true; // Everyone can read books
            if (action === "reserve") return ["STUDENT", "FACULTY"].includes(user.role);
            if (["create", "update", "delete", "issue"].includes(action)) {
                return ["LIBRARIAN", "ADMIN"].includes(user.role);
            }
            break;
        case "Reservation":
            if (action === "read" || action === "create") return true;
            if (action === "update" || action === "delete") return ["LIBRARIAN", "ADMIN"].includes(user.role);
            break;
        case "User":
            if (action === "read") return ["LIBRARIAN", "ADMIN"].includes(user.role);
            if (["create", "update", "delete"].includes(action)) return user.role === "ADMIN";
            break;
        case "AuditLog":
            return user.role === "ADMIN";
        case "Fine":
            if (action === "read") return ["LIBRARIAN", "ADMIN"].includes(user.role);
            if (action === "update") return user.role === "ADMIN";
            break;
    }
    return false;
}
