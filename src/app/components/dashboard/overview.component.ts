import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <h2 class="mb-6">Dashboard Overview</h2>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-4 gap-6 mb-8">
        <div class="card stat-card">
          <div class="stat-icon bg-purple">
            <span class="material-icons-outlined">menu_book</span>
          </div>
          <div class="stat-details">
            <h3>{{ totalBooks() }}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div class="card stat-card" *ngIf="isLibrarianOrAdmin()">
          <div class="stat-icon bg-pink">
            <span class="material-icons-outlined">people</span>
          </div>
          <div class="stat-details">
            <h3>{{ totalMembers() }}</h3>
            <p>Active Members</p>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon bg-blue">
            <span class="material-icons-outlined">bookmark_border</span>
          </div>
          <div class="stat-details">
            <h3>{{ activeIssues() }}</h3>
            <p>Books Issued</p>
          </div>
        </div>

        <div class="card stat-card" *ngIf="isLibrarianOrAdmin()">
          <div class="stat-icon bg-orange">
            <span class="material-icons-outlined">warning_amber</span>
          </div>
          <div class="stat-details">
            <h3>{{ overdueBooks() }}</h3>
            <p>Overdue Books</p>
          </div>
        </div>
      </div>

      <!-- Recent Transactions or Activity -->
      <div class="card glass">
        <h3 class="mb-4">Recent Transactions</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Member</th>
                <th>Book</th>
                <th>Issue Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tx of recentTransactions()">
                <td>#{{ tx.id }}</td>
                <td>{{ getMemberName(tx.memberId) }}</td>
                <td>{{ getBookTitle(tx.bookId) }}</td>
                <td>{{ tx.issueDate | date }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-info': tx.status === 'Issued',
                    'badge-success': tx.status === 'Returned'
                  }">{{ tx.status }}</span>
                </td>
              </tr>
              <tr *ngIf="recentTransactions().length === 0">
                <td colspan="5" class="text-center text-muted">No recent transactions found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .stat-icon .material-icons-outlined {
      font-size: 2rem;
    }
    .stat-details h3 {
      font-size: 1.875rem;
      margin-bottom: 0.25rem;
    }
    .stat-details p {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .bg-purple { background: linear-gradient(135deg, #8B5CF6, #6D28D9); }
    .bg-pink { background: linear-gradient(135deg, #EC4899, #BE185D); }
    .bg-blue { background: linear-gradient(135deg, #3B82F6, #1D4ED8); }
    .bg-orange { background: linear-gradient(135deg, #F59E0B, #B45309); }
  `]
})
export class OverviewComponent {
  private dataService = inject(DataService);

  user = this.dataService.currentUser;

  totalBooks = computed(() => this.dataService.books().reduce((acc, b) => acc + b.totalCopies, 0));
  totalMembers = computed(() => this.dataService.users().filter(u => u.role === 'Member').length);
  
  activeIssues = computed(() => {
    const txs = this.dataService.transactions().filter(t => t.status === 'Issued');
    if (this.isLibrarianOrAdmin()) return txs.length;
    return txs.filter(t => t.memberId === this.user()?.id).length;
  });

  overdueBooks = computed(() => {
    return this.dataService.transactions().filter(t => t.status === 'Issued' && t.dueDate < new Date()).length;
  });

  recentTransactions = computed(() => {
    const txs = this.dataService.transactions();
    if (this.isLibrarianOrAdmin()) {
      return [...txs].reverse().slice(0, 5);
    }
    return txs.filter(t => t.memberId === this.user()?.id).reverse().slice(0, 5);
  });

  isLibrarianOrAdmin() {
    const role = this.user()?.role;
    return role === 'Librarian' || role === 'Admin';
  }

  getMemberName(id: string) {
    return this.dataService.users().find(u => u.id === id)?.name || 'Unknown';
  }

  getBookTitle(id: string) {
    return this.dataService.books().find(b => b.id === id)?.title || 'Unknown';
  }
}
