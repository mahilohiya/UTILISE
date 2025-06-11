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
    public HomePage() {
        setTitle("utilISE - Engineering Book Management System");
        setExtendedState(JFrame.MAXIMIZED_BOTH);
        setLayout(new BorderLayout());

        JPanel navBar = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        navBar.setBackground(new Color(247, 220, 111));
        navBar.setPreferredSize(new Dimension(getWidth(), 50));

        String[] navItems = {"links", "Developer"};
        for (String item : navItems) {
            JButton navButton = new JButton(item);
            navButton.setForeground(Color.WHITE);
            navButton.setBackground(new Color(236, 112, 99));
            navButton.setBorderPainted(false);
            navButton.setFont(new Font("SansSerif", Font.PLAIN, 14));
            navButton.addActionListener(_ -> {
                System.out.println("Clicked: " + item);
            });
            navBar.add(navButton);
        }

        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(new Color(247, 220, 111));
        headerPanel.setPreferredSize(new Dimension(getWidth(), 60));

        JLabel headerLabel = new JLabel("Engineering Book Management System", JLabel.CENTER);
        headerLabel.setForeground(Color.BLACK);
        headerLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        headerPanel.add(headerLabel);

        
        JPanel contentPanel = new JPanel(new BorderLayout());
        contentPanel.setBackground(new Color(8, 143, 143));

        JLabel title = new JLabel("UTILISE", JLabel.CENTER);
        title.setFont(new Font("SansSerif", Font.BOLD, 50));
        title.setForeground(Color.WHITE);
        title.setBorder(BorderFactory.createEmptyBorder(20, 0, 20, 0));
        contentPanel.add(title, BorderLayout.NORTH);

        JLabel aboutLabel = new JLabel("<html><div style='text-align:center; padding:20px;'>"
                + "<h2>About utilISE</h2>"
                + "<p style='margin:10px 100px;'>Your digital companion as a semester-wise book management system built for engineering students.</p>"
                + "<p><b>Features:</b><br>"
                + "• Access semester-wise subject PDFs<br>"
                + "• Organized layout for better navigation<br>"
                + "• Lightweight and user-friendly interface</p>"
                + "<p>Contribute or report issues by contacting the developer.</p>"
                + "</div></html>");
        aboutLabel.setHorizontalAlignment(JLabel.CENTER);
        contentPanel.add(aboutLabel, BorderLayout.CENTER);

    
        JPanel managePanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        managePanel.setOpaque(false);
        JButton manageBooksButton = new JButton("Manage Books");
        manageBooksButton.setFont(new Font("SansSerif", Font.BOLD, 16));
        manageBooksButton.setPreferredSize(new Dimension(200, 40));
        manageBooksButton.setBackground(new Color(8, 143, 143));
        manageBooksButton.setForeground(Color.WHITE);
        manageBooksButton.setBorderPainted(false);
        manageBooksButton.addActionListener(_ -> new BookManagementDialog(this).setVisible(true));
        managePanel.add(manageBooksButton);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        buttonPanel.setOpaque(false);
        JButton thirdSemButton = new JButton("Third Semester");
        thirdSemButton.setFont(new Font("SansSerif", Font.BOLD, 16));
        thirdSemButton.setPreferredSize(new Dimension(200, 60));
        thirdSemButton.setBackground(Color.WHITE);
        thirdSemButton.setForeground(Color.BLACK);
        JButton fourthSemButton = new JButton("Fourth Semester");
        fourthSemButton.setFont(new Font("SansSerif", Font.BOLD, 16));
        fourthSemButton.setPreferredSize(new Dimension(200, 60));
        fourthSemButton.setBackground(Color.WHITE);
        fourthSemButton.setForeground(Color.BLACK);
        buttonPanel.add(thirdSemButton);
        buttonPanel.add(fourthSemButton);

        
        JPanel southPanel = new JPanel();
        southPanel.setLayout(new BoxLayout(southPanel, BoxLayout.Y_AXIS));
        southPanel.setOpaque(false);
        southPanel.add(managePanel);
        southPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        southPanel.add(buttonPanel);
        contentPanel.add(southPanel, BorderLayout.SOUTH);

        thirdSemButton.addActionListener(_ -> {
            List<String> thirdSemSubjects = getSubjectsFromDatabase("Third Semester");
            java.util.Set<String> uniqueSubjects = new java.util.LinkedHashSet<>(thirdSemSubjects);
            String[] subjectsArray = uniqueSubjects.toArray(new String[uniqueSubjects.size()]);
            if (currentSemesterWindow != null) {
                currentSemesterWindow.dispose();
            }
            currentSemesterWindow = new SemesterWindow("Third Semester", subjectsArray);
            currentSemesterWindow.setVisible(true);
        });

        fourthSemButton.addActionListener(_ -> {
            List<String> fourthSemSubjects = getSubjectsFromDatabase("Fourth Semester");
        
            java.util.Set<String> uniqueSubjects = new java.util.LinkedHashSet<>();
            for (String s : fourthSemSubjects) {
                if (s != null && !s.trim().isEmpty()) {
                    uniqueSubjects.add(s.trim());
                }
            }
            
            String[] subjectsArray = uniqueSubjects.stream().limit(4).toArray(String[]::new);
            if (currentSemesterWindow != null) {
                currentSemesterWindow.dispose();
            }
            currentSemesterWindow = new SemesterWindow("Fourth Semester", subjectsArray);
            currentSemesterWindow.setVisible(true);
        });

        add(navBar, BorderLayout.NORTH);
        add(contentPanel, BorderLayout.CENTER);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setVisible(true);
    }

    public static void testDatabaseConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/utilise",  
                "root",                                 
                "Cupcakemahi")) {
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
            JOptionPane.showMessageDialog(null, "Database connection failed: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static List<String> getSubjectsFromDatabase(String semesterName) {
        List<String> subjects = new ArrayList<>();
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC",
                    "root",
                    "Cupcakemahi")) {
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
            JOptionPane.showMessageDialog(null, "Database error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
            if (semesterName.equals("Third Semester")) {
                subjects.add("C");
                subjects.add("DCO");
                subjects.add("DMS");
                subjects.add("OS");
            } else if (semesterName.equals("Fourth Semester")) {
                subjects.add("Java");
                subjects.add("DBMS");
                subjects.add("DA");
                subjects.add("micro");
            }
        }
        java.util.Set<String> uniqueSubjects = new java.util.LinkedHashSet<>();
        for (String s : subjects) {
            if (s != null && !s.trim().isEmpty()) {
                uniqueSubjects.add(s.trim());
            }
        }
        
        List<String> result = new ArrayList<>(uniqueSubjects);
        if (semesterName.equals("Fourth Semester") && result.size() > 4) {
            return result.subList(0, 4);
        }
        return result;
    }

    public static String getSubjectFilePath(String subjectName) {
        String filepath = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            try (Connection conn = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC",
                    "root",
                    "Cupcakemahi")) {
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
            JOptionPane.showMessageDialog(null, "Database error: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
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
                    int confirm = JOptionPane.showConfirmDialog(this, "Delete book '" + book.title + "'?", "Confirm", JOptionPane.YES_NO_OPTION);
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
                        JOptionPane.showMessageDialog(this, "Title, Subject, and File Path are required.", "Validation Error", JOptionPane.WARNING_MESSAGE);
                        return;
                    }
                    Book b = (book == null) ? new Book() : book;
                    b.title = title;
                    b.subjectName = subject;
                    b.filepath = filepath;
                    b.author = (book != null && book.author != null && !book.author.isEmpty()) ? book.author : "Unknown";
                    b.filesize = (book != null) ? book.filesize : 0;
                    b.uploadedBy = (book != null && book.uploadedBy != null && !book.uploadedBy.isEmpty()) ? book.uploadedBy : "";
                    boolean ok = (book == null) ? DatabaseManager.addBook(b) : DatabaseManager.updateBook(b);
                    if (ok) dispose();
                    else JOptionPane.showMessageDialog(this, "Failed to save book. Please check your data and try again.");
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
        private final String[] columns = {"ID", "Title", "Author", "Subject", "File Path", "File Size", "Uploaded By"};
        private java.util.List<Book> books;
        public BookTableModel() {
            books = DatabaseManager.getAllBooks();
        }
        public void refresh() {
            books = DatabaseManager.getAllBooks();
            fireTableDataChanged();
        }
        @Override
        public int getRowCount() { return books.size(); }
        @Override
        public int getColumnCount() { return columns.length; }
        @Override
        public String getColumnName(int col) { return columns[col]; }
        @Override
        public Object getValueAt(int row, int col) {
            Book b = books.get(row);
            switch (col) {
                case 0: return b.id;
                case 1: return b.title;
                case 2: return b.author;
                case 3: return b.subjectName; // Use correct field
                case 4: return b.filepath;
                default: return null;
            }
        }
        Book getBookAt(int row) { return books.get(row); }
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
            if (filesize < 1024) return filesize + " B";
            if (filesize < 1024 * 1024) return String.format("%.1f KB", filesize / 1024.0);
            return String.format("%.1f MB", filesize / (1024.0 * 1024.0));
        }
    }

    public static class DatabaseManager {
        public static List<Book> getAllBooks() {
            List<Book> books = new ArrayList<>();
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                try (Connection conn = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC",
                        "root",
                        "Cupcakemahi")) {
                    String query = "SELECT * FROM books";
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery(query)) {
                        // Fix: Book instantiation in getAllBooks should use 'new Book()', not 'new HomePage.Book()'
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
                try (Connection conn = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC",
                        "root",
                        "Cupcakemahi")) {
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
                try (Connection conn = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC",
                        "root",
                        "Cupcakemahi")) {
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
                try (Connection conn = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC",
                        "root",
                        "Cupcakemahi")) {
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
        SwingUtilities.invokeLater(() -> new HomePage());
    }
}