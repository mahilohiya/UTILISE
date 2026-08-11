import { PrismaClient, Role } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const ENGINEERING_BOOKS = [
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262033848", publisher: "MIT Press", dept: "CSE", sem: 3 },
  { title: "Operating System Concepts", author: "Abraham Silberschatz", isbn: "9781118063330", publisher: "Wiley", dept: "CSE", sem: 4 },
  { title: "Computer Networks", author: "Andrew S. Tanenbaum", isbn: "9780132126953", publisher: "Pearson", dept: "CSE", sem: 5 },
  { title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "9780073523323", publisher: "McGraw-Hill", dept: "ISE", sem: 4 },
  { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", isbn: "9780136042594", publisher: "Pearson", dept: "AIML", sem: 6 },
  { title: "Higher Engineering Mathematics", author: "B.S. Grewal", isbn: "9788174091246", publisher: "Khanna", dept: "CSE", sem: 1 },
  { title: "Digital Design", author: "Morris Mano", isbn: "9780132774208", publisher: "Pearson", dept: "ECE", sem: 3 },
  { title: "Signals and Systems", author: "Alan V. Oppenheim", isbn: "9780138147570", publisher: "Pearson", dept: "ECE", sem: 4 },
  { title: "Data Structures and Algorithm Analysis in C++", author: "Mark Allen Weiss", isbn: "9780132847377", publisher: "Pearson", dept: "CSE", sem: 3 },
  { title: "Computer Organization and Design", author: "David Patterson", isbn: "9780128122754", publisher: "Morgan Kaufmann", dept: "CSE", sem: 4 },
  { title: "Software Engineering", author: "Ian Sommerville", isbn: "9780133943030", publisher: "Pearson", dept: "ISE", sem: 5 },
  { title: "Compilers: Principles, Techniques, and Tools", author: "Alfred V. Aho", isbn: "9780321486813", publisher: "Pearson", dept: "CSE", sem: 6 },
  { title: "Theory of Computation", author: "Michael Sipser", isbn: "9781133187790", publisher: "Cengage", dept: "CSE", sem: 5 },
  { title: "Design and Analysis of Algorithms", author: "S. K. Basu", isbn: "9788120340077", publisher: "PHI", dept: "CSE", sem: 4 },
  { title: "Microelectronic Circuits", author: "Adel S. Sedra", isbn: "9780199339136", publisher: "Oxford", dept: "ECE", sem: 5 },
  { title: "Control Systems Engineering", author: "Norman S. Nise", isbn: "9781118170519", publisher: "Wiley", dept: "EEE", sem: 6 },
  { title: "Power System Analysis", author: "Hadi Saadat", isbn: "9780071281848", publisher: "McGraw-Hill", dept: "EEE", sem: 7 },
  { title: "Thermodynamics: An Engineering Approach", author: "Yunus Cengel", isbn: "9780073398174", publisher: "McGraw-Hill", dept: "ME", sem: 3 },
  { title: "Mechanics of Materials", author: "Russell C. Hibbeler", isbn: "9780134319650", publisher: "Pearson", dept: "ME", sem: 4 },
  { title: "Machine Design", author: "Robert L. Norton", isbn: "9780133356710", publisher: "Pearson", dept: "ME", sem: 6 },
  { title: "Fluid Mechanics", author: "Frank M. White", isbn: "9780073398273", publisher: "McGraw-Hill", dept: "ME", sem: 5 },
  { title: "Strength of Materials", author: "R.K. Bansal", isbn: "9788131808146", publisher: "Laxmi", dept: "CE", sem: 3 },
  { title: "Surveying Vol 1", author: "B.C. Punmia", isbn: "9788131808320", publisher: "Laxmi", dept: "CE", sem: 2 },
  { title: "Concrete Technology", author: "M.S. Shetty", isbn: "9788121900034", publisher: "S Chand", dept: "CE", sem: 5 },
  { title: "Biochemistry", author: "Jeremy M. Berg", isbn: "9781319114633", publisher: "W.H. Freeman", dept: "BT", sem: 3 },
  { title: "Molecular Biology of the Cell", author: "Bruce Alberts", isbn: "9780815344322", publisher: "Garland", dept: "BT", sem: 4 },
  { title: "Deep Learning", author: "Ian Goodfellow", isbn: "9780262035613", publisher: "MIT Press", dept: "AIML", sem: 7 },
  { title: "Pattern Recognition and Machine Learning", author: "Christopher Bishop", isbn: "9780387310732", publisher: "Springer", dept: "AIML", sem: 6 },
  { title: "Computer Vision: Algorithms and Applications", author: "Richard Szeliski", isbn: "9781848829343", publisher: "Springer", dept: "AIML", sem: 7 },
  { title: "Linear Algebra and Its Applications", author: "Gilbert Strang", isbn: "9780030105678", publisher: "Brooks Cole", dept: "CSE", sem: 2 },
  { title: "Discrete Mathematics and Its Applications", author: "Kenneth Rosen", isbn: "9780073383095", publisher: "McGraw-Hill", dept: "CSE", sem: 2 },
  { title: "Object-Oriented Programming with C++", author: "E Balagurusamy", isbn: "9789352606583", publisher: "McGraw-Hill", dept: "CSE", sem: 2 },
  { title: "Web Technologies", author: "Puntambekar", isbn: "9789352602349", publisher: "Technical", dept: "ISE", sem: 5 },
  { title: "Cryptography and Network Security", author: "William Stallings", isbn: "9780138690175", publisher: "Pearson", dept: "ISE", sem: 6 },
  { title: "Cloud Computing: Concepts and Technology", author: "Thomas Erl", isbn: "9780133387520", publisher: "Pearson", dept: "ISE", sem: 7 },
  { title: "Embedded Systems", author: "Raj Kamal", isbn: "9780070143004", publisher: "McGraw-Hill", dept: "ECE", sem: 6 },
  { title: "Antenna Theory and Design", author: "Warren Stutzman", isbn: "9780471665900", publisher: "Wiley", dept: "ECE", sem: 7 },
  { title: "VLSI Design", author: "Neil Weste", isbn: "9780321547743", publisher: "Pearson", dept: "ECE", sem: 7 },
  { title: "Industrial Engineering and Management", author: "O.P. Khanna", isbn: "9788174093408", publisher: "Dhanpat Rai", dept: "ME", sem: 7 },
  { title: "Environmental Engineering", author: "Peavy and Rowe", isbn: "9780070495393", publisher: "McGraw-Hill", dept: "CE", sem: 6 },
];

async function main() {
  console.log("🌱 Seeding RAMS database...");

  await prisma.academicYear.upsert({
    where: { label: "2025-26" },
    update: { isActive: true },
    create: {
      label: "2025-26",
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-07-31"),
      isActive: true,
    },
  });

  await prisma.fineRule.upsert({
    where: { id: "default-fine-rule" },
    update: {},
    create: {
      id: "default-fine-rule",
      perDayAmount: 5,
      gracePeriodDays: 2,
      maxFineCap: 500,
    },
  });

  const departments = [
    { name: "Computer Science and Engineering", code: "CSE" },
    { name: "Information Science and Engineering", code: "ISE" },
    { name: "Electronics and Communication Engineering", code: "ECE" },
    { name: "Mechanical Engineering", code: "ME" },
    { name: "Civil Engineering", code: "CE" },
    { name: "Electrical and Electronics Engineering", code: "EEE" },
    { name: "Artificial Intelligence and Machine Learning", code: "AIML" },
    { name: "Biotechnology", code: "BT" },
  ];

  const deptMap = new Map<string, { id: string; semesters: Map<number, string> }>();

  for (const dept of departments) {
    const createdDept = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    const semMap = new Map<number, string>();
    for (let i = 1; i <= 8; i++) {
      const semester = await prisma.semester.upsert({
        where: { departmentId_number: { departmentId: createdDept.id, number: i } },
        update: {},
        create: { number: i, departmentId: createdDept.id },
      });
      semMap.set(i, semester.id);
      for (let j = 1; j <= 5; j++) {
        await prisma.subject.upsert({
          where: { code: `${dept.code}${i}0${j}` },
          update: {},
          create: {
            name: `${dept.code} Sem ${i} Subject ${j}`,
            code: `${dept.code}${i}0${j}`,
            credits: 4,
            semesterId: semester.id,
          },
        });
      }
    }
    deptMap.set(dept.code, { id: createdDept.id, semesters: semMap });
  }

  const passwordHash = await argon2.hash("password123");
  const cseDept = deptMap.get("CSE")!;
  const cseSem5 = cseDept.semesters.get(5)!;

  const users = [
    { name: "Mahi Lohiya", email: "student@msrit.edu", usn: "1MS22CS001", role: Role.STUDENT, departmentId: cseDept.id, semesterId: cseSem5 },
    { name: "Dr. Rajesh Kumar", email: "faculty@msrit.edu", usn: "EMP001", role: Role.FACULTY, departmentId: cseDept.id, semesterId: null },
    { name: "Priya Sharma", email: "librarian@msrit.edu", usn: "LIB001", role: Role.LIBRARIAN, departmentId: null, semesterId: null },
    { name: "Admin User", email: "admin@msrit.edu", usn: "ADM001", role: Role.ADMIN, departmentId: null, semesterId: null },
  ];

  const userMap = new Map<string, string>();
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, role: u.role },
      create: { ...u, passwordHash },
    });
    userMap.set(u.email, user.id);
  }

  for (const book of ENGINEERING_BOOKS) {
    const dept = deptMap.get(book.dept);
    if (!dept) continue;
    const semesterId = dept.semesters.get(book.sem);
    const subject = await prisma.subject.findFirst({
      where: { semesterId, code: { startsWith: book.dept } },
    });

    const available = Math.floor(Math.random() * 4) + 1;
    const total = available + Math.floor(Math.random() * 3);

    const createdBook = await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        // Backfill cover images for books already seeded before this field existed.
        coverImageUrl: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
      },
      create: {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        departmentId: dept.id,
        semesterId,
        subjectId: subject?.id,
        totalCopies: total,
        availableCopies: available,
        shelfLocation: `Rack ${book.dept}-${book.sem}`,
        tags: [book.dept, `Sem ${book.sem}`],
        price: 450 + Math.floor(Math.random() * 550),
        digitalCopyUrl: Math.random() > 0.7 ? `/digital/${book.isbn}.pdf` : null,
        // Open Library serves real cover art keyed by ISBN, free and without
        // an API key. These are genuine textbooks with real ISBNs, so most
        // will resolve to an actual cover. If Open Library doesn't have a
        // given title, the <img> fallback in the UI shows a styled icon
        // instead of a broken image.
        coverImageUrl: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
      },
    });

    for (let i = 1; i <= total; i++) {
      const status = i <= available ? "AVAILABLE" : "ISSUED";
      await prisma.bookCopy.upsert({
        where: { barcode: `${book.isbn}-${i}` },
        update: { status },
        create: {
          bookId: createdBook.id,
          barcode: `${book.isbn}-${i}`,
          status,
        },
      });
    }
  }

  const studentId = userMap.get("student@msrit.edu")!;
  const algoBook = await prisma.book.findUnique({ where: { isbn: "9780262033848" } });
  const osBook = await prisma.book.findUnique({ where: { isbn: "9781118063330" } });

  if (algoBook && osBook) {
    const issuedCopy = await prisma.bookCopy.findFirst({
      where: { bookId: algoBook.id, status: "ISSUED" },
    });
    if (issuedCopy) {
      const dueSoon = new Date();
      dueSoon.setDate(dueSoon.getDate() + 3);
      const overdue = new Date();
      overdue.setDate(overdue.getDate() - 5);

      await prisma.issueRecord.upsert({
        where: { id: "seed-issue-1" },
        update: {},
        create: {
          id: "seed-issue-1",
          bookCopyId: issuedCopy.id,
          userId: studentId,
          dueDate: dueSoon,
          fineAmount: 0,
          status: "ACTIVE",
        },
      });

      const osCopy = await prisma.bookCopy.findFirst({
        where: { bookId: osBook.id, status: "ISSUED" },
      });
      if (osCopy) {
        await prisma.issueRecord.upsert({
          where: { id: "seed-issue-2" },
          update: {},
          create: {
            id: "seed-issue-2",
            bookCopyId: osCopy.id,
            userId: studentId,
            dueDate: overdue,
            fineAmount: 25,
            fineStatus: "UNPAID",
            status: "OVERDUE",
          },
        });
      }
    }

    await prisma.reservation.upsert({
      where: { id: "seed-reservation-1" },
      update: {},
      create: {
        id: "seed-reservation-1",
        bookId: osBook.id,
        userId: studentId,
        status: "PENDING",
      },
    });

    await prisma.notification.createMany({
      data: [
        { userId: studentId, type: "OVERDUE", message: "Operating System Concepts is 5 days overdue. Fine: ₹25" },
        { userId: studentId, type: "DUE_SOON", message: "Introduction to Algorithms is due in 3 days." },
        { userId: studentId, type: "RESERVATION", message: "You are #1 in queue for Operating System Concepts." },
      ],
      skipDuplicates: true,
    });
  }

  console.log("✅ Seeding completed.");
  console.log("\nDemo accounts (password: password123):");
  console.log("  student@msrit.edu   — STUDENT");
  console.log("  faculty@msrit.edu   — FACULTY");
  console.log("  librarian@msrit.edu — LIBRARIAN");
  console.log("  admin@msrit.edu     — ADMIN");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
