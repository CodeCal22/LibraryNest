import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="my-books-container animate-fade-in">
      <h2 class="mb-6 text-gradient">My Borrowed Books</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10" *ngIf="myIssuedBooks().length > 0; else noBooks">
        <div *ngFor="let item of myIssuedBooks()" class="card glass flex items-start gap-4 relative" [ngClass]="{'border-error': item.isOverdue}">
          <div class="book-cover-small cursor-pointer" [routerLink]="['/dashboard/books', item.book?.id]" [style.backgroundImage]="item.book?.imageUrl ? 'url(' + item.book?.imageUrl + ')' : ''" [style.backgroundSize]="'cover'" [style.backgroundPosition]="'center'">
             <span *ngIf="!item.book?.imageUrl" class="material-icons-outlined">menu_book</span>
          </div>
          <div class="flex-1 min-w-0">
            <a [routerLink]="['/dashboard/books', item.book?.id]" class="text-main no-underline hover:text-primary">
              <h4 class="mb-1 truncate" [title]="item.book?.title">{{ item.book?.title }}</h4>
            </a>
            <p class="text-sm text-muted mb-3 truncate">{{ item.book?.author }}</p>
            
            <div class="text-sm mb-1 flex items-center gap-2">
              <span class="material-icons-outlined text-muted" style="font-size: 16px;">event</span> 
              <span>Borrowed: {{ item.transaction.issueDate | date:'mediumDate' }}</span>
            </div>
            <div class="text-sm mb-3 flex items-center gap-2" [ngClass]="{'text-status-error font-medium': item.isOverdue}">
              <span class="material-icons-outlined" [ngClass]="item.isOverdue ? 'text-status-error' : 'text-muted'" style="font-size: 16px;">event_busy</span> 
              <span>Due: {{ item.transaction.dueDate | date:'mediumDate' }}</span>
            </div>
            
            <div class="flex justify-between items-center mt-2">
              <span class="status-pill" [ngClass]="item.isOverdue ? 'status-error' : 'status-success'">
                <span class="material-icons-outlined" style="font-size: 14px; margin-right: 4px;">{{ item.isOverdue ? 'warning' : 'check_circle' }}</span>
                {{ item.isOverdue ? 'Overdue' : 'Borrowed' }}
              </span>
              <span class="text-xs font-medium" [ngClass]="item.isOverdue ? 'text-status-error' : 'text-status-success'">
                {{ item.isOverdue ? (item.remainingDays * -1) + ' days overdue' : item.remainingDays + ' days remaining' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <ng-template #noBooks>
        <div class="card glass mb-10 text-center py-10 border-dashed">
          <span class="material-icons-outlined text-muted" style="font-size: 4rem; opacity: 0.5;">library_books</span>
          <p class="text-muted mt-4" style="font-size: 1.1rem;">You don't have any books currently borrowed.</p>
          <p class="text-sm text-muted mt-1">Browse the available books below and borrow one to start reading!</p>
        </div>
      </ng-template>

      <div class="flex justify-between items-end mb-6">
        <h2 class="text-gradient m-0">Books Available to Borrow</h2>
        
        <div class="search-bar" style="width: 300px;">
          <span class="material-icons-outlined text-muted">search</span>
          <input type="text" placeholder="Search available books..." [(ngModel)]="searchQuery" (input)="updateSearch()">
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div class="card book-card" *ngFor="let book of filteredAvailableBooks()">
          <div class="book-cover cursor-pointer" [routerLink]="['/dashboard/books', book.id]" [style.backgroundImage]="book.imageUrl ? 'url(' + book.imageUrl + ')' : ''" [style.backgroundSize]="'cover'" [style.backgroundPosition]="'center'">
            <span *ngIf="!book.imageUrl" class="material-icons-outlined">book</span>
          </div>
          <div class="book-info">
            <a [routerLink]="['/dashboard/books', book.id]" class="text-main no-underline hover:text-primary">
              <h4 class="book-title" [title]="book.title">{{ book.title }}</h4>
            </a>
            <p class="text-xs text-muted mb-4">{{ book.author }} &bull; {{ book.category }}</p>
            
            <div class="flex justify-between items-center mt-auto">
              <span class="badge badge-success flex items-center gap-1">
                 <span class="material-icons-outlined" style="font-size: 12px;">check_circle</span> Available
              </span>
              <button class="btn btn-primary btn-sm" (click)="issueBook(book.id)">
                 <span class="material-icons-outlined" style="font-size: 16px;">library_add</span> Borrow
              </button>
            </div>
          </div>
        </div>
        
        <div *ngIf="filteredAvailableBooks().length === 0" class="col-span-full card glass text-center py-8">
          <p class="text-muted">No available books match your search.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-books-container {
      padding-bottom: 2rem;
    }
    .book-cover-small {
      width: 90px;
      height: 130px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .book-cover-small .material-icons-outlined {
      font-size: 2.5rem;
      opacity: 0.9;
    }
    .border-error {
      border: 1px solid rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
    }
    .border-dashed {
      border: 2px dashed var(--border-color);
    }
    .book-card {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    .book-cover {
      height: 150px;
      background: linear-gradient(135deg, var(--bg-card-hover), var(--bg-card));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      border-bottom: 1px solid var(--border-color);
    }
    .book-cover .material-icons-outlined {
      font-size: 3.5rem;
      opacity: 0.5;
    }
    .book-info {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .book-title {
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .btn-sm {
      padding: 0.4rem 0.75rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--status-success);
    }
    .status-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--status-error);
    }
    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--status-success);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .m-0 { margin: 0; }
  `]
})
export class MyBooksComponent {
  private dataService = inject(DataService);

  user = this.dataService.currentUser;
  searchQuery = signal('');

  myIssuedBooks = computed(() => {
    const userId = this.user()?.id;
    if (!userId) return [];
    
    return this.dataService.transactions()
      .filter(t => t.memberId === userId && t.status === 'Issued')
      .map(t => {
        const book = this.dataService.books().find(b => b.id === t.bookId);
        
        // Calculate remaining days properly
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day for fair comparison
        
        const due = new Date(t.dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = remainingDays < 0;
        
        return {
          transaction: t,
          book: book,
          remainingDays,
          isOverdue
        };
      })
      .sort((a, b) => a.remainingDays - b.remainingDays); // Sort by urgency
  });

  filteredAvailableBooks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    let available = this.dataService.books().filter(b => b.availableCopies > 0);
    
    if (query) {
      available = available.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query)
      );
    }
    return available;
  });

  updateSearch() {
    this.searchQuery.set(this.searchQuery());
  }

  async issueBook(bookId: string) {
    if (!this.user()?.id) return;
    
    // Optimistic / pre-check limits
    const currentIssued = this.myIssuedBooks().length;
    if (currentIssued >= 5) {
      alert('You have reached the maximum limit of 5 borrowed books.');
      return;
    }

    if(confirm('Are you sure you want to borrow this book?')) {
      const success = await this.dataService.issueBook(this.user()!.id, bookId);
      if (success) {
        // UI will update automatically because transactions signal is updated in dataService
      } else {
        alert('Could not borrow book. It may have become unavailable.');
      }
    }
  }
}
