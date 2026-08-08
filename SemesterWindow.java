import java.awt.*;
import javax.swing.*;

public class SemesterWindow extends JFrame {

    public SemesterWindow(String semName, String[] subjects) {
        setTitle(semName + " Subjects");
        setExtendedState(JFrame.MAXIMIZED_BOTH);

        ImageIcon icon = new ImageIcon("books/Library.jpg");
        Image backgroundImage = icon.getImage();

        JPanel backgroundPanel = new JPanel() {
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
            }
        };
        backgroundPanel.setLayout(new GridBagLayout());

        JPanel buttonPanel = new JPanel(new GridLayout(2, 2, 20, 20));
        buttonPanel.setOpaque(false);

        for (String subject : subjects) {
            JButton btn = new JButton(subject);
            btn.setFont(new Font("SansSerif", Font.BOLD, 22));
            btn.setPreferredSize(new Dimension(180, 100));
            btn.setBackground(new Color(236, 112, 99));
            btn.setForeground(Color.BLACK);
            btn.addActionListener(e -> openBook(subject));
            buttonPanel.add(btn);
        }

        backgroundPanel.add(buttonPanel);
        add(backgroundPanel);

        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setLocationRelativeTo(null);
        setVisible(true);
    }

    void openBook(String subject) {
        // Placeholder for future implementation
        JOptionPane.showMessageDialog(this,
                "Opening content for: " + subject + "\n\n(Placeholder: PDF/Content integration coming soon)",
                "Subject Content",
                JOptionPane.INFORMATION_MESSAGE);
    }
}
