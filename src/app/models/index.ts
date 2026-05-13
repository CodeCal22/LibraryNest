export type Role = 'Librarian' | 'Member' | 'Admin';

export interface User {
  id: string;
  username: string;
  password?: string; // Stored hashed in real app
  name: string;
  role: Role;
  address?: string;
  phone?: string;
  email?: string;
  status: 'Active' | 'Suspended';
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  edition: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  description?: string;
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  memberId: string;
  bookId: string;
  issueDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fineAmount: number;
  status: 'Issued' | 'Returned';
}

export interface Reservation {
  id: string;
  memberId: string;
  bookId: string;
  reservationDate: Date;
  expiryDate: Date;
  status: 'Active' | 'Fulfilled' | 'Cancelled' | 'Expired';
}

export interface Review {
  id: string;
  bookId: string;
  memberId: string;
  rating: number;
  comment: string;
  date: string | Date;
}

export interface Wishlist {
  id: string;
  memberId: string;
  bookId: string;
  addedDate: string | Date;
}
