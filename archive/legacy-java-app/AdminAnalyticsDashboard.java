import javax.swing.*;
import java.awt.*;
import java.sql.*;

public class AdminAnalyticsDashboard extends JDialog {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "Cupcakemahi";

    private JLabel totalBooksLabel;
    private JLabel totalUsersLabel;
    private JLabel activeBorrowingsLabel;
    private JLabel totalFinesLabel;

    public AdminAnalyticsDashboard(JFrame parent) {
        super(parent, "Admin Analytics Dashboard", true);
        setSize(600, 400);
        setLocationRelativeTo(parent);
        setLayout(new BorderLayout());

        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(new Color(41, 128, 185));
        JLabel headerLabel = new JLabel("Library Analytics Dashboard", JLabel.CENTER);
        headerLabel.setForeground(Color.WHITE);
        headerLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        headerPanel.add(headerLabel);
        add(headerPanel, BorderLayout.NORTH);

        JPanel statsPanel = new JPanel(new GridLayout(2, 2, 20, 20));
        statsPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        totalBooksLabel = createStatCard(statsPanel, "Total Books", "Loading...");
        totalUsersLabel = createStatCard(statsPanel, "Total Users", "Loading...");
        activeBorrowingsLabel = createStatCard(statsPanel, "Active Borrowings", "Loading...");
        totalFinesLabel = createStatCard(statsPanel, "Total Fines Collected", "Loading...");

        add(statsPanel, BorderLayout.CENTER);

        JPanel footerPanel = new JPanel();
        JButton refreshButton = new JButton("Refresh Data");
        refreshButton.addActionListener(e -> loadData());
        footerPanel.add(refreshButton);
        add(footerPanel, BorderLayout.SOUTH);

        loadData();
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
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
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
    }
}
