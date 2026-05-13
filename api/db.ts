import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
      });
      await initDb(database);
      return database;
    })();
  }
  return dbPromise;
}

async function initDb(db: Database<sqlite3.Database, sqlite3.Statement>) {
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      isbn TEXT UNIQUE,
      title TEXT,
      author TEXT,
      publisher TEXT,
      category TEXT,
      edition TEXT,
      shelfLocation TEXT,
      totalCopies INTEGER,
      availableCopies INTEGER
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      memberId TEXT,
      bookId TEXT,
      issueDate TEXT,
      dueDate TEXT,
      returnDate TEXT,
      fineAmount INTEGER,
      status TEXT,
      FOREIGN KEY(memberId) REFERENCES users(id),
      FOREIGN KEY(bookId) REFERENCES books(id)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      memberId TEXT,
      bookId TEXT,
      reservationDate TEXT,
      expiryDate TEXT,
      status TEXT,
      FOREIGN KEY(memberId) REFERENCES users(id),
      FOREIGN KEY(bookId) REFERENCES books(id)
    );
  `);

  // Seed data if empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding initial data...');
    const insertUser = await db.prepare('INSERT INTO users (id, username, password, name, role, status) VALUES (?, ?, ?, ?, ?, ?)');
    await insertUser.run('u1', 'admin', 'password', 'Admin User', 'Admin', 'Active');
    await insertUser.run('u2', 'librarian1', 'password', 'Sarah Connor', 'Librarian', 'Active');
    await insertUser.run('u3', 'member1', 'password', 'John Doe', 'Member', 'Active');
    await insertUser.finalize();

    const insertBook = await db.prepare('INSERT INTO books (id, isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    await insertBook.run('b1', '978-0132350884', 'Clean Code', 'Robert C. Martin', 'Prentice Hall', 'Programming', '1st', 'A1', 5, 4);
    await insertBook.run('b2', '978-0201633610', 'Design Patterns', 'Erich Gamma', 'Addison-Wesley', 'Programming', '1st', 'A2', 3, 3);
    await insertBook.run('b3', '978-1449331818', 'Learning JavaScript Design Patterns', 'Addy Osmani', 'OReilly', 'Programming', '1st', 'A3', 2, 0);
    await insertBook.finalize();

    const insertTx = await db.prepare('INSERT INTO transactions (id, memberId, bookId, issueDate, dueDate, fineAmount, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const past15Days = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    const past1Day = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    await insertTx.run('t1', 'u3', 'b1', past15Days, past1Day, 5, 'Issued');
    await insertTx.finalize();

    const insertRes = await db.prepare('INSERT INTO reservations (id, memberId, bookId, reservationDate, expiryDate, status) VALUES (?, ?, ?, ?, ?, ?)');
    await insertRes.run('r1', 'u3', 'b3', new Date().toISOString(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), 'Active');
    await insertRes.finalize();
  }
}
