import java.awt.*;
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

        // Add Action Listeners
        thirdSemButton.addActionListener(e -> {
            String[] thirdSemSubjects = {"C", "DCO", "DMS", "OS"};
            new SemesterWindow("Third Semester", thirdSemSubjects);
        });

        fourthSemButton.addActionListener(e -> {
            String[] fourthSemSubjects = {"Java", "DBMS", "DA", "micro"};
            new SemesterWindow("Fourth Semester", fourthSemSubjects);
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
    }
}
