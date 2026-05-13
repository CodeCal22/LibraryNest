import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function seedMore() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log('Starting secondary seed process...');

  const moreBooks = [
    {
      id: 'b12', isbn: '978-0307588371', title: 'Gone Girl', author: 'Gillian Flynn', publisher: 'Crown Publishing Group', category: 'Mystery', edition: '1st', shelfLocation: 'M1', totalCopies: 5, availableCopies: 5,
      description: 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne’s fifth wedding anniversary. Presents are being wrapped and reservations are being made when Nick’s clever and beautiful wife disappears from their rented McMansion on the Mississippi River.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg'
    },
    {
      id: 'b13', isbn: '978-1501110368', title: 'It Ends with Us', author: 'Colleen Hoover', publisher: 'Atria Books', category: 'Romance', edition: '1st', shelfLocation: 'R1', totalCopies: 8, availableCopies: 7,
      description: 'Lily hasn’t always had it easy, but that’s never stopped her from working hard for the life she wants. She’s come a long way from the small town in Maine where she grew up—she graduated from college, moved to Boston, and started her own business.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9781501110368-L.jpg'
    },
    {
      id: 'b14', isbn: '978-0399590504', title: 'Educated', author: 'Tara Westover', publisher: 'Random House', category: 'Biography', edition: '1st', shelfLocation: 'B1', totalCopies: 4, availableCopies: 3,
      description: 'An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg'
    },
    {
      id: 'b15', isbn: '978-1501124020', title: 'Shoe Dog', author: 'Phil Knight', publisher: 'Scribner', category: 'Business', edition: '1st', shelfLocation: 'BU1', totalCopies: 3, availableCopies: 3,
      description: 'In this candid and riveting memoir, for the first time ever, Nike founder and board chairman Phil Knight shares the inside story of the company’s early days as an intrepid start-up and its evolution into one of the world’s most iconic, game-changing, and profitable brands.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9781501124020-L.jpg'
    },
    {
      id: 'b16', isbn: '978-0307887443', title: 'Ready Player One', author: 'Ernest Cline', publisher: 'Crown Publishing Group', category: 'Science Fiction', edition: '1st', shelfLocation: 'S3', totalCopies: 6, availableCopies: 4,
      description: 'In the year 2044, reality is an ugly place. The only time teenage Wade Watts really feels alive is when he\'s jacked into the virtual utopia known as the OASIS.',
      imageUrl: 'https://covers.openlibrary.org/b/isbn/9780307887443-L.jpg'
    }
  ];

  const insertBook = await db.prepare('INSERT OR IGNORE INTO books (id, isbn, title, author, publisher, category, edition, shelfLocation, totalCopies, availableCopies, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const b of moreBooks) {
    await insertBook.run(b.id, b.isbn, b.title, b.author, b.publisher, b.category, b.edition, b.shelfLocation, b.totalCopies, b.availableCopies, b.description, b.imageUrl);
  }
  await insertBook.finalize();

  console.log('Secondary seed completed successfully!');
}

seedMore().catch(console.error);
