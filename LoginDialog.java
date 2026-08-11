import javax.swing.*;
import java.awt.*;
import java.sql.*;

/**
 * Modal login dialog shown at startup. Authenticates against the `users`
 * table via DBConfig. On success, getAuthenticatedUser() returns the logged
 * in user; on cancel/failure after closing, it returns null and the caller
 * should exit.
 */
public class LoginDialog extends JDialog {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private AuthenticatedUser authenticatedUser = null;

    public LoginDialog(Frame owner) {
        super(owner, "utilISE - Sign In", true);
        setSize(360, 260);
        setLocationRelativeTo(owner);
        setResizable(false);
        setLayout(new BorderLayout());
        setDefaultCloseOperation(JDialog.DISPOSE_ON_CLOSE);

        JPanel form = new JPanel();
        form.setLayout(new BoxLayout(form, BoxLayout.Y_AXIS));
        form.setBorder(BorderFactory.createEmptyBorder(24, 24, 12, 24));

        JLabel title = new JLabel("utilISE Login");
        title.setFont(new Font("Segoe UI", Font.BOLD, 20));
        title.setAlignmentX(Component.LEFT_ALIGNMENT);
        form.add(title);
        form.add(Box.createRigidArea(new Dimension(0, 16)));

        form.add(new JLabel("Username"));
        usernameField = new JTextField();
        usernameField.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
        form.add(usernameField);
        form.add(Box.createRigidArea(new Dimension(0, 10)));

        form.add(new JLabel("Password"));
        passwordField = new JPasswordField();
        passwordField.setMaximumSize(new Dimension(Integer.MAX_VALUE, 32));
        form.add(passwordField);
        form.add(Box.createRigidArea(new Dimension(0, 16)));

        JLabel statusLabel = new JLabel(" ");
        statusLabel.setForeground(Color.RED);
        form.add(statusLabel);

        add(form, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 10));
        JButton cancelBtn = new JButton("Cancel");
        JButton loginBtn = new JButton("Sign In");
        buttonPanel.add(cancelBtn);
        buttonPanel.add(loginBtn);
        add(buttonPanel, BorderLayout.SOUTH);

        getRootPane().setDefaultButton(loginBtn);

        cancelBtn.addActionListener(e -> {
            authenticatedUser = null;
            dispose();
        });

        loginBtn.addActionListener(e -> {
            String username = usernameField.getText().trim();
            String password = new String(passwordField.getPassword());

            if (username.isEmpty() || password.isEmpty()) {
                statusLabel.setText("Enter both username and password.");
                return;
            }

            AuthenticatedUser user = attemptLogin(username, password);
            if (user != null) {
                authenticatedUser = user;
                dispose();
            } else {
                statusLabel.setText("Invalid username or password.");
                passwordField.setText("");
            }
        });
    }

    private AuthenticatedUser attemptLogin(String username, String password) {
        String query = "SELECT id, password_hash, role FROM users WHERE username = ?";
        try (Connection conn = DBConfig.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setString(1, username);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password_hash");
                    if (PasswordUtil.verify(password, storedHash)) {
                        return new AuthenticatedUser(rs.getInt("id"), username, rs.getString("role"));
                    }
                }
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this,
                    "Could not reach the database: " + e.getMessage(),
                    "Connection Error", JOptionPane.ERROR_MESSAGE);
        }
        return null;
    }

    /** @return the authenticated user, or null if login was cancelled/failed */
    public AuthenticatedUser getAuthenticatedUser() {
        return authenticatedUser;
    }
}
