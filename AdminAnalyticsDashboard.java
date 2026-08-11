import javax.swing.*;
import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDate;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartPanel;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;

public class AdminAnalyticsDashboard extends JDialog {
    private JLabel totalBooksLabel;
    private JLabel totalUsersLabel;
    private JLabel activeBorrowingsLabel;
    private JLabel totalFinesLabel;
    private JPanel chartsPanel;

    public AdminAnalyticsDashboard(JFrame parent) {
        super(parent, "Admin Analytics Dashboard", true);
        setSize(900, 700);
        setLocationRelativeTo(parent);
        setLayout(new BorderLayout());

        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(new Color(41, 128, 185));
        JLabel headerLabel = new JLabel("Library Analytics Dashboard", JLabel.CENTER);
        headerLabel.setForeground(Color.WHITE);
        headerLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        headerPanel.add(headerLabel);
        add(headerPanel, BorderLayout.NORTH);

        JPanel centerPanel = new JPanel(new BorderLayout());

        JPanel statsPanel = new JPanel(new GridLayout(1, 4, 15, 15));
        statsPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 10, 20));

        totalBooksLabel = createStatCard(statsPanel, "Total Books", "Loading...");
        totalUsersLabel = createStatCard(statsPanel, "Total Users", "Loading...");
        activeBorrowingsLabel = createStatCard(statsPanel, "Active Borrowings", "Loading...");
        totalFinesLabel = createStatCard(statsPanel, "Total Fines Collected", "Loading...");

        centerPanel.add(statsPanel, BorderLayout.NORTH);

        chartsPanel = new JPanel(new GridLayout(1, 2, 15, 15));
        chartsPanel.setBorder(BorderFactory.createEmptyBorder(10, 20, 20, 20));
        centerPanel.add(chartsPanel, BorderLayout.CENTER);

        add(centerPanel, BorderLayout.CENTER);

        JPanel footerPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        JButton refreshButton = new JButton("Refresh Data");
        refreshButton.addActionListener(e -> loadData());
        footerPanel.add(refreshButton);

        JButton overdueCsvBtn = new JButton("Export Overdue (CSV)");
        overdueCsvBtn.addActionListener(e -> exportOverdueReport(true));
        footerPanel.add(overdueCsvBtn);

        JButton overduePdfBtn = new JButton("Export Overdue (PDF)");
        overduePdfBtn.addActionListener(e -> exportOverdueReport(false));
        footerPanel.add(overduePdfBtn);

        JButton fineCsvBtn = new JButton("Export Fine Report (CSV)");
        fineCsvBtn.addActionListener(e -> exportFineReport(true));
        footerPanel.add(fineCsvBtn);

        JButton finePdfBtn = new JButton("Export Fine Report (PDF)");
        finePdfBtn.addActionListener(e -> exportFineReport(false));
        footerPanel.add(finePdfBtn);

        add(footerPanel, BorderLayout.SOUTH);

        loadData();
    }

    /** Prompts for a save location, then writes the overdue report as CSV or PDF. */
    private void exportOverdueReport(boolean asCsv) {
        String defaultName = asCsv ? "overdue_report.csv" : "overdue_report.pdf";
        File target = promptSaveFile(defaultName);
        if (target == null) return;

        try {
            if (asCsv) {
                ReportGenerator.exportOverdueReportCSV(target.getAbsolutePath());
            } else {
                ReportGenerator.exportOverdueReportPDF(target.getAbsolutePath());
            }
            JOptionPane.showMessageDialog(this, "Report saved to:\n" + target.getAbsolutePath(),
                    "Export Complete", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | IOException e) {
            JOptionPane.showMessageDialog(this, "Failed to generate report: " + e.getMessage(),
                    "Export Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    /** Prompts for a date range and save location, then writes the fine collection report. */
    private void exportFineReport(boolean asCsv) {
        JTextField fromField = new JTextField(LocalDate.now().minusMonths(1).toString());
        JTextField toField = new JTextField(LocalDate.now().toString());
        JPanel panel = new JPanel(new GridLayout(2, 2, 5, 5));
        panel.add(new JLabel("From (yyyy-MM-dd):"));
        panel.add(fromField);
        panel.add(new JLabel("To (yyyy-MM-dd):"));
        panel.add(toField);

        int result = JOptionPane.showConfirmDialog(this, panel, "Fine Report Date Range",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (result != JOptionPane.OK_OPTION) return;

        LocalDate from, to;
        try {
            from = LocalDate.parse(fromField.getText().trim());
            to = LocalDate.parse(toField.getText().trim());
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Invalid date format. Use yyyy-MM-dd.",
                    "Invalid Input", JOptionPane.ERROR_MESSAGE);
            return;
        }

        String defaultName = asCsv ? "fine_report.csv" : "fine_report.pdf";
        File target = promptSaveFile(defaultName);
        if (target == null) return;

        try {
            if (asCsv) {
                ReportGenerator.exportFineCollectionReportCSV(target.getAbsolutePath(), from, to);
            } else {
                ReportGenerator.exportFineCollectionReportPDF(target.getAbsolutePath(), from, to);
            }
            JOptionPane.showMessageDialog(this, "Report saved to:\n" + target.getAbsolutePath(),
                    "Export Complete", JOptionPane.INFORMATION_MESSAGE);
        } catch (SQLException | IOException e) {
            JOptionPane.showMessageDialog(this, "Failed to generate report: " + e.getMessage(),
                    "Export Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private File promptSaveFile(String defaultName) {
        JFileChooser chooser = new JFileChooser();
        chooser.setSelectedFile(new File(defaultName));
        int result = chooser.showSaveDialog(this);
        if (result != JFileChooser.APPROVE_OPTION) return null;
        return chooser.getSelectedFile();
    }

    private JLabel createStatCard(JPanel parent, String title, String initialValue) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createLineBorder(new Color(189, 195, 199), 1));

        JLabel titleLabel = new JLabel(title, JLabel.CENTER);
        titleLabel.setFont(new Font("SansSerif", Font.PLAIN, 16));
        titleLabel.setForeground(new Color(127, 140, 141));

        JLabel valueLabel = new JLabel(initialValue, JLabel.CENTER);
        valueLabel.setFont(new Font("SansSerif", Font.BOLD, 28));
        valueLabel.setForeground(new Color(44, 62, 80));

        card.add(titleLabel, BorderLayout.NORTH);
        card.add(valueLabel, BorderLayout.CENTER);

        parent.add(card);
        return valueLabel;
    }

    private void loadData() {
        try (Connection conn = DBConfig.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery("SELECT * FROM library_stats")) {

            if (rs.next()) {
                totalBooksLabel.setText(String.valueOf(rs.getInt("total_books")));
                totalUsersLabel.setText(String.valueOf(rs.getInt("total_users")));
                activeBorrowingsLabel.setText(String.valueOf(rs.getInt("active_borrowings")));
                totalFinesLabel.setText("$" + String.format("%.2f", rs.getDouble("total_fines_collected")));
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error loading analytics data: " + e.getMessage(), "Database Error",
                    JOptionPane.ERROR_MESSAGE);
        }

        loadCharts();
    }

    private void loadCharts() {
        chartsPanel.removeAll();
        chartsPanel.add(buildIssuesBySemesterChart());
        chartsPanel.add(buildAvailabilityPieChart());
        chartsPanel.revalidate();
        chartsPanel.repaint();
    }

    /** Bar chart: number of currently borrowed books per semester. */
    private JPanel buildIssuesBySemesterChart() {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        String query = "SELECT s.name AS semester_name, COUNT(br.id) AS issue_count " +
                "FROM semesters s " +
                "JOIN subjects sub ON sub.semester_id = s.id " +
                "JOIN books b ON b.subject_id = sub.id " +
                "JOIN borrowings br ON br.book_id = b.id AND br.status IN ('BORROWED', 'OVERDUE') " +
                "GROUP BY s.name ORDER BY s.name";

        boolean hasData = false;
        try (Connection conn = DBConfig.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                dataset.addValue(rs.getInt("issue_count"), "Books Issued", rs.getString("semester_name"));
                hasData = true;
            }
        } catch (SQLException e) {
            return emptyChartPanel("Issues by Semester", "Data unavailable: " + e.getMessage());
        }

        if (!hasData) {
            return emptyChartPanel("Issues by Semester", "No active borrowings yet.");
        }

        JFreeChart chart = ChartFactory.createBarChart(
                "Books Issued by Semester", "Semester", "Books Issued",
                dataset, PlotOrientation.VERTICAL, false, true, false);
        return new ChartPanel(chart);
    }

    /** Pie chart: available vs. issued copies across the whole catalog. */
    private JPanel buildAvailabilityPieChart() {
        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        String query = "SELECT COALESCE(SUM(available_copies), 0) AS available, " +
                "COALESCE(SUM(total_copies - available_copies), 0) AS issued FROM books";

        int available = 0, issued = 0;
        try (Connection conn = DBConfig.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {
            if (rs.next()) {
                available = rs.getInt("available");
                issued = rs.getInt("issued");
            }
        } catch (SQLException e) {
            return emptyChartPanel("Copy Availability", "Data unavailable: " + e.getMessage());
        }

        if (available == 0 && issued == 0) {
            return emptyChartPanel("Copy Availability", "No copies recorded yet.");
        }

        dataset.setValue("Available", available);
        dataset.setValue("Issued", issued);

        JFreeChart chart = ChartFactory.createPieChart("Copy Availability", dataset, true, true, false);
        return new ChartPanel(chart);
    }

    private JPanel emptyChartPanel(String title, String message) {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(BorderFactory.createTitledBorder(title));
        JLabel label = new JLabel(message, JLabel.CENTER);
        label.setForeground(new Color(127, 140, 141));
        panel.add(label, BorderLayout.CENTER);
        return panel;
    }
}
