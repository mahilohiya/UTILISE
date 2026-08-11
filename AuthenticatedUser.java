/**
 * Represents the currently authenticated user for this session.
 * role is one of: STUDENT, LIBRARIAN, ADMIN, SYSTEM (matches users.role enum).
 */
public final class AuthenticatedUser {
    public final int id;
    public final String username;
    public final String role;

    public AuthenticatedUser(int id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role) || "SYSTEM".equalsIgnoreCase(role);
    }

    public boolean isLibrarianOrAbove() {
        return isAdmin() || "LIBRARIAN".equalsIgnoreCase(role);
    }
}
