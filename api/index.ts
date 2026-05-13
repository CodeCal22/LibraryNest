import express from 'express';
import cors from 'cors';
import { getDb } from './db';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Auth
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ? AND status = ?', [username, password, 'Active']);
  
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials or suspended account' });
  }
});

// Users/Members
app.get('/api/users', async (req, res) => {
  const db = await getDb();
  const users = await db.all('SELECT * FROM users');
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const { username, password, name, role, status } = req.body;
  const db = await getDb();
  const id = 'u' + Date.now();
  await db.run('INSERT INTO users (id, username, password, name, role, status) VALUES (?, ?, ?, ?, ?, ?)', [id, username, password, name, role, status]);
  const newUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  res.json(newUser);
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, status, role, name, password } = req.body;
  const db = await getDb();
  await db.run('UPDATE users SET username = ?, status = ?, role = ?, name = ?, password = ? WHERE id = ?', [username, status, role, name, password, id]);
  const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  res.json(updatedUser);
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  await db.run('DELETE FROM users WHERE id = ?', [id]);
  res.json({ success: true });
});

// Books
app.get('/api/books', async (req, res) => {
  const db = await getDb();
  const books = await db.all('SELECT * FROM books');
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const { isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies } = req.body;
  const db = await getDb();
  const id = 'b' + Date.now();
  await db.run(
    'INSERT INTO books (id, isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [id, isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies]
  );
  const newBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
  res.json(newBook);
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const { isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies } = req.body;
  const db = await getDb();
  await db.run(
    'UPDATE books SET isbn = ?, title = ?, author = ?, publisher = ?, category = ?, edition = ?, shelfLocation = ?, totalCopies = ?, availableCopies = ? WHERE id = ?',
    [isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies, id]
  );
  const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [id]);
  res.json(updatedBook);
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  await db.run('DELETE FROM books WHERE id = ?', [id]);
  res.json({ success: true });
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  const db = await getDb();
  const transactions = await db.all('SELECT * FROM transactions');
  // SQLite returns strings for dates, map them back to Dates on frontend or here
  res.json(transactions);
});

app.post('/api/transactions/issue', async (req, res) => {
  const { memberId, bookId } = req.body;
  const db = await getDb();
  
  // check limits
  const activeIssues = await db.all('SELECT * FROM transactions WHERE memberId = ? AND status = ?', [memberId, 'Issued']);
  if (activeIssues.length >= 5) return res.status(400).json({ error: 'Limit reached' });

  const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
  if (!book || book.availableCopies <= 0) return res.status(400).json({ error: 'Book unavailable' });

  // Update book
  await db.run('UPDATE books SET availableCopies = availableCopies - 1 WHERE id = ?', [bookId]);

  const id = 't' + Date.now();
  const issueDate = new Date().toISOString();
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  await db.run('INSERT INTO transactions (id, memberId, bookId, issueDate, dueDate, fineAmount, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [id, memberId, bookId, issueDate, dueDate, 0, 'Issued']);

  res.json({ success: true });
});

app.post('/api/transactions/return', async (req, res) => {
  const { transactionId } = req.body;
  const db = await getDb();
  
  const tx = await db.get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
  if (!tx || tx.status === 'Returned') return res.status(400).json({ error: 'Invalid transaction' });

  await db.run('UPDATE books SET availableCopies = availableCopies + 1 WHERE id = ?', [tx.bookId]);

  const returnDate = new Date();
  const dueDate = new Date(tx.dueDate);
  let fineAmount = 0;

  if (returnDate > dueDate) {
    const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    fineAmount = diffDays * 5;
  }

  await db.run('UPDATE transactions SET status = ?, returnDate = ?, fineAmount = ? WHERE id = ?', 
    ['Returned', returnDate.toISOString(), fineAmount, transactionId]);

  res.json({ success: true, fineAmount });
});

// Reservations
app.get('/api/reservations', async (req, res) => {
  const db = await getDb();
  const resvs = await db.all('SELECT * FROM reservations');
  res.json(resvs);
});

app.post('/api/reservations', async (req, res) => {
  const { memberId, bookId } = req.body;
  const db = await getDb();
  const id = 'r' + Date.now();
  const date = new Date().toISOString();
  const expiry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  await db.run('INSERT INTO reservations (id, memberId, bookId, reservationDate, expiryDate, status) VALUES (?, ?, ?, ?, ?, ?)', [id, memberId, bookId, date, expiry, 'Active']);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Backend API listening at http://localhost:${port}`);
});
