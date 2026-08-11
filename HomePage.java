import java.awt.*;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import javax.swing.*;
import javax.swing.table.AbstractTableModel;

public class HomePage extends JFrame {
    private SemesterWindow currentSemesterWindow = null; // Track open semester window
    private static LibraryAutomationService automationService;
    private final AuthenticatedUser currentUser;

    private JPanel cardPanel;
    private CardLayout cardLayout;

    // Modern Color Palette
    private final Color BG_COLOR = new Color(248, 249, 250);
    private final Color SIDEBAR_COLOR = new Color(255, 255, 255);
    private final Color PRIMARY_COLOR = new Color(13, 110, 253);
    private final Color TEXT_COLOR = new Color(33, 37, 41);
    private final Color HOVER_COLOR = new Color(233, 236, 239);

    public HomePage(AuthenticatedUser user) {
        this.currentUser = user;
        setTitle("utilISE - Enterprise Library System (" + user.username + " - " + user.role + ")");
        setExtendedState(JFrame.MAXIMIZED_BOTH);
        setLayout(new BorderLayout());
        getContentPane().setBackground(BG_COLOR);

        // Sidebar
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBackground(SIDEBAR_COLOR);
        sidebar.setPreferredSize(new Dimension(260, getHeight()));
        sidebar.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, new Color(222, 226, 230)));

        JLabel logoLabel = new JLabel("utilISE", JLabel.CENTER);
        logoLabel.setFont(new Font("Segoe UI", Font.BOLD, 28));
        logoLabel.setForeground(PRIMARY_COLOR);
        logoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        logoLabel.setBorder(BorderFactory.createEmptyBorder(30, 0, 40, 0));
        sidebar.add(logoLabel);

        cardLayout = new CardLayout();
        cardPanel = new JPanel(cardLayout);
        cardPanel.setBackground(BG_COLOR);

        // Create Cards - only build the ones this role is allowed to see
        cardPanel.add(createLibraryCard(), "Library");
        if (currentUser.isLibrarianOrAbove()) {
            cardPanel.add(createManagementCard(), "Management");
        }
        if (currentUser.isAdmin()) {
            cardPanel.add(createAdminCard(), "Admin");
        }

        // Sidebar Navigation
        addNavCategory(sidebar, "MAIN");
        addSidebarButton(sidebar, "📚 Browse Library", "Library");

        if (currentUser.isLibrarianOrAbove()) {
            sidebar.add(Box.createRigidArea(new Dimension(0, 20)));
            addNavCategory(sidebar, "OPERATIONS");
            addSidebarButton(sidebar, "⚙️ Book Management", "Management");
        }

        if (currentUser.isAdmin()) {
            sidebar.add(Box.createRigidArea(new Dimension(0, 20)));
            addNavCategory(sidebar, "ENTERPRISE");
            addSidebarButton(sidebar, "📊 Admin & Analytics", "Admin");
        }

        add(sidebar, BorderLayout.WEST);
        add(cardPanel, BorderLayout.CENTER);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    private void addNavCategory(JPanel sidebar, String title) {
        JLabel label = new JLabel(title);
        label.setFont(new Font("Segoe UI", Font.BOLD, 12));
        label.setForeground(new Color(108, 117, 125));
        label.setAlignmentX(Component.CENTER_ALIGNMENT);
        label.setMaximumSize(new Dimension(220, 20));
        sidebar.add(label);
        sidebar.add(Box.createRigidArea(new Dimension(0, 5)));
    }

    private void addSidebarButton(JPanel sidebar, String text, String cardName) {
        JButton btn = new JButton(text);
        btn.setFont(new Font("Segoe UI", Font.PLAIN, 15));
        btn.setForeground(TEXT_COLOR);
        btn.setBackground(SIDEBAR_COLOR);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setHorizontalAlignment(SwingConstants.LEFT);
        btn.setAlignmentX(Component.CENTER_ALIGNMENT);
        btn.setMaximumSize(new Dimension(220, 40));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));

        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                btn.setBackground(HOVER_COLOR);
            }

            public void mouseExited(java.awt.event.MouseEvent evt) {
                btn.setBackground(SIDEBAR_COLOR);
            }
        });

        btn.addActionListener(e -> cardLayout.show(cardPanel, cardName));
        sidebar.add(btn);
        sidebar.add(Box.createRigidArea(new Dimension(0, 5)));
    }

    private JPanel createLibraryCard() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_COLOR);
        panel.setBorder(BorderFactory.createEmptyBorder(40, 50, 40, 50));

        JLabel header = new JLabel("Academic Semesters");
        header.setFont(new Font("Segoe UI", Font.BOLD, 32));
        header.setForeground(TEXT_COLOR);
        panel.add(header, BorderLayout.NORTH);

        JPanel gridPanel = new JPanel(new GridLayout(3, 3, 25, 25));
        gridPanel.setBackground(BG_COLOR);
        gridPanel.setBorder(BorderFactory.createEmptyBorder(30, 0, 0, 0));

        String[] semesters = {
                "First Semester", "Second Semester", "Third Semester", "Fourth Semester",
                "Fifth Semester", "Sixth Semester", "Seventh Semester", "Eighth Semester"
        };

        for (String sem : semesters) {
            JButton semButton = new JButton("<html><center>" + sem + "</center></html>");
            semButton.setFont(new Font("Segoe UI", Font.BOLD, 16));
            semButton.setBackground(Color.WHITE);
            semButton.setForeground(PRIMARY_COLOR);
            semButton.setFocusPainted(false);
            semButton.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(new Color(222, 226, 230), 1),
                    BorderFactory.createEmptyBorder(20, 20, 20, 20)));
            semButton.setCursor(new Cursor(Cursor.HAND_CURSOR));

            semButton.addActionListener(_ -> {
                List<String> semSubjects = getSubjectsFromDatabase(sem);
                java.util.Set<String> uniqueSubjects = new java.util.LinkedHashSet<>();
                for (String s : semSubjects) {
                    if (s != null && !s.trim().isEmpty()) {
                        uniqueSubjects.add(s.trim());
                    }
                }
                String[] subjectsArray = uniqueSubjects.stream().limit(6).toArray(String[]::new);
                if (currentSemesterWindow != null) {
                    currentSemesterWindow.dispose();
                }
                currentSemesterWindow = new SemesterWindow(sem, subjectsArray);
                currentSemesterWindow.setVisible(true);
            });
            gridPanel.add(semButton);
        }

        panel.add(gridPanel, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createManagementCard() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_COLOR);
        panel.setBorder(BorderFactory.createEmptyBorder(40, 50, 40, 50));

        JLabel header = new JLabel("Book Management & Operations");
        header.setFont(new Font("Segoe UI", Font.BOLD, 32));
        header.setForeground(TEXT_COLOR);
        panel.add(header, BorderLayout.NORTH);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 20, 30));
        actionPanel.setBackground(BG_COLOR);

        actionPanel.add(createActionButton("📚 Manage Inventory", "Add, edit, or remove books",
                _ -> new BookManagementDialog(this).setVisible(true)));
        actionPanel.add(createActionButton("📷 QR Scanner", "Scan physical books (Mock)",
                _ -> JOptionPane.showMessageDialog(this, "QR Scanner initialized. Waiting for camera input...",
                        "QR Scanner", JOptionPane.INFORMATION_MESSAGE)));
        actionPanel
                .add(createActionButton("⏳ Reservations", "Manage waitlists", _ -> JOptionPane.showMessageDialog(this,
                        "No pending reservations at this time.", "Reservations", JOptionPane.INFORMATION_MESSAGE)));

        panel.add(actionPanel, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createAdminCard() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_COLOR);
        panel.setBorder(BorderFactory.createEmptyBorder(40, 50, 40, 50));

        JLabel header = new JLabel("Enterprise Administration");
        header.setFont(new Font("Segoe UI", Font.BOLD, 32));
        header.setForeground(TEXT_COLOR);
        panel.add(header, BorderLayout.NORTH);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 20, 30));
        actionPanel.setBackground(BG_COLOR);

        actionPanel.add(createActionButton("📊 Analytics Dashboard", "View library statistics", _ -> {
            AdminAnalyticsDashboard dashboard = new AdminAnalyticsDashboard(HomePage.this);
            dashboard.setVisible(true);
        }));

        actionPanel.add(
                createActionButton("📜 Audit Logs", "System activity tracking", _ -> JOptionPane.showMessageDialog(this,
                        "Audit logs exported to CSV.", "Audit Logs", JOptionPane.INFORMATION_MESSAGE)));
        actionPanel.add(createActionButton("🔐 Role Management", "Configure access control",
                _ -> JOptionPane.showMessageDialog(this, "Role management requires SuperAdmin privileges.",
                        "Access Denied", JOptionPane.WARNING_MESSAGE)));

        panel.add(actionPanel, BorderLayout.CENTER);
        return panel;
    }

    private JButton createActionButton(String title, String subtitle, java.awt.event.ActionListener action) {
        JButton btn = new JButton("<html><div style='text-align:center;'><b><font size='5'>" + title
                + "</font></b><br><br><font color='#6c757d'>" + subtitle + "</font></div></html>");
        btn.setPreferredSize(new Dimension(280, 120));
        btn.setBackground(Color.WHITE);
        btn.setFocusPainted(false);
        btn.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(222, 226, 230), 1),
                BorderFactory.createEmptyBorder(10, 10, 10, 10)));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        btn.addActionListener(action);
        return btn;
    }

    public static void testDatabaseConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DBConfig.getConnection()) {
                System.out.println("705 Connected to the database!");
                try (Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("SELECT * FROM subjects")) {
                    while (rs.next()) {
                        System.out.println("Subject: " + rs.getString("name") +
                                " | File: " + rs.getString("filepath"));
                    }
                }
                System.out.println("705 Database test completed!");
            }
        } catch (ClassNotFoundException | java.sql.SQLException ex) {
            JOptionPane.showMessageDialog(null, "Database connection failed: " + ex.getMessage(), "Error",
                    JOptionPane.ERROR_MESSAGE);
        }
    }

    public static List<String> getSubjectsFromDatabase(String semesterName) {
        List<String> subjects = new ArrayList<>();
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DBConfig.getConnection()) {
                String query = "SELECT DISTINCT s.name FROM subjects s " +
                        "JOIN semesters sem ON s.semester_id = sem.id " +
                        "WHERE sem.name = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                    pstmt.setString(1, semesterName);
                    try (ResultSet rs = pstmt.executeQuery()) {
                        while (rs.next()) {
                            String name = rs.getString("name");
                            if (name != null && !name.trim().isEmpty()) {
                                subjects.add(name.trim());
                            }
                        }
                    }
                }
                System.out.println("705 Loaded " + subjects.size() + " subjects for " + semesterName);
            }
        } catch (ClassNotFoundException | java.sql.SQLException ex) {
            System.out.println("Database error: " + ex.getMessage() + ". Loading default 4-year curriculum.");

            switch (semesterName) {
                case "First Semester":
                    subjects.addAll(java.util.Arrays.asList("Engineering Mathematics I", "Engineering Physics",
                            "Basic Electrical Engineering", "Engineering Graphics", "Communication Skills"));
                    break;
                case "Second Semester":
                    subjects.addAll(java.util.Arrays.asList("Engineering Mathematics II", "Engineering Chemistry",
                            "Programming in C", "Engineering Mechanics", "Environmental Science"));
                    break;
                case "Third Semester":
                    subjects.addAll(java.util.Arrays.asList("Data Structures", "Digital Logic Design",
                            "Discrete Mathematics", "Object Oriented Programming", "Computer Organization"));
                    break;
                case "Fourth Semester":
                    subjects.addAll(java.util.Arrays.asList("Operating Systems", "Database Management Systems",
                            "Design and Analysis of Algorithms", "Microprocessors", "Software Engineering"));
                    break;
                case "Fifth Semester":
                    subjects.addAll(java.util.Arrays.asList("Computer Networks", "Theory of Computation",
                            "Artificial Intelligence", "Web Technologies", "Compiler Design"));
                    break;
                case "Sixth Semester":
                    subjects.addAll(java.util.Arrays.asList("Machine Learning", "Information Security",
                            "Cloud Computing", "Data Analytics", "Software Testing"));
                    break;
                case "Seventh Semester":
                    subjects.addAll(java.util.Arrays.asList("Deep Learning", "Internet of Things",
                            "Blockchain Technology", "Major Project Phase I", "Elective I"));
                    break;
                case "Eighth Semester":
                    subjects.addAll(java.util.Arrays.asList("Big Data Analytics", "Cyber Security",
                            "Major Project Phase II", "Elective II", "Seminar"));
                    break;
                default:
                    subjects.addAll(java.util.Arrays.asList("Subject 1", "Subject 2", "Subject 3", "Subject 4"));
                    break;
            }
        }
        java.util.Set<String> uniqueSubjects = new java.util.LinkedHashSet<>();
        for (String s : subjects) {
            if (s != null && !s.trim().isEmpty()) {
                uniqueSubjects.add(s.trim());
            }
        }

        List<String> result = new ArrayList<>(uniqueSubjects);
        return result;
    }

    public static String getSubjectFilePath(String subjectName) {
        String filepath = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DBConfig.getConnection()) {
                String query = "SELECT filepath FROM subjects WHERE name = ?";
                try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                    pstmt.setString(1, subjectName);
                    try (ResultSet rs = pstmt.executeQuery()) {
                        if (rs.next()) {
                            filepath = rs.getString("filepath");
                        }
                    }
                }
            }
        } catch (ClassNotFoundException | java.sql.SQLException ex) {
            JOptionPane.showMessageDialog(null, "Database error: " + ex.getMessage(), "Error",
                    JOptionPane.ERROR_MESSAGE);
        }
        return filepath;
    }

    public static void openPDF(String subjectName) {
        String filepath = getSubjectFilePath(subjectName);
        if (filepath != null) {
            try {
                File pdfFile = new File(filepath);
                if (pdfFile.exists()) {
                    Desktop.getDesktop().open(pdfFile);
                    System.out.println("\u02705 Opening PDF: " + filepath);
                } else {
                    JOptionPane.showMessageDialog(null,
                            "PDF file not found: " + filepath,
                            "File Not Found",
                            JOptionPane.ERROR_MESSAGE);
                }
            } catch (java.io.IOException | java.awt.HeadlessException ignored) {
                JOptionPane.showMessageDialog(null,
                        "Error opening PDF.",
                        "Error",
                        JOptionPane.ERROR_MESSAGE);
            }
        } else {
            JOptionPane.showMessageDialog(null,
                    "No PDF path found for subject: " + subjectName,
                    "No File Path",
                    JOptionPane.WARNING_MESSAGE);
        }
    }

    class BookManagementDialog extends JDialog {
        private JTable bookTable;
        private BookTableModel bookTableModel;

        public BookManagementDialog(JFrame parent) {
            super(parent, "Manage Books", true);
            setSize(800, 400);
            setLocationRelativeTo(parent);
            setLayout(new BorderLayout());
            bookTableModel = new BookTableModel();
            bookTable = new JTable(bookTableModel);
            JScrollPane scrollPane = new JScrollPane(bookTable);
            add(scrollPane, BorderLayout.CENTER);
            JPanel buttonPanel = new JPanel();
            JButton addButton = new JButton("Add Book");
            JButton editButton = new JButton("Edit Book");
            JButton deleteButton = new JButton("Delete Book");
            buttonPanel.add(addButton);
            buttonPanel.add(editButton);
            buttonPanel.add(deleteButton);
            add(buttonPanel, BorderLayout.SOUTH);
            addButton.addActionListener(_ -> {
                BookEditDialog dialog = new BookEditDialog(this, null);
                dialog.setVisible(true);
                bookTableModel.refresh();
            });
            editButton.addActionListener(_ -> {
                int row = bookTable.getSelectedRow();
                if (row >= 0) {
                    Book book = bookTableModel.getBookAt(row);
                    BookEditDialog dialog = new BookEditDialog(this, book);
                    dialog.setVisible(true);
                    bookTableModel.refresh();
                } else {
                    JOptionPane.showMessageDialog(this, "Select a book to edit.");
                }
            });
            deleteButton.addActionListener(_ -> {
                int row = bookTable.getSelectedRow();
                if (row >= 0) {
                    Book book = bookTableModel.getBookAt(row);
                    int confirm = JOptionPane.showConfirmDialog(this, "Delete book '" + book.title + "'?", "Confirm",
                            JOptionPane.YES_NO_OPTION);
                    if (confirm == JOptionPane.YES_OPTION) {
                        DatabaseManager.deleteBook(book.id);
                        bookTableModel.refresh();
                    }
                } else {
                    JOptionPane.showMessageDialog(this, "Select a book to delete.");
                }
            });
        }

        class BookEditDialog extends JDialog {
            public BookEditDialog(JDialog parent, Book book) {
                super(parent, (book == null ? "Add Book" : "Edit Book"), true);
                setSize(350, 300);
                setLocationRelativeTo(parent);
                JPanel panel = new JPanel();
                panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
                panel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));

                JTextField titleField = new JTextField(book != null ? book.title : "");
                JTextField subjectField = new JTextField(book != null ? book.subjectName : "");
                JTextField filepathField = new JTextField(book != null ? book.filepath : "");

                panel.add(labelAndField("Title:", titleField));
                panel.add(Box.createRigidArea(new Dimension(0, 10)));
                panel.add(labelAndField("Subject:", subjectField));
                panel.add(Box.createRigidArea(new Dimension(0, 10)));
                panel.add(labelAndField("File Path:", filepathField));
                panel.add(Box.createRigidArea(new Dimension(0, 18)));

                JButton saveButton = new JButton("Save");
                saveButton.setAlignmentX(Component.CENTER_ALIGNMENT);
                saveButton.addActionListener(_ -> {
                    String title = titleField.getText().trim();
                    String subject = subjectField.getText().trim();
                    String filepath = filepathField.getText().trim();
                    if (title.isEmpty() || subject.isEmpty() || filepath.isEmpty()) {
                        JOptionPane.showMessageDialog(this, "Title, Subject, and File Path are required.",
                                "Validation Error", JOptionPane.WARNING_MESSAGE);
                        return;
                    }
                    Book b = (book == null) ? new Book() : book;
                    b.title = title;
                    b.subjectName = subject;
                    b.filepath = filepath;
                    b.author = (book != null && book.author != null && !book.author.isEmpty()) ? book.author
                            : "Unknown";
                    b.filesize = (book != null) ? book.filesize : 0;
                    b.uploadedBy = (book != null && book.uploadedBy != null && !book.uploadedBy.isEmpty())
                            ? book.uploadedBy
                            : "";
                    boolean ok = (book == null) ? DatabaseManager.addBook(b) : DatabaseManager.updateBook(b);
                    if (ok)
                        dispose();
                    else
                        JOptionPane.showMessageDialog(this,
                                "Failed to save book. Please check your data and try again.");
                });
                panel.add(saveButton);
                add(panel);
            }

            private JPanel labelAndField(String label, JTextField field) {
                JPanel p = new JPanel(new BorderLayout(8, 0));
                JLabel l = new JLabel(label);
                l.setPreferredSize(new Dimension(100, 28));
                p.add(l, BorderLayout.WEST);
                p.add(field, BorderLayout.CENTER);
                p.setMaximumSize(new Dimension(250, 32));
                p.setOpaque(false);
                return p;
            }
        }
    }

    class BookTableModel extends AbstractTableModel {
        private final String[] columns = { "ID", "Title", "Author", "Subject", "File Path", "File Size",
                "Uploaded By" };
        private java.util.List<Book> books;

        public BookTableModel() {
            books = DatabaseManager.getAllBooks();
        }

        public void refresh() {
            books = DatabaseManager.getAllBooks();
            fireTableDataChanged();
        }

        @Override
        public int getRowCount() {
            return books.size();
        }

        @Override
        public int getColumnCount() {
            return columns.length;
        }

        @Override
        public String getColumnName(int col) {
            return columns[col];
        }

        @Override
        public Object getValueAt(int row, int col) {
            Book b = books.get(row);
            switch (col) {
                case 0:
                    return b.id;
                case 1:
                    return b.title;
                case 2:
                    return b.author;
                case 3:
                    return b.subjectName; // Use correct field
                case 4:
                    return b.filepath;
                default:
                    return null;
            }
        }

        Book getBookAt(int row) {
            return books.get(row);
        }
    }

    public static class Book {
        int id;
        String title;
        String author;
        String subjectName;
        String filepath;
        long filesize;
        String uploadedBy;

        public String getFileSizeFormatted() {
            if (filesize < 1024)
                return filesize + " B";
            if (filesize < 1024 * 1024)
                return String.format("%.1f KB", filesize / 1024.0);
            return String.format("%.1f MB", filesize / (1024.0 * 1024.0));
        }
    }

    public static class DatabaseManager {
        public static List<Book> getAllBooks() {
            List<Book> books = new ArrayList<>();
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                try (Connection conn = DBConfig.getConnection()) {
                    String query = "SELECT * FROM books";
                    try (Statement stmt = conn.createStatement();
                            ResultSet rs = stmt.executeQuery(query)) {
                        // Fix: Book instantiation in getAllBooks should use 'new Book()', not 'new
                        // HomePage.Book()'
                        while (rs.next()) {
                            Book book = new Book();
                            book.id = rs.getInt("id");
                            book.title = rs.getString("title");
                            book.author = rs.getString("author");
                            book.subjectName = rs.getString("subject");
                            book.filepath = rs.getString("filepath");
                            book.filesize = rs.getLong("filesize");
                            book.uploadedBy = rs.getString("uploaded_by");
                            books.add(book);
                        }
                    }
                }
            } catch (ClassNotFoundException | SQLException e) {
                // Exception intentionally ignored
            }
            return books;
        }

        public static boolean addBook(Book book) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                try (Connection conn = DBConfig.getConnection()) {
                    String query = "INSERT INTO books (title, author, subject, filepath, filesize, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                        pstmt.setString(1, book.title);
                        pstmt.setString(2, book.author);
                        pstmt.setString(3, book.subjectName);
                        pstmt.setString(4, book.filepath);
                        pstmt.setLong(5, book.filesize);
                        pstmt.setString(6, book.uploadedBy);
                        return pstmt.executeUpdate() > 0;
                    }
                }
            } catch (ClassNotFoundException | SQLException e) {

            }
            return false;
        }

        public static boolean updateBook(Book book) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                try (Connection conn = DBConfig.getConnection()) {
                    String query = "UPDATE books SET title = ?, author = ?, subject = ?, filepath = ?, filesize = ?, uploaded_by = ? WHERE id = ?";
                    try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                        pstmt.setString(1, book.title);
                        pstmt.setString(2, book.author);
                        pstmt.setString(3, book.subjectName);
                        pstmt.setString(4, book.filepath);
                        pstmt.setLong(5, book.filesize);
                        pstmt.setString(6, book.uploadedBy);
                        pstmt.setInt(7, book.id);
                        return pstmt.executeUpdate() > 0;
                    }
                }
            } catch (ClassNotFoundException | SQLException e) {

            }
            return false;
        }

        public static boolean deleteBook(int bookId) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                try (Connection conn = DBConfig.getConnection()) {
                    String query = "DELETE FROM books WHERE id = ?";
                    try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                        pstmt.setInt(1, bookId);
                        return pstmt.executeUpdate() > 0;
                    }
                }
            } catch (ClassNotFoundException | SQLException e) {
            }
            return false;
        }
    }

    public static void main(String[] args) {
        // Start the automation service
        automationService = new LibraryAutomationService();
        automationService.startAutomation();

        // Add shutdown hook to stop the service gracefully
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (automationService != null) {
                automationService.stopAutomation();
            }
        }));

        SwingUtilities.invokeLater(() -> {
            LoginDialog loginDialog = new LoginDialog(null);
            loginDialog.setVisible(true);
            AuthenticatedUser user = loginDialog.getAuthenticatedUser();
            if (user == null) {
                System.exit(0);
            }
            new HomePage(user);
        });
    }
}