# 📚 utilISE - Engineering Book Management System

> **utilISE** is a comprehensive Java Swing desktop application designed specifically for engineering students to efficiently access, organize, and manage semester-wise academic resources and textbooks through an intuitive graphical interface.

## 🎯 Project Overview

utilISE streamlines the academic experience by providing centralized access to course materials, eliminating the need to manually search through folders and directories. The application features a library-inspired interface that makes studying more engaging and organized.

## ✨ Key Features

### 📖 Core Functionality
- **Semester-wise Organization**: Navigate through different academic semesters with dedicated interfaces
- **Subject Categorization**: Access books organized by subject codes and full names
- **One-click PDF Access**: Instant access to textbooks through integrated file handling
- **Multi-path File Detection**: Intelligent file searching across multiple directory structures

### 🎨 User Experience
- **Professional UI Design**: Clean, modern interface with hover effects and visual feedback
- **Responsive Layout**: Adapts to different screen sizes and resolutions
- **Background Themes**: Library-inspired visuals with fallback gradient backgrounds
- **Error Handling**: Comprehensive error messages with actionable guidance

### 🔧 Technical Features
- **Desktop Integration**: Seamless PDF opening using system default applications
- **Resource Management**: Efficient memory usage and proper resource disposal
- **Cross-platform Compatibility**: Works on Windows, macOS, and Linux
- **Extensible Architecture**: Easy to add new semesters and subjects

## 🏗️ Technical Architecture

### Technology Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Java Swing + AWT | GUI components and layout management |
| **File Handling** | Java Desktop API | PDF file opening and system integration |
| **Graphics** | Java 2D Graphics | Custom rendering and visual effects |
| **Event Handling** | Java Event Model | User interaction management |

### Design Patterns Used
- **Factory Pattern**: Button creation and styling
- **Observer Pattern**: Event handling and user interactions
- **Strategy Pattern**: File path resolution and error handling

## 📁 Project Structure

```
utilISE/
├── src/
│   └── pack/
│       ├── HomePage.java           # Main application window
│       └── SemesterWindow.java     # Semester-specific interface
├── books/                          # PDF storage directory
│   ├── Third Semester/
│   │   ├── C.pdf                  # C Programming textbook
│   │   ├── DCO.pdf                # Digital Circuit Organization
│   │   ├── DMS.pdf                # Discrete Mathematics
│   │   └── OS.pdf                 # Operating Systems
│   ├── Fourth Semester/
│   │   ├── Java.pdf               # Java Programming textbook
│   │   ├── DBMS.pdf               # Database Management Systems
│   │   ├── DA.pdf                 # Data Analytics
│   │   └── micro.pdf              # Microprocessors
│   └── Library.jpg                # Background image asset
├── resources/
│   ├── app_icon.png              # Application icon
│   └── screenshots/              # Application screenshots
├── docs/
│   ├── API_DOCUMENTATION.md      # Code documentation
│   └── USER_GUIDE.md            # User manual
├── README.md                     # Project documentation
├── LICENSE                       # MIT License
└── .gitignore                   # Git ignore rules
```

## 🚀 Installation & Setup

### Prerequisites
- **Java Development Kit (JDK)**: Version 8 or higher
- **Operating System**: Windows 10+, macOS 10.12+, or Linux (Ubuntu 18.04+)
- **PDF Reader**: Default system PDF viewer (Adobe Reader, Preview, etc.)

## 📚 Academic Content

### Currently Supported Semesters

#### 🎓 Third Semester
| Subject Code | Full Name | Description |
|--------------|-----------|-------------|
| **C** | C Programming | Fundamentals of C programming language |
| **DCO** | Digital Circuit Organization | Digital logic and computer organization |
| **DMS** | Discrete Mathematics | Mathematical foundations for CS |
| **OS** | Operating Systems | System software and process management |

