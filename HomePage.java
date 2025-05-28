import java.awt.*;
import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import javax.swing.*;

public class HomePage {

    public static void main(String[] args) {
        JFrame frame = new JFrame("utilISE - Engineering Book Management System");
        frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
        frame.setLayout(new BorderLayout());

        // NAVBAR
        JPanel navBar = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        navBar.setBackground(new Color(247, 220, 111));
        navBar.setPreferredSize(new Dimension(frame.getWidth(), 50));

        String[] navItems = {"links", "Developer"};
        for (String item : navItems) {
            JButton navButton = new JButton(item);
            navButton.setForeground(Color.WHITE);
            navButton.setBackground(new Color(236, 112, 99));
            navButton.setBorderPainted(false);
            navButton.setFont(new Font("SansSerif", Font.PLAIN, 14));
            navButton.addActionListener(e -> System.out.println("Clicked: " + item));
            navBar.add(navButton);
        }

        // HEADER
        JPanel headerPanel = new JPanel();
        headerPanel.setBackground(new Color(247, 220, 111));
        headerPanel.setPreferredSize(new Dimension(frame.getWidth(), 60));

        JLabel headerLabel = new JLabel("Engineering Book Management System", JLabel.CENTER);
        headerLabel.setForeground(Color.BLACK);
        headerLabel.setFont(new Font("SansSerif", Font.BOLD, 24));
        headerPanel.add(headerLabel);

        // MAIN CONTENT
        JPanel contentPanel = new JPanel(new BorderLayout());
        contentPanel.setBackground(new Color(8, 143, 143));

        JLabel title = new JLabel("UTILISE", JLabel.CENTER);
        title.setFont(new Font("SansSerif", Font.BOLD, 50));
        title.setForeground(Color.WHITE);
        title.setBorder(BorderFactory.createEmptyBorder(20, 0, 20, 0));

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

        // SEMESTER BUTTONS
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));

        JButton thirdSemButton = new JButton("Third Semester");
        thirdSemButton.setFont(new Font("SansSerif", Font.BOLD, 16));
        thirdSemButton.setPreferredSize(new Dimension(200, 60));

        JButton fourthSemButton = new JButton("Fourth Semester");
        fourthSemButton.setFont(new Font("SansSerif", Font.BOLD, 16));
        fourthSemButton.setPreferredSize(new Dimension(200, 60));

        // UPDATED Action Listeners - Now using database!
        thirdSemButton.addActionListener(e -> {
            List<String> thirdSemSubjects = getSubjectsFromDatabase("Third Semester");
            String[] subjectsArray = thirdSemSubjects.toArray(new String[0]);
            new SemesterWindow("Third Semester", subjectsArray);
        });

        fourthSemButton.addActionListener(e -> {
            List<String> fourthSemSubjects = getSubjectsFromDatabase("Fourth Semester");
            String[] subjectsArray = fourthSemSubjects.toArray(new String[0]);
            new SemesterWindow("Fourth Semester", subjectsArray);
        });

        buttonPanel.add(thirdSemButton);
        buttonPanel.add(fourthSemButton);

        // ASSEMBLE UI
        JPanel topWrapper = new JPanel(new BorderLayout());
        topWrapper.add(navBar, BorderLayout.NORTH);
        topWrapper.add(headerPanel, BorderLayout.SOUTH);

        contentPanel.add(title, BorderLayout.NORTH);
        contentPanel.add(aboutLabel, BorderLayout.CENTER);
        contentPanel.add(buttonPanel, BorderLayout.SOUTH);

        frame.add(topWrapper, BorderLayout.NORTH);
        frame.add(contentPanel, BorderLayout.CENTER);
        frame.setVisible(true);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        testDatabaseConnection();
    }

    // Method to test database connection
    public static void testDatabaseConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/utilise",  // ✅ Fixed database name
                "root",                                 // ✅ Correct username
                "Cupcakemahi"                          // ✅ Your password
            );

            System.out.println("✅ Connected to the database!");

            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM subjects");

            while (rs.next()) {
                System.out.println("Subject: " + rs.getString("name") + 
                    " | File: " + rs.getString("filepath"));
            }

            conn.close();
            System.out.println("✅ Database test completed!");

        } catch (Exception e) {
            System.out.println("❌ Database connection failed:");
            e.printStackTrace();
        }
    }

    // Method to get subjects for a specific semester
    public static List<String> getSubjectsFromDatabase(String semesterName) {
        List<String> subjects = new ArrayList<>();
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/utilise",
                "root",
                "Cupcakemahi"
            );
            
            String query = "SELECT s.name FROM subjects s " +
                          "JOIN semesters sem ON s.semester_id = sem.id " +
                          "WHERE sem.name = ?";
            
            PreparedStatement pstmt = conn.prepareStatement(query);
            pstmt.setString(1, semesterName);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                subjects.add(rs.getString("name"));
            }
            
            conn.close();
            System.out.println("✅ Loaded " + subjects.size() + " subjects for " + semesterName);
            
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to hardcoded subjects if database fails
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
            System.out.println("⚠️ Using fallback subjects for " + semesterName);
        }
        
        return subjects;
    }

    // Method to get PDF file path for a subject
    public static String getSubjectFilePath(String subjectName) {
        String filepath = null;
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/utilise",
                "root",
                "Cupcakemahi"
            );
            
            String query = "SELECT filepath FROM subjects WHERE name = ?";
            PreparedStatement pstmt = conn.prepareStatement(query);
            pstmt.setString(1, subjectName);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                filepath = rs.getString("filepath");
            }
            
            conn.close();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return filepath;
    }

    // Method to open PDF files
    public static void openPDF(String subjectName) {
        String filepath = getSubjectFilePath(subjectName);
        
        if (filepath != null) {
            try {
                File pdfFile = new File(filepath);
                if (pdfFile.exists()) {
                    Desktop.getDesktop().open(pdfFile);
                    System.out.println("✅ Opening PDF: " + filepath);
                } else {
                    JOptionPane.showMessageDialog(null, 
                        "PDF file not found: " + filepath, 
                        "File Not Found", 
                        JOptionPane.ERROR_MESSAGE);
                }
            } catch (Exception e) {
                e.printStackTrace();
                JOptionPane.showMessageDialog(null, 
                    "Error opening PDF: " + e.getMessage(), 
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
}