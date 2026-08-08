import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Departments
    const departments = [
        { name: 'Computer Science and Engineering', code: 'CSE' },
        { name: 'Information Science and Engineering', code: 'ISE' },
        { name: 'Electronics and Communication Engineering', code: 'ECE' },
        { name: 'Mechanical Engineering', code: 'ME' },
        { name: 'Civil Engineering', code: 'CE' },
        { name: 'Electrical and Electronics Engineering', code: 'EEE' },
        { name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
        { name: 'Biotechnology', code: 'BT' },
    ];

    for (const dept of departments) {
        const createdDept = await prisma.department.upsert({
            where: { code: dept.code },
            update: {},
            create: dept,
        });

        // 2. Semesters (1-8)
        for (let i = 1; i <= 8; i++) {
            const semester = await prisma.semester.upsert({
                where: {
                    departmentId_number: {
                        departmentId: createdDept.id,
                        number: i,
                    },
                },
                update: {},
                create: {
                    number: i,
                    departmentId: createdDept.id,
                },
            });

            // 3. Subjects (5 per semester)
            for (let j = 1; j <= 5; j++) {
                await prisma.subject.upsert({
                    where: { code: `${dept.code}${i}0${j}` },
                    update: {},
                    create: {
                        name: `${dept.code} Semester ${i} Subject ${j}`,
                        code: `${dept.code}${i}0${j}`,
                        credits: 4,
                        semesterId: semester.id,
                    },
                });
            }
        }
    }

    // 4. Books (Sample realistic textbooks)
    const sampleBooks = [
        { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262033848' },
        { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '9781118063330' },
        { title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '9780132126953' },
        { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '9780073523323' },
        { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', isbn: '9780136042594' },
    ];

    for (const book of sampleBooks) {
        const createdBook = await prisma.book.upsert({
            where: { isbn: book.isbn },
            update: {},
            create: {
                ...book,
                totalCopies: 5,
                availableCopies: 5,
                shelfLocation: 'Rack A1',
            },
        });

        // 5. Book Copies
        for (let i = 1; i <= 5; i++) {
            await prisma.bookCopy.upsert({
                where: { barcode: `${book.isbn}-${i}` },
                update: {},
                create: {
                    bookId: createdBook.id,
                    barcode: `${book.isbn}-${i}`,
                    status: 'AVAILABLE',
                },
            });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