#### 🎓 Fourth Semester
| Subject Code | Full Name | Description |
|--------------|-----------|-------------|
| **Java** | Java Programming | Object-oriented programming with Java |
| **DBMS** | Database Management Systems | Database design and SQL |
| **DA** | Data Analytics | Statistical analysis and data mining |
| **Micro** | Microprocessors | Computer architecture and assembly |

## 🔧 Configuration & Customization

### Adding New Content

#### Adding New Semesters
1. Modify `HomePage.java` to include new semester buttons
2. Update button action listeners to handle new semester data
3. Add corresponding subject arrays for the new semester

```java
// Example: Adding Fifth Semester
String[] fifthSemSubjects = {"AI", "ML", "CN", "SE"};
JButton fifthSemButton = createSemesterButton("Fifth Semester", new Color(46, 204, 113));
fifthSemButton.addActionListener(e -> showSemesterSubjects("Fifth Semester", fifthSemSubjects, frame));
```

#### Adding New Books
1. Place PDF files in the `books/` directory
2. Ensure filenames match subject codes (e.g., `AI.pdf` for Artificial Intelligence)
3. Update subject arrays in the respective semester configuration

## 🎨 Screenshots

### Main Interface
<img width="1470" alt="Screenshot 2025-05-28 at 4 46 36 PM" src="https://github.com/user-attachments/assets/5d1f333e-a8a7-4194-9dde-bdc6a19d68ed" />

*Clean, intuitive main interface with semester selection*

### Semester View
<img width="1470" alt="Screenshot 2025-05-28 at 4 46 14 PM" src="https://github.com/user-attachments/assets/fac7c292-ee09-4cd6-b6c6-ef0716cab3e4" />

*Subject selection with library-themed background*

## 🧪 Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Application launches without errors
- [ ] All semester buttons respond correctly
- [ ] PDF files open in default system viewer
- [ ] Error messages display for missing files
- [ ] UI scales properly on different screen sizes
- [ ] Background images load correctly
- [ ] Navigation buttons function as expected

### Performance Metrics
- **Startup Time**: < 2 seconds on modern hardware
- **Memory Usage**: ~25-40 MB during normal operation
- **File Access Time**: < 500ms for local PDF files
- **UI Responsiveness**: < 100ms for button interactions

## 🛠️ Development & Contributing

### Development Environment Setup
1. **IDE Recommendations**: IntelliJ IDEA, Eclipse, or VS Code with Java extensions
2. **Code Style**: Follow Oracle Java Code Conventions
3. **Version Control**: Git with conventional commit messages

### Contributing Guidelines
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Code Quality Standards
- Maintain consistent indentation (4 spaces)
- Add comprehensive JavaDoc comments
- Include error handling for all file operations
- Follow naming conventions (camelCase for variables, PascalCase for classes)

## 📈 Future Roadmap

### Currently Implemented
- [x] **Database Integration**: MySQL, via a shared `DBConfig` class — connection
      settings and credentials are read from environment variables, never
      hardcoded (see "Configuration" below).
- [x] **Search Functionality**: Parameterized (SQL-injection-safe) search
      across title/author/subject in `ImprovedBookManager`.
- [x] **Book Management**: Full CRUD (add/edit/delete/search) via
      `ImprovedBookManager`'s dialogs, backed by MySQL.
- [x] **Automation Service**: `LibraryAutomationService` runs a scheduled job
      that auto-renews books with no waitlist, applies calendar-correct
      capped fines (`FineCalculator`) to overdue books with a waitlist,
      fulfills reservations when copies free up, and logs inventory/condition
      alerts to an audit log.
- [x] **Admin Analytics Dashboard**: Live stats (total books, users, active
      borrowings, fines collected) pulled from a MySQL view.
- [x] **Build System**: Maven (`pom.xml`) with the MySQL driver, JFreeChart,
      and JUnit 5 as managed dependencies.
- [x] **Unit Tests**: `FineCalculatorTest` covers the grace period, per-day
      rate, the fine cap, and a regression test for a bug where fines used
      to grow every time the automation job ran instead of reflecting actual
      days overdue.

