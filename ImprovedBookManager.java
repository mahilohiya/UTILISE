import java.awt.*;
import java.io.File;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import javax.swing.*;
import javax.swing.table.AbstractTableModel;

public class ImprovedBookManager extends JFrame {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/utilise?useSSL=false&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "Cupcakemahi";

    public ImprovedBookManager() {
        initializeDatabase();
        setTitle("Book Management System");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(900, 600);
        setLocationRelativeTo(null);
        
        setupUI();
        setVisible(true);
    }
    
    private void setupUI() {
        setLayout(new BorderLayout());
        
       
        JMenuBar menuBar = new JMenuBar();
        JMenu bookMenu = new JMenu("Books");
        JMenuItem manageBooks = new JMenuItem("Manage Books");
        JMenuItem addBook = new JMenuItem("Add New Book");
        
        manageBooks.addActionListener(e -> new BookManagementDialog(this).setVisible(true));
        addBook.addActionListener(e -> new BookEditDialog(this, null).setVisible(true));
        
        bookMenu.add(manageBooks);
        bookMenu.add(addBook);
        menuBar.add(bookMenu);
        setJMenuBar(menuBar);
        
        
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        JLabel titleLabel = new JLabel("Book Management System", JLabel.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 24));
        mainPanel.add(titleLabel, BorderLayout.NORTH);
        
        JPanel buttonPanel = new JPanel(new GridLayout(2, 2, 10, 10));
        buttonPanel.setBorder(BorderFactory.createEmptyBorder(50, 50, 50, 50));
        
        JButton manageBtn = new JButton("Manage Books");
        JButton addBtn = new JButton("Add New Book");
        JButton searchBtn = new JButton("Search Books");
        JButton openBtn = new JButton("Open Book");
        
        manageBtn.addActionListener(e -> new BookManagementDialog(this).setVisible(true));
        addBtn.addActionListener(e -> new BookEditDialog(this, null).setVisible(true));
        searchBtn.addActionListener(e -> new BookSearchDialog(this).setVisible(true));
        openBtn.addActionListener(e -> new BookOpenDialog(this).setVisible(true));
        
        buttonPanel.add(manageBtn);
        buttonPanel.add(addBtn);
        buttonPanel.add(searchBtn);
        buttonPanel.add(openBtn);
        
