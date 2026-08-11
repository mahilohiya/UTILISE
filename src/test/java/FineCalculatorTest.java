import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class FineCalculatorTest {

    @Test
    void noFineWhenNotYetDue() {
        LocalDate dueDate = LocalDate.of(2026, 8, 15);
        LocalDate today = LocalDate.of(2026, 8, 10);
        assertEquals(0.0, FineCalculator.calculateFine(dueDate, today));
    }

    @Test
    void noFineOnExactDueDate() {
        LocalDate dueDate = LocalDate.of(2026, 8, 15);
        assertEquals(0.0, FineCalculator.calculateFine(dueDate, dueDate));
    }

    @Test
    void oneDayOverdueChargesOneDay() {
        LocalDate dueDate = LocalDate.of(2026, 8, 15);
        LocalDate today = LocalDate.of(2026, 8, 16);
        assertEquals(1.00, FineCalculator.calculateFine(dueDate, today), 0.001);
    }

    @Test
    void fiveDaysOverdueChargesFiveTimesRate() {
        LocalDate dueDate = LocalDate.of(2026, 8, 15);
        LocalDate today = LocalDate.of(2026, 8, 20);
        assertEquals(5.00, FineCalculator.calculateFine(dueDate, today), 0.001);
    }

    @Test
    void fineIsCappedAtMaximum() {
        LocalDate dueDate = LocalDate.of(2026, 1, 1);
        LocalDate today = LocalDate.of(2026, 8, 1); // 200+ days overdue
        assertEquals(FineCalculator.MAX_FINE, FineCalculator.calculateFine(dueDate, today), 0.001);
    }

    @Test
    void fineDoesNotDependOnHowManyTimesCalculated() {
        // Regression test for the original bug: fine used to grow every time
        // the automation job ran, regardless of actual days overdue. It must
        // now be a pure function of (dueDate, today) - calling it repeatedly
        // with the same inputs must return the same result.
        LocalDate dueDate = LocalDate.of(2026, 8, 15);
        LocalDate today = LocalDate.of(2026, 8, 18);
        double first = FineCalculator.calculateFine(dueDate, today);
        double second = FineCalculator.calculateFine(dueDate, today);
        double third = FineCalculator.calculateFine(dueDate, today);
        assertEquals(first, second);
        assertEquals(second, third);
        assertEquals(3.00, first, 0.001);
    }

    @Test
    void nullDatesThrow() {
        assertThrows(IllegalArgumentException.class,
                () -> FineCalculator.calculateFine(null, LocalDate.now()));
        assertThrows(IllegalArgumentException.class,
                () -> FineCalculator.calculateFine(LocalDate.now(), null));
    }

    @Test
    void isOverdueDetection() {
        LocalDate dueDate = LocalDate.of(2026, 8, 15);
        assertFalse(FineCalculator.isOverdue(dueDate, LocalDate.of(2026, 8, 14)));
        assertFalse(FineCalculator.isOverdue(dueDate, LocalDate.of(2026, 8, 15)));
        assertTrue(FineCalculator.isOverdue(dueDate, LocalDate.of(2026, 8, 16)));
    }
}