### Version 2.0 Planned Features
- [ ] **🤝 Student Community**: Review & rate books, write notes, upload summaries, and ask doubts (Goodreads for engineering students).
- [ ] **📄 Smart Notes Generator**: AI-powered tool to create one-page notes, extract formulas, and generate viva/interview questions from PDFs.
- [ ] **🧠 Question Predictor**: Analyzes previous year papers to predict high/medium/low probability questions and topic frequencies.
- [ ] **🤖 Smart Librarian Chatbot**: AI assistant that helps locate physical books in the library (e.g., "Rack C, Shelf 7").
- [ ] **Theme Customization**: Multiple UI themes and color schemes
- [ ] **Cloud Sync**: Google Drive/Dropbox integration for book storage
- [ ] **Mobile Companion**: Android app for remote access

Also now implemented since the last update:
- [x] **Charts on Admin Dashboard**: bar chart (issues per semester) and pie
      chart (available vs. issued copies), wired into `AdminAnalyticsDashboard`.
- [x] **Role-based login**: `LoginDialog` authenticates against `users` and
      gates `AdminAnalyticsDashboard`/`ImprovedBookManager` by role.
- [x] **`books.subject_id` foreign key**: replaces the old fragile text-match
      join between `books.subject` and `subjects.name`; auto-migrated and
      backfilled at startup for existing databases.
- [x] **Packaging**: `jpackage` Maven profile added (see "Building an
      installer" below) — not yet run end-to-end since it needs a JDK 14+
      with jpackage on the build machine.

## Configuration

Set these environment variables before running the app (never commit real
credentials to source):

```bash
export UTILISE_DB_HOST=localhost
export UTILISE_DB_PORT=3306
export UTILISE_DB_NAME=utilise
export UTILISE_DB_USER=root
export UTILISE_DB_PASSWORD=your-password-here   # required, no default
```

> **Note:** an earlier version of this repo had a real database password
> committed in plain text across multiple files. That has been removed and
> replaced with `DBConfig`, which reads credentials from environment
> variables only. If you're the original author, please rotate that
> password — it's still visible in git history even though it's gone from
> the current code.

## Building an installer

```bash
mvn clean package                    # produces target/utilise-1.0.0.jar
mvn -P installer jpackage:jpackage   # produces a native installer for the OS you run this on
```

This produces `.exe` on Windows, `.dmg` on macOS, or `.deb` on Linux — whichever
OS you run the second command on. There's no cross-compilation; to ship all
three, run it once per OS (or use a CI matrix). Requires JDK 14+.

### Long-term Vision
- Multi-university support with customizable curricula
- AI-powered study recommendations
- Integration with learning management systems
- Collaborative features for study groups

## 👨‍💻 Author & Acknowledgments

### Developer
**[Your Name]** - *Full Stack Developer & Engineering Student*
- 📧 Email: mahilohiya12@gmail.com
- 💼 LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/mahilohiya)
- 🐙 GitHub: [@yourusername](https://github.com/mahilohiya)

## 🤝 Support & Community

### Getting Help
- 🐛 **Bug Reports**: Use [GitHub Issues](https://github.com/mahilohiya)
- 📧 **Direct Contact**: mahilohoya12@gmail.com

### Community Guidelines
We welcome contributions from developers of all skill levels. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and follow these principles:
- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Maintain high code quality standards

---

<div align="center">

**Made with ❤️ for engineering students worldwide**

[![Star this repository](https://img.shields.io/github/stars/yourusername/utilISE?style=social)](https://github.com/yourusername/utilISE/stargazers)
[![Fork this repository](https://img.shields.io/github/forks/yourusername/utilISE?style=social)](https://github.com/yourusername/utilISE/network/members)
[![Follow on GitHub](https://img.shields.io/github/followers/yourusername?style=social)](https://github.com/yourusername)

*If this project helped you, please consider giving it a ⭐ star!*

</div>