        mainPanel.add(buttonPanel, BorderLayout.CENTER);
        add(mainPanel);
    }
    
    private void initializeDatabase() {
        String createBooksTable = """
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) DEFAULT 'Unknown',
                subject VARCHAR(255),
                filepath VARCHAR(500) NOT NULL,
                filesize BIGINT DEFAULT 0,
                uploaded_by VARCHAR(255) DEFAULT 'System',
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )""";
            
        String createSubjectsTable = """
            CREATE TABLE IF NOT EXISTS subjects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                semester_id INT,
                filepath VARCHAR(500)
            )""";
            
        String createSemestersTable = """
            CREATE TABLE IF NOT EXISTS semesters (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE
            )""";
        
        try (Connection conn = getConnection()) {
            try (Statement stmt = conn.createStatement()) {
                stmt.execute(createSemestersTable);
                stmt.execute(createSubjectsTable);
                stmt.execute(createBooksTable);
                
                
                insertDefaultData(conn);
                
                System.out.println("Database initialized successfully");
            }
        } catch (SQLException e) {
            System.err.println("Database initialization error: " + e.getMessage());
            
        }
    }
    
    private void insertDefaultData(Connection conn) throws SQLException {
        
        String insertSemester = "INSERT IGNORE INTO semesters (name) VALUES (?)";
        try (PreparedStatement pstmt = conn.prepareStatement(insertSemester)) {
            pstmt.setString(1, "Third Semester");
            pstmt.executeUpdate();
            pstmt.setString(1, "Fourth Semester");
            pstmt.executeUpdate();
        }
        
        
        String insertSubject = "INSERT IGNORE INTO subjects (name, semester_id) VALUES (?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(insertSubject)) {
            
            int thirdSemId = getSemesterId("Third Semester");
            if (thirdSemId > 0) {
                String[] thirdSemSubjects = {"C", "DCO", "DMS", "OS"};
                for (String subject : thirdSemSubjects) {
                    pstmt.setString(1, subject);
                    pstmt.setInt(2, thirdSemId);
                    pstmt.executeUpdate();
                }
            }
            
            
            int fourthSemId = getSemesterId("Fourth Semester");
            if (fourthSemId > 0) {
                String[] fourthSemSubjects = {"Java", "DBMS", "DA", "micro"};
                
                for (String subject : fourthSemSubjects) {
                    pstmt.setString(1, subject);
                    pstmt.setInt(2, fourthSemId);
                    pstmt.executeUpdate();
                }
            }
        }
    }
    
    private int getSemesterId(String semesterName) {
        String query = "SELECT id FROM semesters WHERE name = ?";
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setString(1, semesterName);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting semester ID: " + e.getMessage());
        }
        return -1;
    }
    
    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL driver not found", e);
        }
    }
    
    
    class BookManagementDialog extends JDialog {
        private JTable bookTable;
        private BookTableModel bookTableModel;
        private JTextField searchField;
        
        public BookManagementDialog(JFrame parent) {
            super(parent, "Manage Books", true);
            setSize(1000, 600);
            setLocationRelativeTo(parent);
            setLayout(new BorderLayout());
            
            
            JPanel searchPanel = new JPanel(new FlowLayout());
            searchField = new JTextField(20);
            JButton searchButton = new JButton("Search");
            JButton refreshButton = new JButton("Refresh");
            
            searchButton.addActionListener(e -> searchBooks());
            refreshButton.addActionListener(e -> bookTableModel.refresh());
            searchField.addActionListener(e -> searchBooks());
            
            searchPanel.add(new JLabel("Search:"));
            searchPanel.add(searchField);
            searchPanel.add(searchButton);
            searchPanel.add(refreshButton);
            add(searchPanel, BorderLayout.NORTH);
            
            
            bookTableModel = new BookTableModel();
            bookTable = new JTable(bookTableModel);
            bookTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
            JScrollPane scrollPane = new JScrollPane(bookTable);
            add(scrollPane, BorderLayout.CENTER);
            
            
            JPanel buttonPanel = new JPanel(new FlowLayout());
            JButton addButton = new JButton("Add Book");
            JButton editButton = new JButton("Edit Book");
            JButton deleteButton = new JButton("Delete Book");
            JButton openButton = new JButton("Open Book");
            
            addButton.addActionListener(e -> {
                BookEditDialog dialog = new BookEditDialog(this, null);
                dialog.setVisible(true);
                bookTableModel.refresh();
            });
            
            editButton.addActionListener(e -> {
                int row = bookTable.getSelectedRow();
                if (row >= 0) {
                    Book book = bookTableModel.getBookAt(row);
                    BookEditDialog dialog = new BookEditDialog(this, book);
                    dialog.setVisible(true);
                    bookTableModel.refresh();
                } else {
                    JOptionPane.showMessageDialog(this, "Please select a book to edit.");
                }
            });
            
            deleteButton.addActionListener(e -> {
                int row = bookTable.getSelectedRow();
                if (row >= 0) {
                    Book book = bookTableModel.getBookAt(row);
                    int confirm = JOptionPane.showConfirmDialog(this, 
                        "Are you sure you want to delete '" + book.title + "'?", 
                        "Confirm Delete", JOptionPane.YES_NO_OPTION);
                    if (confirm == JOptionPane.YES_OPTION) {
                        if (DatabaseManager.deleteBook(book.id)) {
                            bookTableModel.refresh();
                            JOptionPane.showMessageDialog(this, "Book deleted successfully.");
                        } else {
                            JOptionPane.showMessageDialog(this, "Failed to delete book.");
                        }
                    }
                } else {
                    JOptionPane.showMessageDialog(this, "Please select a book to delete.");
                }
            });
            
            openButton.addActionListener(e -> {
                int row = bookTable.getSelectedRow();
                if (row >= 0) {
                    Book book = bookTableModel.getBookAt(row);
                    openPDF(book.filepath);
                } else {
                    JOptionPane.showMessageDialog(this, "Please select a book to open.");
                }
            });
            
            buttonPanel.add(addButton);
            buttonPanel.add(editButton);
            buttonPanel.add(deleteButton);
            buttonPanel.add(openButton);
            add(buttonPanel, BorderLayout.SOUTH);
        }
        
        private void searchBooks() {
            String query = searchField.getText().trim();
            if (query.isEmpty()) {
                bookTableModel.refresh();
            } else {
                bookTableModel.searchBooks(query);
            }
        }
    }
    
   
    class BookEditDialog extends JDialog {
        private JTextField titleField;
        private JTextField authorField;
        private JTextField subjectField;
        private JTextField filepathField;
        private JButton browseButton;
        private final Book book;
        
        public BookEditDialog(Dialog parent, Book book) {
            super(parent, (book == null ? "Add Book" : "Edit Book"), true);
            this.book = book;
            setSize(450, 350);
            setLocationRelativeTo(parent);
            setupUI();
        }
        
        public BookEditDialog(JFrame parent, Book book) {
            super(parent, (book == null ? "Add Book" : "Edit Book"), true);
            this.book = book;
            setSize(450, 350);
            setLocationRelativeTo(parent);
            setupUI();
        }
        
        private void setupUI() {
            JPanel panel = new JPanel();
            panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
            panel.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));
            
            titleField = new JTextField(book != null ? book.title : "");
            authorField = new JTextField(book != null ? book.author : "");
            subjectField = new JTextField(book != null ? book.subject : "");
            filepathField = new JTextField(book != null ? book.filepath : "");
            filepathField.setEditable(false);
            
            browseButton = new JButton("Browse");
            browseButton.addActionListener(e -> browseForFile());
            
            panel.add(createFieldPanel("Title:", titleField));
            panel.add(Box.createRigidArea(new Dimension(0, 10)));
            panel.add(createFieldPanel("Author:", authorField));
            panel.add(Box.createRigidArea(new Dimension(0, 10)));
            panel.add(createFieldPanel("Subject:", subjectField));
            panel.add(Box.createRigidArea(new Dimension(0, 10)));
            
            JPanel filePanel = createFieldPanel("File Path:", filepathField);
            filePanel.add(browseButton, BorderLayout.EAST);
            panel.add(filePanel);
            panel.add(Box.createRigidArea(new Dimension(0, 20)));
            
            JPanel buttonPanel = new JPanel(new FlowLayout());
            JButton saveButton = new JButton("Save");
            JButton cancelButton = new JButton("Cancel");
            
            saveButton.addActionListener(e -> saveBook());
            cancelButton.addActionListener(e -> dispose());
            
            buttonPanel.add(saveButton);
            buttonPanel.add(cancelButton);
            panel.add(buttonPanel);
            
            add(panel);
        }
        
        private JPanel createFieldPanel(String label, JTextField field) {
            JPanel p = new JPanel(new BorderLayout(8, 0));
            JLabel l = new JLabel(label);
            l.setPreferredSize(new Dimension(80, 28));
            p.add(l, BorderLayout.WEST);
            p.add(field, BorderLayout.CENTER);
            p.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
            return p;
        }
        
        private void browseForFile() {
            JFileChooser fileChooser = new JFileChooser();
            fileChooser.setFileFilter(new javax.swing.filechooser.FileNameExtensionFilter("PDF Files", "pdf"));
            
            int result = fileChooser.showOpenDialog(this);
            if (result == JFileChooser.APPROVE_OPTION) {
                File selectedFile = fileChooser.getSelectedFile();
                filepathField.setText(selectedFile.getAbsolutePath());
            }
        }
        
        private void saveBook() {
            String title = titleField.getText().trim();
            String author = authorField.getText().trim();
            String subject = subjectField.getText().trim();
            String filepath = filepathField.getText().trim();
            
            if (title.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Title is required.", "Validation Error", JOptionPane.WARNING_MESSAGE);
                return;
            }
            
            if (filepath.isEmpty()) {
                JOptionPane.showMessageDialog(this, "File path is required.", "Validation Error", JOptionPane.WARNING_MESSAGE);
                return;
            }
            
            // Check if file exists
            File file = new File(filepath);
            if (!file.exists()) {
                JOptionPane.showMessageDialog(this, "Selected file does not exist.", "File Error", JOptionPane.ERROR_MESSAGE);
                return;
            }
            
            Book b = (book == null) ? new Book() : book;
            b.title = title;
            b.author = author.isEmpty() ? "Unknown" : author;
            b.subject = subject;
            b.filepath = filepath;
            b.filesize = file.length();
            b.uploadedBy = System.getProperty("user.name");
            
            boolean success = (book == null) ? DatabaseManager.addBook(b) : DatabaseManager.updateBook(b);
            
            if (success) {
                JOptionPane.showMessageDialog(this, "Book saved successfully!");
                dispose();
            } else {
                JOptionPane.showMessageDialog(this, "Failed to save book. Please try again.", "Save Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }
    
 
    class BookSearchDialog extends JDialog {
        private JTextField searchField;
        private JList<Book> resultList;
        private DefaultListModel<Book> listModel;
        
        public BookSearchDialog(JFrame parent) {
            super(parent, "Search Books", true);
            setSize(600, 400);
            setLocationRelativeTo(parent);
            setupUI();
        }
        
        private void setupUI() {
            setLayout(new BorderLayout());
            
            JPanel searchPanel = new JPanel(new FlowLayout());
            searchField = new JTextField(20);
            JButton searchButton = new JButton("Search");
            
            searchButton.addActionListener(e -> performSearch());
            searchField.addActionListener(e -> performSearch());
            
            searchPanel.add(new JLabel("Search:"));
            searchPanel.add(searchField);
            searchPanel.add(searchButton);
            add(searchPanel, BorderLayout.NORTH);
            
            listModel = new DefaultListModel<>();
            resultList = new JList<>(listModel);
            resultList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
            resultList.setCellRenderer(new BookListCellRenderer());
            
            JScrollPane scrollPane = new JScrollPane(resultList);
            add(scrollPane, BorderLayout.CENTER);
            
            JPanel buttonPanel = new JPanel(new FlowLayout());
            JButton openButton = new JButton("Open Selected");
            JButton closeButton = new JButton("Close");
            
            openButton.addActionListener(e -> {
                Book selected = resultList.getSelectedValue();
                if (selected != null) {
                    openPDF(selected.filepath);
                } else {
                    JOptionPane.showMessageDialog(this, "Please select a book to open.");
                }
            });
            
            closeButton.addActionListener(e -> dispose());
            
            buttonPanel.add(openButton);
            buttonPanel.add(closeButton);
            add(buttonPanel, BorderLayout.SOUTH);
        }
        
        private void performSearch() {
            String query = searchField.getText().trim();
            if (query.isEmpty()) {
                JOptionPane.showMessageDialog(this, "Please enter a search term.");
                return;
            }
            
            List<Book> results = DatabaseManager.searchBooks(query);
            listModel.clear();
            for (Book book : results) {
                listModel.addElement(book);
            }
            
            if (results.isEmpty()) {
                JOptionPane.showMessageDialog(this, "No books found matching your search.");
            }
        }
    }
    
    // Book Open Dialog
    class BookOpenDialog extends JDialog {
        private JComboBox<String> subjectCombo;
        private JList<Book> bookList;
        private DefaultListModel<Book> listModel;
        
        public BookOpenDialog(JFrame parent) {
            super(parent, "Open Book", true);
            setSize(500, 400);
            setLocationRelativeTo(parent);
            setupUI();
        }
        
        private void setupUI() {
            setLayout(new BorderLayout());
            
            JPanel topPanel = new JPanel(new FlowLayout());
            subjectCombo = new JComboBox<>();
            loadSubjects();
            subjectCombo.addActionListener(e -> loadBooksForSubject());
            
            topPanel.add(new JLabel("Subject:"));
            topPanel.add(subjectCombo);
            add(topPanel, BorderLayout.NORTH);
            
            listModel = new DefaultListModel<>();
            bookList = new JList<>(listModel);
            bookList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
            bookList.setCellRenderer(new BookListCellRenderer());
            
            JScrollPane scrollPane = new JScrollPane(bookList);
            add(scrollPane, BorderLayout.CENTER);
            
            JPanel buttonPanel = new JPanel(new FlowLayout());
            JButton openButton = new JButton("Open");
            JButton closeButton = new JButton("Close");
            
            openButton.addActionListener(e -> {
                Book selected = bookList.getSelectedValue();
                if (selected != null) {
                    openPDF(selected.filepath);
                } else {
                    JOptionPane.showMessageDialog(this, "Please select a book to open.");
                }
            });
            
            closeButton.addActionListener(e -> dispose());
            
            buttonPanel.add(openButton);
            buttonPanel.add(closeButton);
            add(buttonPanel, BorderLayout.SOUTH);
        }
        
        private void loadSubjects() {
            subjectCombo.removeAllItems();
            subjectCombo.addItem("All Subjects");
            
            List<String> subjects = DatabaseManager.getAllSubjects();
            for (String subject : subjects) {
                subjectCombo.addItem(subject);
            }
        }
        
        private void loadBooksForSubject() {
            String selectedSubject = (String) subjectCombo.getSelectedItem();
            List<Book> books;
            
            if ("All Subjects".equals(selectedSubject)) {
                books = DatabaseManager.getAllBooks();
            } else {
                books = DatabaseManager.getBooksBySubject(selectedSubject);
            }
            
            listModel.clear();
            for (Book book : books) {
                listModel.addElement(book);
            }
        }
    }
    
    
    class BookListCellRenderer extends DefaultListCellRenderer {
        @Override
        public Component getListCellRendererComponent(JList<?> list, Object value, int index,
                boolean isSelected, boolean cellHasFocus) {
            super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
            
            if (value instanceof Book book) {
                setText("<html><b>" + book.title + "</b><br>" +
                       "Author: " + book.author + "<br>" +
                       "Subject: " + (book.subject != null ? book.subject : "N/A") + "</html>");
            }
            
            return this;
        }
    }
    
    
    class BookTableModel extends AbstractTableModel {
        private final String[] columns = {"ID", "Title", "Author", "Subject", "File Size", "Uploaded By"};
        private List<Book> books;
        
        public BookTableModel() {
            books = DatabaseManager.getAllBooks();
        }
        
        public void refresh() {
            books = DatabaseManager.getAllBooks();
            fireTableDataChanged();
        }
        
        public void searchBooks(String query) {
            books = DatabaseManager.searchBooks(query);
            fireTableDataChanged();
        }
        
        @Override
        public int getRowCount() { return books.size(); }
        
        @Override
        public int getColumnCount() { return columns.length; }
        
        @Override
        public String getColumnName(int col) {
            return columns[col];
        }
        
        @Override
        public Object getValueAt(int row, int col) {
            Book b = books.get(row);
            
            if (col == 0) return b.id;
            else if (col == 1) return b.title;
            else if (col == 2) return b.author;
            else if (col == 3) return b.subject;
            else if (col == 4) return b.getFileSizeFormatted();
            else if (col == 5) return b.uploadedBy;
            else return "";
        }
        
        public Book getBookAt(int row) { 
            return books.get(row); 
        }
    }
    

    public static class Book {
        public int id;
        public String title;
        public String author;
        public String subject;
        public String filepath;
        public long filesize;
        public String uploadedBy;
        
        public String getFileSizeFormatted() {
            if (filesize < 1024) return filesize + " B";
            if (filesize < 1024 * 1024) return String.format("%.1f KB", filesize / 1024.0);
            return String.format("%.1f MB", filesize / (1024.0 * 1024.0));
        }
        
        @Override
        public String toString() {
            return title + " by " + author;
        }
    }
    
    public static class DatabaseManager {
        public static List<Book> getAllBooks() {
            List<Book> books = new ArrayList<>();
            String query = "SELECT * FROM books WHERE is_active = 1 ORDER BY title";
            
            try (Connection conn = getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                
                while (rs.next()) {
                    Book book = new Book();
                    book.id = rs.getInt("id");
                    book.title = rs.getString("title");
                    book.author = rs.getString("author");
                    book.subject = rs.getString("subject");
                    book.filepath = rs.getString("filepath");
                    book.filesize = rs.getLong("filesize");
                    book.uploadedBy = rs.getString("uploaded_by");
                    books.add(book);
                }
            } catch (SQLException e) {
                System.err.println("Error fetching books: " + e.getMessage());
                // Return empty list if database unavailable
            }
            return books;
        }
        
        public static List<Book> searchBooks(String query) {
            List<Book> books = new ArrayList<>();
            String sql = "SELECT * FROM books WHERE is_active = 1 AND " +
                        "(title LIKE ? OR author LIKE ? OR subject LIKE ?) ORDER BY title";
            
            try (Connection conn = getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(sql)) {
                
                String searchPattern = "%" + query + "%";
                pstmt.setString(1, searchPattern);
                pstmt.setString(2, searchPattern);
                pstmt.setString(3, searchPattern);
                
                try (ResultSet rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        Book book = new Book();
                        book.id = rs.getInt("id");
                        book.title = rs.getString("title");
                        book.author = rs.getString("author");
                        book.subject = rs.getString("subject");
                        book.filepath = rs.getString("filepath");
                        book.filesize = rs.getLong("filesize");
                        book.uploadedBy = rs.getString("uploaded_by");
                        books.add(book);
                    }
                }
            } catch (SQLException e) {
                System.err.println("Error searching books: " + e.getMessage());
            }
            return books;
        }
        
        public static List<Book> getBooksBySubject(String subject) {
            List<Book> books = new ArrayList<>();
            String query = "SELECT * FROM books WHERE is_active = 1 AND subject = ? ORDER BY title";
            
            try (Connection conn = getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(query)) {
                
                pstmt.setString(1, subject);
                try (ResultSet rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        Book book = new Book();
                        book.id = rs.getInt("id");
                        book.title = rs.getString("title");
                        book.author = rs.getString("author");
                        book.subject = rs.getString("subject");
                        book.filepath = rs.getString("filepath");
                        book.filesize = rs.getLong("filesize");
                        book.uploadedBy = rs.getString("uploaded_by");
                        books.add(book);
                    }
                }
            } catch (SQLException e) {
                System.err.println("Error fetching books by subject: " + e.getMessage());
            }
            return books;
        }
        
        public static List<String> getAllSubjects() {
            List<String> subjects = new ArrayList<>();
            String query = "SELECT DISTINCT subject FROM books WHERE is_active = 1 AND subject IS NOT NULL ORDER BY subject";
            
            try (Connection conn = getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                
                while (rs.next()) {
                    String subject = rs.getString("subject");
                    if (subject != null && !subject.trim().isEmpty()) {
                        subjects.add(subject);
                    }
                }
            } catch (SQLException e) {
                System.err.println("Error fetching subjects: " + e.getMessage());
            }
            return subjects;
        }
        
        public static boolean addBook(Book book) {
            String query = "INSERT INTO books (title, author, subject, filepath, filesize, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)";
            
            try (Connection conn = getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(query)) {
                
                pstmt.setString(1, book.title);
                pstmt.setString(2, book.author);
                pstmt.setString(3, book.subject);
                pstmt.setString(4, book.filepath);
                pstmt.setLong(5, book.filesize);
                pstmt.setString(6, book.uploadedBy);
                
                return pstmt.executeUpdate() > 0;
            } catch (SQLException e) {
                System.err.println("Error adding book: " + e.getMessage());
                return false;
            }
        }
        
        public static boolean updateBook(Book book) {
            String query = "UPDATE books SET title = ?, author = ?, subject = ?, filepath = ?, filesize = ? WHERE id = ?";
            
            try (Connection conn = getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(query)) {
                
                pstmt.setString(1, book.title);
                pstmt.setString(2, book.author);
                pstmt.setString(3, book.subject);
                pstmt.setString(4, book.filepath);
                pstmt.setLong(5, book.filesize);
                pstmt.setInt(6, book.id);
                
                return pstmt.executeUpdate() > 0;
            } catch (SQLException e) {
                System.err.println("Error updating book: " + e.getMessage());
                return false;
            }
        }
        
        public static boolean deleteBook(int bookId) {
            String query = "UPDATE books SET is_active = 0 WHERE id = ?";
            
            try (Connection conn = getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(query)) {
                
                pstmt.setInt(1, bookId);
                return pstmt.executeUpdate() > 0;
            } catch (SQLException e) {
                System.err.println("Error deleting book: " + e.getMessage());
                return false;
            }
        }
    }

    public static void openPDF(String filepath) {
        if (filepath == null || filepath.trim().isEmpty()) {
            JOptionPane.showMessageDialog(null, "No file path provided.", "Error", JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        try {
            File pdfFile = new File(filepath);
            if (pdfFile.exists()) {
                if (Desktop.isDesktopSupported()) {
                    Desktop desktop = Desktop.getDesktop();
                    if (desktop.isSupported(Desktop.Action.OPEN)) {
                        desktop.open(pdfFile);
                        System.out.println("✓ Opening PDF: " + filepath);
                    } else {
                        String os = System.getProperty("os.name").toLowerCase();
                        ProcessBuilder pb;
                        
                        if (os.contains("win")) {
                            pb = new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", filepath);
                        } else if (os.contains("mac")) {
                            pb = new ProcessBuilder("open", filepath);
                        } else {
                            pb = new ProcessBuilder("xdg-open", filepath);
                        }
                        
                        pb.start();
                        System.out.println("✓ Opening PDF with system command: " + filepath);
                    }
                } else {
                    JOptionPane.showMessageDialog(null, 
                        "Desktop operations not supported on this system.\nFile location: " + filepath, 
                        "Cannot Open File", JOptionPane.INFORMATION_MESSAGE);
                }
            } else {
                JOptionPane.showMessageDialog(null, 
                    "PDF file not found at: " + filepath, 
                    "File Not Found", JOptionPane.ERROR_MESSAGE);
            }
        } catch (Exception e) {
            System.err.println("Error opening PDF: " + e.getMessage());
            JOptionPane.showMessageDialog(null, 
                "Error opening PDF: " + e.getMessage() + "\nFile path: " + filepath, 
                "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    
    
    public static String getSubjectFilePath(String subjectName) {
        String filepath = null;
        
        try (Connection conn = getConnection()) {
            String query = "SELECT filepath FROM subjects WHERE name = ?";
            try (PreparedStatement pstmt = conn.prepareStatement(query)) {
                pstmt.setString(1, subjectName);
                try (ResultSet rs = pstmt.executeQuery()) {
                    if (rs.next()) {
                        filepath = rs.getString("filepath");
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error getting subject filepath: " + e.getMessage());
        }
        
        return filepath;
    }
    
    public static void main(String[] args) {
        // Set look and feel
        try {
            UIManager.setLookAndFeel(UIManager.getLookAndFeel());
        } catch (Exception e) {
            System.err.println("Could not set system look and feel: " + e.getMessage());
        }
        
        SwingUtilities.invokeLater(() -> {
            try {
                new ImprovedBookManager();
            } catch (Exception e) {
                System.err.println("Error starting application: " + e.getMessage());
                JOptionPane.showMessageDialog(null, 
                    "Failed to start the application: " + e.getMessage() + 
                    "\n\nPlease check your database connection and try again.", 
                    "Startup Error", 
                    JOptionPane.ERROR_MESSAGE);
                System.exit(1);
            }
        });
    }
}