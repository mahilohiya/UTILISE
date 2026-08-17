import java.sql.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class LibraryAutomationService {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "Cupcakemahi";

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public void startAutomation() {
        // Run the daily tasks every day at midnight (for simplicity, running every 1
        // minute in this demo)
        scheduler.scheduleAtFixedRate(this::runDailyTasks, 0, 1, TimeUnit.MINUTES);
        System.out.println("Library Automation Service started.");
    }

    public void stopAutomation() {
        scheduler.shutdown();
        System.out.println("Library Automation Service stopped.");
    }

    private void runDailyTasks() {
        System.out.println("Running daily library automation tasks...");
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            processOverdueBooks(conn);
            processWaitlist(conn);
            checkInventoryAlerts(conn);
        } catch (SQLException e) {
            System.err.println("Automation task failed: " + e.getMessage());
        }
    }

    private void processOverdueBooks(Connection conn) throws SQLException {
        // 1. Calculate fines for overdue books
        // 2. Send notifications for overdue books
        // 3. Auto-renew if no waitlist

        String getOverdueQuery = "SELECT b.id, b.user_id, b.book_id, b.due_date, b.renewals_count " +
                "FROM borrowings b WHERE b.status = 'BORROWED' AND b.due_date < NOW()";

        try (Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(getOverdueQuery)) {

            while (rs.next()) {
                int borrowingId = rs.getInt("id");
                int userId = rs.getInt("user_id");
                int bookId = rs.getInt("book_id");
                int renewalsCount = rs.getInt("renewals_count");

                // Check if there is a waitlist for this book
                boolean hasWaitlist = checkWaitlist(conn, bookId);

                if (!hasWaitlist && renewalsCount < 2) {
                    // Auto-renew
                    autoRenewBook(conn, borrowingId, userId, bookId);
                } else {
                    // Apply fine and notify
                    applyFine(conn, borrowingId);
                    createNotification(conn, userId, "Your book is overdue. A fine has been applied.");
                }
            }
        }
    }

    private boolean checkWaitlist(Connection conn, int bookId) throws SQLException {
        String query = "SELECT COUNT(*) FROM reservations WHERE book_id = ? AND status = 'PENDING'";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setInt(1, bookId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        }
        return false;
    }

    private void autoRenewBook(Connection conn, int borrowingId, int userId, int bookId) throws SQLException {
        String query = "UPDATE borrowings SET due_date = DATE_ADD(due_date, INTERVAL 14 DAY), renewals_count = renewals_count + 1 WHERE id = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setInt(1, borrowingId);
            pstmt.executeUpdate();
        }
        createNotification(conn, userId, "Your borrowed book has been automatically renewed for 14 days.");
        logAudit(conn, "SYSTEM", "AUTO_RENEW", "borrowing", borrowingId, "Auto-renewed book ID " + bookId);
    }

    private void applyFine(Connection conn, int borrowingId) throws SQLException {
        // Apply a fixed fine of $1.00 per day overdue (simplified)
        String query = "UPDATE borrowings SET fine_amount = fine_amount + 1.00, status = 'OVERDUE' WHERE id = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setInt(1, borrowingId);
            pstmt.executeUpdate();
        }
    }

    private void processWaitlist(Connection conn) throws SQLException {
        // Check for returned books that have pending reservations
        String query = "SELECT r.id, r.user_id, r.book_id FROM reservations r " +
                "JOIN books b ON r.book_id = b.id " +
                "WHERE r.status = 'PENDING' AND b.available_copies > 0 " +
                "ORDER BY r.reservation_date ASC";

        try (Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                int reservationId = rs.getInt("id");
                int userId = rs.getInt("user_id");
                int bookId = rs.getInt("book_id");

                // Fulfill reservation
                fulfillReservation(conn, reservationId, userId, bookId);
            }
        }
    }

    private void fulfillReservation(Connection conn, int reservationId, int userId, int bookId) throws SQLException {
        // Update reservation status
        String updateRes = "UPDATE reservations SET status = 'FULFILLED' WHERE id = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(updateRes)) {
            pstmt.setInt(1, reservationId);
            pstmt.executeUpdate();
        }

        // Notify user
        createNotification(conn, userId, "A book you reserved is now available!");
        logAudit(conn, "SYSTEM", "RESERVATION_FULFILLED", "reservation", reservationId,
                "Fulfilled reservation for user " + userId);
    }

    private void checkInventoryAlerts(Connection conn) throws SQLException {
        String query = "SELECT id, title, available_copies, physical_condition FROM books WHERE available_copies = 0 OR physical_condition = 'POOR'";
        try (Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {

            while (rs.next()) {
                int bookId = rs.getInt("id");
                String title = rs.getString("title");
                int copies = rs.getInt("available_copies");
                String condition = rs.getString("physical_condition");

                if (copies == 0) {
                    logAudit(conn, "SYSTEM", "INVENTORY_ALERT", "book", bookId,
                            "Book '" + title + "' is out of stock.");
                }
                if ("POOR".equals(condition)) {
                    logAudit(conn, "SYSTEM", "CONDITION_ALERT", "book", bookId,
                            "Book '" + title + "' is in poor condition and needs replacement.");
                }
            }
        }
    }

    private void createNotification(Connection conn, int userId, String message) throws SQLException {
        String query = "INSERT INTO notifications (user_id, message) VALUES (?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setInt(1, userId);
            pstmt.setString(2, message);
            pstmt.executeUpdate();
        }
    }

    private void logAudit(Connection conn, String userId, String action, String entityType, int entityId,
            String details) throws SQLException {
        String query = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ((SELECT id FROM users WHERE username = ? LIMIT 1), ?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setString(1, userId);
            pstmt.setString(2, action);
            pstmt.setString(3, entityType);
            pstmt.setInt(4, entityId);
            pstmt.setString(5, details);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            // Ignore if SYSTEM user doesn't exist yet
        }
    }

    public static void main(String[] args) {
        LibraryAutomationService service = new LibraryAutomationService();
        service.startAutomation();
    }
}
