import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-issue-return',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="issue-return-container">
      <h2 class="mb-6">Issue & Return Books</h2>

      <div class="grid grid-cols-2 gap-6 mb-8">
        <!-- Issue Book Card -->
        <div class="card glass">
          <div class="flex items-center gap-2 mb-6">
            <span class="material-icons-outlined text-gradient">output</span>
            <h3>Issue Book</h3>
          </div>
          
          <div class="form-group">
            <label>Member ID / Username</label>
            <select [(ngModel)]="issueMemberId">
              <option value="">Select Member</option>
              <option *ngFor="let user of members()" [value]="user.id">{{ user.name }} ({{ user.username }})</option>
            </select>
          </div>

          <div class="form-group">
            <label>Book</label>
            <select [(ngModel)]="issueBookId">
              <option value="">Select Book</option>
              <option *ngFor="let book of availableBooks()" [value]="book.id">{{ book.title }} (Available: {{ book.availableCopies }})</option>
            </select>
          </div>

          <button class="btn btn-primary w-100 mt-4" (click)="issueBook()" [disabled]="!issueMemberId || !issueBookId">
            Issue Book
          </button>
        </div>

        <!-- Return Book Card -->
        <div class="card glass">
          <div class="flex items-center gap-2 mb-6">
            <span class="material-icons-outlined text-gradient">input</span>
            <h3>Return Book</h3>
          </div>
          
          <div class="form-group">
            <label>Active Transaction</label>
            <select [(ngModel)]="returnTransactionId">
              <option value="">Select Transaction to Return</option>
              <option *ngFor="let tx of activeTransactions()" [value]="tx.id">
                Tx: #{{ tx.id }} - {{ getMemberName(tx.memberId) }} - {{ getBookTitle(tx.bookId) }}
              </option>
            </select>
          </div>

          <button class="btn btn-secondary w-100 mt-4" (click)="returnBook()" [disabled]="!returnTransactionId">
            Return Book & Calculate Fine
          </button>
        </div>
      </div>

      <!-- Active Issues Table -->
      <div class="card glass">
        <h3 class="mb-4">Currently Issued Books</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tx of activeTransactions()">
                <td>#{{ tx.id }}</td>
                <td>{{ getMemberName(tx.memberId) }}</td>
                <td>{{ getBookTitle(tx.bookId) }}</td>
                <td>{{ tx.issueDate | date }}</td>
                <td [ngClass]="{'text-status-error font-bold': isOverdue(tx.dueDate)}">{{ tx.dueDate | date }}</td>
                <td>
                  <span class="badge" [ngClass]="isOverdue(tx.dueDate) ? 'badge-error' : 'badge-warning'">
                    {{ isOverdue(tx.dueDate) ? 'Overdue' : 'Issued' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="activeTransactions().length === 0">
                <td colspan="6" class="text-center text-muted">No active issues found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .w-100 { width: 100%; }
    .text-status-error { color: var(--status-error); }
  `]
})
export class IssueReturnComponent {
  private dataService = inject(DataService);

  issueMemberId = '';
  issueBookId = '';
  returnTransactionId = '';

  members = this.dataService.users;
  books = this.dataService.books;
  transactions = this.dataService.transactions;

  activeTransactions() {
    return this.transactions().filter(t => t.status === 'Issued');
  }

  availableBooks() {
    return this.books().filter(b => b.availableCopies > 0);
  }

  getMemberName(id: string) {
    return this.members().find(u => u.id === id)?.name || 'Unknown';
  }

  getBookTitle(id: string) {
    return this.books().find(b => b.id === id)?.title || 'Unknown';
  }

  isOverdue(dueDate: Date) {
    return new Date() > dueDate;
  }

  async issueBook() {
    const success = await this.dataService.issueBook(this.issueMemberId, this.issueBookId);
    if (success) {
      alert('Book issued successfully.');
      this.issueMemberId = '';
      this.issueBookId = '';
    } else {
      alert('Failed to issue book. Check member limits or book availability.');
    }
  }

  async returnBook() {
    const tx = this.transactions().find(t => t.id === this.returnTransactionId);
    const success = await this.dataService.returnBook(this.returnTransactionId);
    if (success) {
      // Reload logic is handled by service, we can't get fine amount from service return synchronously without changing type.
      // Assuming return is successful.
      alert('Book returned successfully.');
      this.returnTransactionId = '';
    } else {
      alert('Failed to return book.');
    }
  }
}
