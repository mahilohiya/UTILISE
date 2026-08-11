import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Pure fine-calculation logic, kept free of any DB/JDBC dependency so it can
 * be unit tested directly. Rules:
 *   - No fine within the grace period.
 *   - $1.00 per day overdue after the grace period.
 *   - Capped at a maximum fine per book.
 */
public final class FineCalculator {

    public static final int GRACE_PERIOD_DAYS = 0;
    public static final double RATE_PER_DAY = 1.00;
    public static final double MAX_FINE = 50.00;

    private FineCalculator() {
    }

    /**
     * @param dueDate the date the book was due
     * @param today   the date to calculate the fine as of
     * @return fine amount in dollars, never negative, capped at MAX_FINE
     */
    public static double calculateFine(LocalDate dueDate, LocalDate today) {
        if (dueDate == null || today == null) {
            throw new IllegalArgumentException("dueDate and today must not be null");
        }
        long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
        long billableDays = daysOverdue - GRACE_PERIOD_DAYS;
        if (billableDays <= 0) {
            return 0.0;
        }
        double fine = billableDays * RATE_PER_DAY;
        return Math.min(fine, MAX_FINE);
    }

    /** True if the book is overdue at all (past due date, regardless of grace period). */
    public static boolean isOverdue(LocalDate dueDate, LocalDate today) {
        if (dueDate == null || today == null) {
            throw new IllegalArgumentException("dueDate and today must not be null");
        }
        return today.isAfter(dueDate);
    }
}
