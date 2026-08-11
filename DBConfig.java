import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Central database configuration. Reads connection details from environment
 * variables so credentials are never committed to source control.
 *
 * Required environment variables (set these before running the app):
 *   UTILISE_DB_HOST     e.g. localhost   (defaults to "localhost")
 *   UTILISE_DB_PORT     e.g. 3306        (defaults to "3306")
 *   UTILISE_DB_NAME     e.g. utilise     (defaults to "utilise")
 *   UTILISE_DB_USER     e.g. root        (defaults to "root")
 *   UTILISE_DB_PASSWORD REQUIRED - no default, app will refuse to start without it
 *
 * On macOS/Linux, before running:
 *   export UTILISE_DB_PASSWORD="your-new-password"
 *
 * On Windows (PowerShell):
 *   $env:UTILISE_DB_PASSWORD="your-new-password"
 *
 * For an IDE run configuration, add these as environment variables in the
 * run/debug configuration rather than typing them into code.
 */
public final class DBConfig {

    private static final String HOST = getEnvOrDefault("UTILISE_DB_HOST", "localhost");
    private static final String PORT = getEnvOrDefault("UTILISE_DB_PORT", "3306");
    private static final String DB_NAME = getEnvOrDefault("UTILISE_DB_NAME", "utilise");
    private static final String USER = getEnvOrDefault("UTILISE_DB_USER", "root");
    private static final String PASSWORD = System.getenv("UTILISE_DB_PASSWORD");

    private static final String URL = "jdbc:mysql://" + HOST + ":" + PORT + "/" + DB_NAME
            + "?useSSL=false&serverTimezone=UTC";

    private DBConfig() {
        // utility class, no instances
    }

    private static String getEnvOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value == null || value.isBlank()) ? defaultValue : value;
    }

    /** Opens a new JDBC connection using the configured credentials. */
    public static Connection getConnection() throws SQLException {
        if (PASSWORD == null || PASSWORD.isBlank()) {
            throw new SQLException(
                "UTILISE_DB_PASSWORD environment variable is not set. " +
                "Set it before starting the app - see DBConfig.java for instructions."
            );
        }
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver not found on classpath", e);
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
