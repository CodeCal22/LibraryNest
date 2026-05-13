import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function seed() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Starting seed process...');

  // Users
  const users = [
    { id: 'u4', username: 'alice_reads', password: 'password', name: 'Alice Johnson', role: 'Member', status: 'Active' },
    { id: 'u5', username: 'bob_books', password: 'password', name: 'Bob Smith', role: 'Member', status: 'Active' },
    { id: 'u6', username: 'charlie_chap', password: 'password', name: 'Charlie Davis', role: 'Member', status: 'Active' },
    { id: 'u7', username: 'diana_prince', password: 'password', name: 'Diana Prince', role: 'Member', status: 'Active' },
    { id: 'u8', username: 'ethan_hunt', password: 'password', name: 'Ethan Hunt', role: 'Member', status: 'Active' }
  ];

  const insertUser = await db.prepare('INSERT OR IGNORE INTO users (id, username, password, name, role, status) VALUES (?, ?, ?, ?, ?, ?)');
  for (const u of users) {
    await insertUser.run(u.id, u.username, u.password, u.name, u.role, u.status);
  }
  await insertUser.finalize();

  // Books
  const books = [
    {
      id: 'b4', isbn: '978-0439708180', title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling', publisher: 'Scholastic', category: 'Fantasy', edition: '1st', shelfLocation: 'F1', totalCopies: 10, availableCopies: 8,
      description: "A young boy discovers he is a wizard and attends a magical school where he begins to uncover the truth about his past and his parents' mysterious deaths.",
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg'
    },
    {
      id: 'b5', isbn: '978-0451524935', title: '1984', author: 'George Orwell', publisher: 'Signet Classic', category: 'Science Fiction', edition: '1st', shelfLocation: 'S1', totalCopies: 7, availableCopies: 5,
      description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg'
    },
    {
      id: 'b6', isbn: '978-0441172719', title: 'Dune', author: 'Frank Herbert', publisher: 'Ace Books', category: 'Science Fiction', edition: '1st', shelfLocation: 'S2', totalCopies: 6, availableCopies: 6,
      description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg'
    },
    {
      id: 'b7', isbn: '978-0060935467', title: 'To Kill a Mockingbird', author: 'Harper Lee', publisher: 'Harper Perennial Modern Classics', category: 'Fiction', edition: '1st', shelfLocation: 'F2', totalCopies: 8, availableCopies: 4,
      description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill A Mockingbird became both an instant bestseller and a critical success.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780060935467-L.jpg'
    },
    {
      id: 'b8', isbn: '978-0743273565', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', publisher: 'Scribner', category: 'Fiction', edition: '1st', shelfLocation: 'F3', totalCopies: 5, availableCopies: 5,
      description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island at a time when The New York Times noted gin was the national drink and sex the national obsession.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg'
    },
    {
      id: 'b9', isbn: '978-0062316097', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', publisher: 'Harper', category: 'Non-Fiction', edition: '1st', shelfLocation: 'N1', totalCopies: 4, availableCopies: 1,
      description: 'A brief history of humankind, exploring how biology and history have defined us and enhanced our understanding of what it means to be human.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg'
    },
    {
      id: 'b10', isbn: '978-0735211292', title: 'Atomic Habits', author: 'James Clear', publisher: 'Avery', category: 'Self-Help', edition: '1st', shelfLocation: 'SH1', totalCopies: 12, availableCopies: 10,
      description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg'
    },
    {
      id: 'b11', isbn: '978-0618260300', title: 'The Hobbit', author: 'J.R.R. Tolkien', publisher: 'Houghton Mifflin', category: 'Fantasy', edition: '1st', shelfLocation: 'F4', totalCopies: 6, availableCopies: 6,
      description: 'A great modern classic and the prelude to The Lord of the Rings. Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780618260300-L.jpg'
    }
  ];

  const insertBook = await db.prepare('INSERT OR IGNORE INTO books (id, isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const b of books) {
    await insertBook.run(b.id, b.isbn, b.title, b.author, b.publisher, b.category, b.edition, b.shelfLocation, b.totalCopies, b.availableCopies, b.description, b.imageUrl);
  }
  await insertBook.finalize();

  // Update existing books with some covers
  await db.run('UPDATE books SET imageUrl = ? WHERE id = ?', ['https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 'b1']);
  await db.run('UPDATE books SET imageUrl = ? WHERE id = ?', ['https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 'b2']);

  // Reviews
  const reviews = [
    { id: 'rev1', bookId: 'b4', memberId: 'u4', rating: 5, comment: 'An absolute masterpiece. I read it every year and it never gets old.', date: new Date(Date.now() - 1000000000).toISOString() },
    { id: 'rev2', bookId: 'b4', memberId: 'u5', rating: 4, comment: 'Great start to the series. The world building is incredible.', date: new Date(Date.now() - 800000000).toISOString() },
    { id: 'rev3', bookId: 'b5', memberId: 'u6', rating: 5, comment: 'Chillingly accurate and incredibly thought provoking. A must read for everyone.', date: new Date(Date.now() - 500000000).toISOString() },
    { id: 'rev4', bookId: 'b5', memberId: 'u4', rating: 4, comment: 'Very grim but completely absorbing. Winston is a fascinating character.', date: new Date(Date.now() - 400000000).toISOString() },
    { id: 'rev5', bookId: 'b6', memberId: 'u7', rating: 5, comment: 'The scale of this universe is unmatched. It takes a bit to get into, but it is so rewarding.', date: new Date(Date.now() - 300000000).toISOString() },
    { id: 'rev6', bookId: 'b7', memberId: 'u8', rating: 5, comment: 'Atticus Finch is the ultimate literary role model. Beautifully written.', date: new Date(Date.now() - 200000000).toISOString() },
    { id: 'rev7', bookId: 'b9', memberId: 'u4', rating: 4, comment: 'Extremely interesting perspective on human history. Some claims are bold, but makes you think.', date: new Date(Date.now() - 150000000).toISOString() },
    { id: 'rev8', bookId: 'b10', memberId: 'u5', rating: 5, comment: 'This book completely changed my daily routine. Highly practical and actionable.', date: new Date(Date.now() - 100000000).toISOString() },
    { id: 'rev9', bookId: 'b11', memberId: 'u6', rating: 4, comment: 'Such a fun and cozy adventure before the darkness of Lord of the Rings.', date: new Date(Date.now() - 50000000).toISOString() }
  ];

  const insertReview = await db.prepare('INSERT OR IGNORE INTO reviews (id, bookId, memberId, rating, comment, date) VALUES (?, ?, ?, ?, ?, ?)');
  for (const r of reviews) {
    await insertReview.run(r.id, r.bookId, r.memberId, r.rating, r.comment, r.date);
  }
  await insertReview.finalize();

  // Transactions (Borrowing History)
  const transactions = [
    { id: 't2', memberId: 'u4', bookId: 'b4', issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), returnDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), fineAmount: 30, status: 'Returned' },
    { id: 't3', memberId: 'u5', bookId: 'b5', issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), fineAmount: 0, status: 'Issued' },
    { id: 't4', memberId: 'u4', bookId: 'b9', issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), fineAmount: 0, status: 'Issued' },
    { id: 't5', memberId: 'u6', bookId: 'b7', issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), fineAmount: 0, status: 'Issued' }, // Overdue
  ];

  const insertTx = await db.prepare('INSERT OR IGNORE INTO transactions (id, memberId, bookId, issueDate, dueDate, returnDate, fineAmount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (const t of transactions) {
    await insertTx.run(t.id, t.memberId, t.bookId, t.issueDate, t.dueDate, t.returnDate || null, t.fineAmount, t.status);
  }
  await insertTx.finalize();

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
