import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

/**
 * Generates CSV and PDF reports for library administration:
 *   - Overdue books report (who has what overdue, days overdue, current fine)
 *   - Fine collection report (all fines within a date range, paid vs outstanding)
 *
 * These pull live data from the database via DBConfig, so they're always
 * current as of when the report is generated.
 */
public class ReportGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIMESTAMP_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // ---------- Data holders ----------

    public static class OverdueRow {
        String bookTitle, borrowerUsername, borrowerEmail;
        LocalDate dueDate;
        long daysOverdue;
        double fineAmount;
    }

    public static class FineRow {
        String bookTitle, borrowerUsername;
        LocalDate dueDate;
        LocalDateTime returnDate; // null if not yet returned
        double fineAmount;
        String status; // BORROWED, OVERDUE, RETURNED
    }

    // ---------- Data fetching ----------

    private static List<OverdueRow> fetchOverdueRows() throws SQLException {
        String query = "SELECT b.title AS book_title, u.username, u.email, br.due_date, br.fine_amount " +
                "FROM borrowings br " +
                "JOIN books b ON br.book_id = b.id " +
                "JOIN users u ON br.user_id = u.id " +
                "WHERE br.status IN ('BORROWED', 'OVERDUE') AND br.due_date < NOW() " +
                "ORDER BY br.due_date ASC";

        List<OverdueRow> rows = new ArrayList<>();
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            LocalDate today = LocalDate.now();
            while (rs.next()) {
                OverdueRow row = new OverdueRow();
                row.bookTitle = rs.getString("book_title");
                row.borrowerUsername = rs.getString("username");
                row.borrowerEmail = rs.getString("email");
                row.dueDate = rs.getTimestamp("due_date").toLocalDateTime().toLocalDate();
                row.daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(row.dueDate, today);
                row.fineAmount = rs.getDouble("fine_amount");
                rows.add(row);
            }
        }
        return rows;
    }

    private static List<FineRow> fetchFineRows(LocalDate from, LocalDate to) throws SQLException {
        String query = "SELECT b.title AS book_title, u.username, br.due_date, br.return_date, " +
                "br.fine_amount, br.status " +
                "FROM borrowings br " +
                "JOIN books b ON br.book_id = b.id " +
                "JOIN users u ON br.user_id = u.id " +
                "WHERE br.fine_amount > 0 AND br.due_date BETWEEN ? AND ? " +
                "ORDER BY br.due_date ASC";

        List<FineRow> rows = new ArrayList<>();
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setDate(1, java.sql.Date.valueOf(from));
            ps.setDate(2, java.sql.Date.valueOf(to));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    FineRow row = new FineRow();
                    row.bookTitle = rs.getString("book_title");
                    row.borrowerUsername = rs.getString("username");
                    row.dueDate = rs.getTimestamp("due_date").toLocalDateTime().toLocalDate();
                    java.sql.Timestamp returnTs = rs.getTimestamp("return_date");
                    row.returnDate = returnTs != null ? returnTs.toLocalDateTime() : null;
                    row.fineAmount = rs.getDouble("fine_amount");
                    row.status = rs.getString("status");
                    rows.add(row);
                }
            }
        }
        return rows;
    }

    // ---------- CSV export ----------

    /** Escapes a CSV field per RFC 4180: wraps in quotes and doubles any embedded quotes if needed. */
    private static String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public static void exportOverdueReportCSV(String filePath) throws SQLException, IOException {
        List<OverdueRow> rows = fetchOverdueRows();
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath))) {
            writer.println("Book Title,Borrower,Email,Due Date,Days Overdue,Current Fine");
            for (OverdueRow r : rows) {
                writer.printf("%s,%s,%s,%s,%d,%.2f%n",
                        csvEscape(r.bookTitle), csvEscape(r.borrowerUsername), csvEscape(r.borrowerEmail),
                        r.dueDate.format(DATE_FMT), r.daysOverdue, r.fineAmount);
            }
        }
    }

    public static void exportFineCollectionReportCSV(String filePath, LocalDate from, LocalDate to) throws SQLException, IOException {
        List<FineRow> rows = fetchFineRows(from, to);
        double total = 0;
        try (PrintWriter writer = new PrintWriter(new FileWriter(filePath))) {
            writer.println("Book Title,Borrower,Due Date,Return Date,Fine Amount,Status");
            for (FineRow r : rows) {
                String returnStr = r.returnDate != null ? r.returnDate.format(TIMESTAMP_FMT) : "Not returned";
                writer.printf("%s,%s,%s,%s,%.2f,%s%n",
                        csvEscape(r.bookTitle), csvEscape(r.borrowerUsername),
                        r.dueDate.format(DATE_FMT), csvEscape(returnStr), r.fineAmount, r.status);
                total += r.fineAmount;
            }
            writer.printf("%n,,,,Total:,%.2f%n", total);
        }
    }

    // ---------- PDF export ----------

    private static final float PAGE_MARGIN = 50f;
    private static final float LINE_HEIGHT = 16f;

    public static void exportOverdueReportPDF(String filePath) throws SQLException, IOException {
        List<OverdueRow> rows = fetchOverdueRows();
        String[] headers = { "Book Title", "Borrower", "Due Date", "Days Overdue", "Fine" };
        List<String[]> lines = new ArrayList<>();
        for (OverdueRow r : rows) {
            lines.add(new String[] {
                    r.bookTitle, r.borrowerUsername, r.dueDate.format(DATE_FMT),
                    String.valueOf(r.daysOverdue), String.format("$%.2f", r.fineAmount)
            });
        }
        writePdfReport(filePath, "utilISE - Overdue Books Report", headers, lines, null);
    }

    public static void exportFineCollectionReportPDF(String filePath, LocalDate from, LocalDate to) throws SQLException, IOException {
        List<FineRow> rows = fetchFineRows(from, to);
        String[] headers = { "Book Title", "Borrower", "Due Date", "Fine", "Status" };
        List<String[]> lines = new ArrayList<>();
        double total = 0;
        for (FineRow r : rows) {
            lines.add(new String[] {
                    r.bookTitle, r.borrowerUsername, r.dueDate.format(DATE_FMT),
                    String.format("$%.2f", r.fineAmount), r.status
            });
            total += r.fineAmount;
        }
        String subtitle = "Period: " + from.format(DATE_FMT) + " to " + to.format(DATE_FMT)
                + "   |   Total: $" + String.format("%.2f", total);
        writePdfReport(filePath, "utilISE - Fine Collection Report", headers, lines, subtitle);
    }

    /**
     * Minimal but real multi-page PDF table writer using PDFBox directly
     * (no external table library needed for a report this simple).
     */
    private static void writePdfReport(String filePath, String title, String[] headers,
                                        List<String[]> rows, String subtitle) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDPageContentStream cs = new PDPageContentStream(document, page);

            float pageHeight = PDRectangle.A4.getHeight();
            float pageWidth = PDRectangle.A4.getWidth();
            float y = pageHeight - PAGE_MARGIN;
            float[] colWidths = computeColumnWidths(pageWidth - 2 * PAGE_MARGIN, headers.length);

            PDFont titleFont = PDType1Font.HELVETICA_BOLD;
            PDFont headerFont = PDType1Font.HELVETICA_BOLD;
            PDFont bodyFont = PDType1Font.HELVETICA;

            cs.beginText();
            cs.setFont(titleFont, 16);
            cs.newLineAtOffset(PAGE_MARGIN, y);
            cs.showText(title);
            cs.endText();
            y -= LINE_HEIGHT;

            cs.beginText();
            cs.setFont(bodyFont, 9);
            cs.newLineAtOffset(PAGE_MARGIN, y);
            cs.showText("Generated: " + LocalDateTime.now().format(TIMESTAMP_FMT)
                    + (subtitle != null ? "   |   " + subtitle : ""));
            cs.endText();
            y -= LINE_HEIGHT * 1.5f;

            y = drawRow(cs, headers, colWidths, y, headerFont, 10);
            y -= 4;

            for (String[] rowValues : rows) {
                if (y < PAGE_MARGIN + LINE_HEIGHT) {
                    cs.close();
                    PDPage newPage = new PDPage(PDRectangle.A4);
                    document.addPage(newPage);
                    cs = new PDPageContentStream(document, newPage);
                    y = pageHeight - PAGE_MARGIN;
                    y = drawRow(cs, headers, colWidths, y, headerFont, 10);
                    y -= 4;
                }
                y = drawRow(cs, rowValues, colWidths, y, bodyFont, 9);
            }

            if (rows.isEmpty()) {
                cs.beginText();
                cs.setFont(bodyFont, 10);
                cs.newLineAtOffset(PAGE_MARGIN, y);
                cs.showText("No records found for this report.");
                cs.endText();
            }

            cs.close();
            document.save(filePath);
        }
    }

    private static float[] computeColumnWidths(float totalWidth, int columnCount) {
        float[] widths = new float[columnCount];
        float each = totalWidth / columnCount;
        for (int i = 0; i < columnCount; i++) widths[i] = each;
        return widths;
    }

    /** Draws one row of cells left-aligned at fixed column offsets, returns the y position for the next row. */
    private static float drawRow(PDPageContentStream cs, String[] values, float[] colWidths,
                                  float y, PDFont font, float fontSize) throws IOException {
        float x = PAGE_MARGIN;
        for (int i = 0; i < values.length; i++) {
            String text = values[i] == null ? "" : values[i];
            // Truncate long cell text so it doesn't overrun into the next column
            int maxChars = Math.max(4, (int) (colWidths[i] / (fontSize * 0.55f)));
            if (text.length() > maxChars) {
                text = text.substring(0, maxChars - 1) + "…";
            }
            cs.beginText();
            cs.setFont(font, fontSize);
            cs.newLineAtOffset(x, y);
            cs.showText(text);
            cs.endText();
            x += colWidths[i];
        }
        return y - LINE_HEIGHT;
    }
}
