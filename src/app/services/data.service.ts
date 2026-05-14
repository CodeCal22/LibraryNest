import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, Book, Transaction, Reservation, Review, Wishlist } from '../models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  users = signal<User[]>([]);
  books = signal<Book[]>([]);
  transactions = signal<Transaction[]>([]);
  reservations = signal<Reservation[]>([]);
  reviews = signal<Review[]>([]);
  wishlist = signal<Wishlist[]>([]);
  currentUser = signal<User | null>(null);
  userPreferences = signal({ newBooks: true, dueDates: true, reservations: true, overdue: true });

  myNotifications = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    const txs = this.transactions();
    const allBooks = this.books();
    const resvs = this.reservations();
    const prefs = this.userPreferences();
    
    const notifs: any[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const borrowedBooks = txs.filter(t => t.memberId === user.id && t.status === 'Issued').map(t => {
      const book = allBooks.find(b => b.id === t.bookId);
      const due = new Date(t.dueDate);
      due.setHours(0,0,0,0);
      const diffTime = due.getTime() - today.getTime();
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { transaction: t, book, remainingDays, isOverdue: remainingDays < 0 };
    });

    if (prefs.overdue) {
      borrowedBooks.forEach(item => {
        if (item.isOverdue) {
          notifs.push({ type: 'warning', icon: 'timer', message: `Your book "${item.book?.title}" is overdue by ${item.remainingDays * -1} days! Please return it soon to avoid further fines.`, time: 'Action Required' });
        }
      });
      const unpaidTxs = txs.filter(t => t.memberId === user.id && t.status === 'Returned' && t.fineAmount > 0);
      if (unpaidTxs.length > 0) {
        const totalFines = unpaidTxs.reduce((sum, t) => sum + t.fineAmount, 0);
        notifs.push({ type: 'warning', icon: 'money_off', message: `You have ₹${totalFines} in unpaid fines from previous overdue books.`, time: 'Action Required' });
      }
    }

    if (prefs.dueDates) {
      borrowedBooks.forEach(item => {
        if (!item.isOverdue && item.remainingDays <= 2 && item.remainingDays >= 0) {
          notifs.push({ type: 'info', icon: 'event', message: `Your borrowed book "${item.book?.title}" is due in ${item.remainingDays} days.`, time: 'Upcoming' });
        }
      });
    }

    if (prefs.reservations) {
      const myReservations = resvs.filter(r => r.memberId === user.id && r.status === 'Active');
      myReservations.forEach(r => {
        const book = allBooks.find(b => b.id === r.bookId);
        if (book && book.availableCopies > 0) {
          notifs.push({ type: 'success', icon: 'library_add_check', message: `Good news! Your reserved book "${book.title}" is now available to borrow.`, time: 'Available Now' });
        }
      });
    }

    if (prefs.newBooks) {
      if (allBooks.length > 0) {
        const newestBook = allBooks[allBooks.length - 1];
        notifs.push({ type: 'info', icon: 'new_releases', message: `New Arrival: "${newestBook.title}" by ${newestBook.author} has just been added to the catalog!`, time: 'New' });
      }
    }

    return notifs;
  });

  constructor() {
    this.loadInitialData();
    const savedUser = localStorage.getItem('lexora-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser.set(user);
        const savedPrefs = localStorage.getItem('lexora-prefs-' + user.id);
        if (savedPrefs) {
          this.userPreferences.set(JSON.parse(savedPrefs));
        }
      } catch (e) {}
    }
  }

  async loadInitialData() {
    try {
      const [users, books, txs, resvs, revs, wlist] = await Promise.all([
        firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/users`)),
        firstValueFrom(this.http.get<Book[]>(`${this.apiUrl}/books`)),
        firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/transactions`)),
        firstValueFrom(this.http.get<Reservation[]>(`${this.apiUrl}/reservations`)),
        firstValueFrom(this.http.get<Review[]>(`${this.apiUrl}/reviews`)),
        firstValueFrom(this.http.get<Wishlist[]>(`${this.apiUrl}/wishlist`))
      ]);
      
      this.users.set(users);
      this.books.set(books);
      this.reviews.set(revs);
      this.wishlist.set(wlist);
      
      // Map SQLite date strings back to Date objects
      this.transactions.set(txs.map(t => ({
        ...t,
        issueDate: new Date(t.issueDate),
        dueDate: new Date(t.dueDate),
        returnDate: t.returnDate ? new Date(t.returnDate) : undefined
      })));
      this.reservations.set(resvs.map(r => ({
        ...r,
        reservationDate: new Date(r.reservationDate),
        expiryDate: new Date(r.expiryDate)
      })));
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.http.post<User>(`${this.apiUrl}/login`, { username, password }));
      this.currentUser.set(user);
      localStorage.setItem('lexora-user', JSON.stringify(user));
      const savedPrefs = localStorage.getItem('lexora-prefs-' + user.id);
      if (savedPrefs) {
        try { this.userPreferences.set(JSON.parse(savedPrefs)); } catch(e) {}
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('lexora-user');
  }

  // Member Management
  async addMember(user: Omit<User, 'id'>) {
    const newUser = await firstValueFrom(this.http.post<User>(`${this.apiUrl}/users`, user));
    this.users.update(users => [...users, newUser]);
  }
  
  async updateMember(updatedUser: User) {
    const user = await firstValueFrom(this.http.put<User>(`${this.apiUrl}/users/${updatedUser.id}`, updatedUser));
    this.users.update(users => users.map(u => u.id === user.id ? user : u));
  }

  async deleteMember(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/users/${id}`));
    this.users.update(users => users.filter(u => u.id !== id));
  }

  // Book Management
  async addBook(book: Omit<Book, 'id'>) {
    const newBook = await firstValueFrom(this.http.post<Book>(`${this.apiUrl}/books`, book));
    this.books.update(books => [...books, newBook]);
  }

  async updateBook(updatedBook: Book) {
    await firstValueFrom(this.http.put(`${this.apiUrl}/books/${updatedBook.id}`, updatedBook));
    this.books.update(books => books.map(b => b.id === updatedBook.id ? updatedBook : b));
  }

  async deleteBook(id: string) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/books/${id}`));
    this.books.update(books => books.filter(b => b.id !== id));
  }

  // Issue / Return
  async issueBook(memberId: string, bookId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/transactions/issue`, { memberId, bookId }));
      await this.loadInitialData(); // Reload state from server
      return true;
    } catch (e) {
      return false;
    }
  }

  async returnBook(transactionId: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/transactions/return`, { transactionId }));
      await this.loadInitialData(); // Reload state
      return true;
    } catch (e) {
      return false;
    }
  }

  // Reservations
  async reserveBook(memberId: string, bookId: string) {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/reservations`, { memberId, bookId }));
      await this.loadInitialData();
    } catch (e) {
      console.error(e);
    }
  }

  // Reviews
  async addReview(review: Omit<Review, 'id' | 'date'>) {
    const newReview = await firstValueFrom(this.http.post<Review>(`${this.apiUrl}/reviews`, review));
    this.reviews.update(reviews => [...reviews, newReview]);
  }

  // Wishlist
  async toggleWishlist(memberId: string, bookId: string) {
    const res = await firstValueFrom(this.http.post<{action: string, id?: string, item?: Wishlist}>(`${this.apiUrl}/wishlist`, { memberId, bookId }));
    if (res.action === 'added' && res.item) {
      this.wishlist.update(w => [...w, res.item!]);
    } else if (res.action === 'removed' && res.id) {
      this.wishlist.update(w => w.filter(i => i.id !== res.id));
    }
  }
}
