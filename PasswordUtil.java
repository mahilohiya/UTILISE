import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Password hashing utility.
 *
 * NOTE: This uses unsalted SHA-256, which is a real improvement over storing
 * plaintext passwords (what the schema seed data did before) but is NOT
 * production-grade - it has no per-user salt and no work factor, so it's
 * vulnerable to rainbow-table and brute-force attacks at scale. For a real
 * deployment, replace this with BCrypt or Argon2 (e.g. the jBCrypt library).
 * This is sized for a student-project / CV context, not production auth.
 */
public final class PasswordUtil {

    private PasswordUtil() {
    }

    public static String hash(String plaintext) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(plaintext.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Unable to hash password", e);
        }
    }

    public static boolean verify(String plaintext, String storedHash) {
        if (plaintext == null || storedHash == null) {
            return false;
        }
        return hash(plaintext).equals(storedHash);
    }
}
