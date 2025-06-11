import java.awt.*;
import java.io.File;
import java.io.IOException;
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
        String path = "books/" + subject + ".pdf";
        File file = new File(path);
        if (!file.exists()) {
            JOptionPane.showMessageDialog(this, "File not found: " + path);
            return;
        }
        try {
            Desktop.getDesktop().open(file);
        } catch (IOException e) {
            JOptionPane.showMessageDialog(this, "Error opening file: " + path);
        }
    }
}
