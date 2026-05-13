import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Book } from '../../models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="catalog-container">
      <div class="flex justify-between items-center mb-6">
        <h2>Book Catalog</h2>
        <button *ngIf="isLibrarianOrAdmin()" class="btn btn-primary" (click)="openAddModal()">
          <span class="material-icons-outlined">add</span> Add New Book
        </button>
      </div>

      <div class="card glass mb-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <input type="text" placeholder="Search by title, author, ISBN..." [(ngModel)]="searchQuery" (input)="updateSearch()">
          </div>
          <div class="w-48">
            <select [(ngModel)]="categoryFilter" (change)="updateSearch()">
              <option value="">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Fiction">Fiction</option>
              <option value="Science">Science</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="card book-card" *ngFor="let book of filteredBooks()">
          <div class="book-cover">
            <span class="material-icons-outlined">menu_book</span>
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author text-muted">{{ book.author }}</p>
            <div class="flex justify-between items-center mt-4">
              <span class="badge" [ngClass]="{'badge-success': book.availableCopies > 0, 'badge-error': book.availableCopies === 0}">
                {{ book.availableCopies > 0 ? book.availableCopies + ' Available' : 'Out of Stock' }}
              </span>
              <span class="text-sm text-muted">Shelf: {{ book.shelfLocation }}</span>
            </div>
            
            <div class="mt-4 flex gap-2">
              <button *ngIf="user()?.role === 'Member' && book.availableCopies === 0" class="btn btn-secondary w-100" (click)="reserveBook(book.id)">
                Reserve
              </button>
              <button *ngIf="isLibrarianOrAdmin()" class="btn btn-secondary flex-1" (click)="openEditModal(book)">
                <span class="material-icons-outlined text-sm">edit</span>
              </button>
              <button *ngIf="isLibrarianOrAdmin()" class="btn btn-danger flex-1" (click)="deleteBook(book.id)">
                <span class="material-icons-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="card glass modal-content animate-fade-in">
          <h3 class="mb-4">{{ isEditing() ? 'Edit Book' : 'Add New Book' }}</h3>
          
          <form (ngSubmit)="saveBook()" #bookForm="ngForm">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" [(ngModel)]="currentBook.title" required>
              </div>
              <div class="form-group">
                <label>Author</label>
                <input type="text" name="author" [(ngModel)]="currentBook.author" required>
              </div>
              <div class="form-group">
                <label>ISBN</label>
                <input type="text" name="isbn" [(ngModel)]="currentBook.isbn" required>
              </div>
              <div class="form-group">
                <label>Publisher</label>
                <input type="text" name="publisher" [(ngModel)]="currentBook.publisher" required>
              </div>
              <div class="form-group">
                <label>Category</label>
                <select name="category" [(ngModel)]="currentBook.category" required>
                  <option value="Programming">Programming</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Science">Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label>Edition</label>
                <input type="text" name="edition" [(ngModel)]="currentBook.edition">
              </div>
              <div class="form-group">
                <label>Shelf Location</label>
                <input type="text" name="shelfLocation" [(ngModel)]="currentBook.shelfLocation" required>
              </div>
              <div class="form-group">
                <label>Total Copies</label>
                <input type="number" name="totalCopies" [(ngModel)]="currentBook.totalCopies" required min="1">
              </div>
              <div class="form-group">
                <label>Available Copies</label>
                <input type="number" name="availableCopies" [(ngModel)]="currentBook.availableCopies" required min="0">
              </div>
            </div>

            <div class="flex gap-4 mt-6 justify-end">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!bookForm.form.valid">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }
    .book-cover {
      height: 160px;
      background: var(--accent-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .book-cover .material-icons-outlined {
      font-size: 4rem;
      opacity: 0.8;
    }
    .book-info {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .book-title {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
    .w-48 { width: 12rem; }
    .w-100 { width: 100%; }
    .flex-1 { flex: 1; }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
  `]
})
export class BookCatalogComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  user = this.dataService.currentUser;
  searchQuery = signal('');
  categoryFilter = signal('');
  
  showModal = signal(false);
  isEditing = signal(false);
  
  currentBook: Partial<Book> = {};

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q'] !== undefined) {
        this.searchQuery.set(params['q']);
      }
    });
  }

  filteredBooks = computed(() => {
    let books = this.dataService.books();
    const query = this.searchQuery().toLowerCase();
    const category = this.categoryFilter();

    if (query) {
      books = books.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query) || 
        b.isbn.includes(query)
      );
    }
    if (category) {
      books = books.filter(b => b.category === category);
    }
    return books;
  });

  isLibrarianOrAdmin() {
    const role = this.user()?.role;
    return role === 'Librarian' || role === 'Admin';
  }

  updateSearch() {
    this.searchQuery.set(this.searchQuery());
    this.categoryFilter.set(this.categoryFilter());
  }

  async reserveBook(bookId: string) {
    if (this.user()?.id) {
      await this.dataService.reserveBook(this.user()!.id, bookId);
      alert('Book reserved successfully!');
    }
  }

  openAddModal() {
    this.isEditing.set(false);
    this.currentBook = { category: 'Programming', edition: '1st', totalCopies: 1, availableCopies: 1 };
    this.showModal.set(true);
  }

  openEditModal(book: Book) {
    this.isEditing.set(true);
    this.currentBook = { ...book };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentBook = {};
  }

  async saveBook() {
    if (this.isEditing()) {
      await this.dataService.updateBook(this.currentBook as Book);
    } else {
      await this.dataService.addBook(this.currentBook as Omit<Book, 'id'>);
    }
    this.closeModal();
  }

  async deleteBook(bookId: string) {
    if(confirm('Are you sure you want to delete this book?')) {
      await this.dataService.deleteBook(bookId);
    }
  }
}
