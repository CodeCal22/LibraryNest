import { Injectable, signal, inject } from '@angular/core';
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

  constructor() {
    this.loadInitialData();
    const savedUser = localStorage.getItem('lexora-user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
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
