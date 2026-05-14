import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

type Tab = 'overview' | 'borrowed' | 'history' | 'reviews' | 'wishlist' | 'settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-layout animate-fade-in">
      <!-- Sidebar / Header Area -->
      <aside class="profile-sidebar card glass">
        <div class="text-center mb-6">
          <div class="profile-avatar-large mx-auto mb-4 relative">
            {{ user?.name?.charAt(0) || 'U' }}
            <div class="status-indicator" [ngClass]="user?.status === 'Active' ? 'bg-success' : 'bg-error'"></div>
          </div>
          <h2 class="mb-1 text-gradient">{{ user?.name }}</h2>
          <p class="text-muted text-sm mb-2">{{ user?.role }} &bull; {{ user?.id }}</p>
          <div class="flex justify-center gap-2">
            <span class="badge" [ngClass]="user?.status === 'Active' ? 'badge-success' : 'badge-error'">
              {{ user?.status }}
            </span>
          </div>
        </div>

        <nav class="profile-nav">
          <button class="nav-btn" [class.active]="activeTab() === 'overview'" (click)="setTab('overview')">
            <span class="material-icons-outlined">dashboard</span> Overview
          </button>
          <button class="nav-btn" [class.active]="activeTab() === 'borrowed'" (click)="setTab('borrowed')">
            <span class="material-icons-outlined">auto_stories</span> Currently Borrowed
            <span class="nav-count" *ngIf="borrowedBooks().length">{{ borrowedBooks().length }}</span>
          </button>
          <button class="nav-btn" [class.active]="activeTab() === 'history'" (click)="setTab('history')">
            <span class="material-icons-outlined">history</span> Borrowing History
          </button>
          <button class="nav-btn" [class.active]="activeTab() === 'reviews'" (click)="setTab('reviews')">
            <span class="material-icons-outlined">star_rate</span> Reviews & Ratings
          </button>
          <button class="nav-btn" [class.active]="activeTab() === 'wishlist'" (click)="setTab('wishlist')">
            <span class="material-icons-outlined">library_books</span> Reading List
            <span class="nav-count" *ngIf="myWishlist().length || borrowedBooks().length || completedBooks().length">
              {{ myWishlist().length + borrowedBooks().length + completedBooks().length }}
            </span>
          </button>
          <button class="nav-btn" [class.active]="activeTab() === 'settings'" (click)="setTab('settings')" *ngIf="isCurrentUser()">
            <span class="material-icons-outlined">settings</span> Settings
          </button>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="profile-content">
        <!-- OVERVIEW TAB -->
        <div *ngIf="activeTab() === 'overview'" class="tab-pane animate-fade-in">
          <h3 class="mb-4">Reading Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="stat-card glass">
              <span class="material-icons-outlined stat-icon text-primary">library_books</span>
              <div class="stat-value">{{ stats().totalBorrowed }}</div>
              <div class="stat-label">Total Borrowed</div>
            </div>
            <div class="stat-card glass">
              <span class="material-icons-outlined stat-icon text-success">menu_book</span>
              <div class="stat-value">{{ borrowedBooks().length }}</div>
              <div class="stat-label">Currently Reading</div>
            </div>
            <div class="stat-card glass">
              <span class="material-icons-outlined stat-icon text-warning">emoji_events</span>
              <div class="stat-value">{{ stats().reviewsWritten }}</div>
              <div class="stat-label">Reviews Written</div>
            </div>
            <div class="stat-card glass">
              <span class="material-icons-outlined stat-icon text-error">money_off</span>
              <div class="stat-value">₹{{ stats().totalFines }}</div>
              <div class="stat-label">Total Fines Paid</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card glass">
              <h4 class="mb-4 flex items-center gap-2">
                <span class="material-icons-outlined">person</span> Personal Information
              </h4>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Full Name</span>
                  <span class="info-value">{{ user?.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Username</span>
                  <span class="info-value">{{ user?.username }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ user?.email || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{{ user?.phone || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Address</span>
                  <span class="info-value">{{ user?.address || 'Not provided' }}</span>
                </div>
              </div>
            </div>

            <div class="card glass">
              <h4 class="mb-4 flex items-center gap-2">
                <span class="material-icons-outlined">notifications_active</span> Recent Notifications
              </h4>
              <div class="notifications-list" *ngIf="myNotifications().length; else noNotifs">
                <div class="notification-item" *ngFor="let n of myNotifications()">
                  <div class="notification-icon" [ngClass]="n.type">
                    <span class="material-icons-outlined">{{ n.icon }}</span>
                  </div>
                  <div class="notification-content">
                    <p class="notification-text">{{ n.message }}</p>
                    <span class="notification-time">{{ n.time }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noNotifs>
                <p class="text-sm text-muted">You're all caught up!</p>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- BORROWED BOOKS TAB -->
        <div *ngIf="activeTab() === 'borrowed'" class="tab-pane animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <h3 class="m-0">Currently Borrowed</h3>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4" *ngIf="borrowedBooks().length; else emptyBorrowed">
            <div class="book-list-item glass" *ngFor="let item of borrowedBooks()" [ngClass]="{'border-error': item.isOverdue}">
              <div class="book-cover-mini"><span class="material-icons-outlined">book</span></div>
              <div class="flex-1 min-w-0">
                <h4 class="truncate mb-1">{{ item.book?.title }}</h4>
                <p class="text-xs text-muted mb-2">{{ item.book?.author }}</p>
                <div class="text-xs flex flex-col gap-1">
                  <span><strong class="text-muted">Borrowed:</strong> {{ item.transaction.issueDate | date:'mediumDate' }}</span>
                  <span [ngClass]="{'text-status-error': item.isOverdue}"><strong class="text-muted">Due:</strong> {{ item.transaction.dueDate | date:'mediumDate' }}</span>
                </div>
              </div>
              <div class="flex flex-col justify-between items-end gap-2">
                <span class="status-pill" [ngClass]="item.isOverdue ? 'status-error' : 'status-success'">
                  {{ item.isOverdue ? 'Overdue' : 'Active' }}
                </span>
                <span class="text-xs font-bold" [ngClass]="item.isOverdue ? 'text-status-error' : 'text-status-success'">
                  {{ item.isOverdue ? (item.remainingDays * -1) + 'd overdue' : item.remainingDays + 'd left' }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #emptyBorrowed>
            <div class="text-center py-10 text-muted">
              <span class="material-icons-outlined text-4xl mb-2 opacity-50">auto_stories</span>
              <p>You have no books currently borrowed.</p>
            </div>
          </ng-template>
        </div>

        <!-- HISTORY TAB -->
        <div *ngIf="activeTab() === 'history'" class="tab-pane animate-fade-in">
          <div class="flex justify-between items-center mb-6">
            <h3 class="m-0">Borrowing History</h3>
            <div class="search-bar" style="width: 250px;">
              <span class="material-icons-outlined text-muted text-sm">search</span>
              <input type="text" placeholder="Search history..." [(ngModel)]="historySearch" style="padding-top: 0.25rem; padding-bottom: 0.25rem;">
            </div>
          </div>

          <div class="table-container glass" *ngIf="filteredHistory().length; else emptyHistory">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th class="p-4 border-b border-color text-muted font-medium text-sm">Book</th>
                  <th class="p-4 border-b border-color text-muted font-medium text-sm">Borrowed</th>
                  <th class="p-4 border-b border-color text-muted font-medium text-sm">Returned</th>
                  <th class="p-4 border-b border-color text-muted font-medium text-sm">Fine</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of filteredHistory()" class="border-b border-color last:border-0 hover:bg-white/5 transition-colors">
                  <td class="p-4">
                    <div class="font-medium text-sm">{{ item.book?.title }}</div>
                    <div class="text-xs text-muted">{{ item.book?.author }}</div>
                  </td>
                  <td class="p-4 text-sm">{{ item.transaction.issueDate | date:'shortDate' }}</td>
                  <td class="p-4 text-sm">{{ item.transaction.returnDate | date:'shortDate' }}</td>
                  <td class="p-4 text-sm font-medium" [ngClass]="{'text-status-error': item.transaction.fineAmount > 0, 'text-status-success': item.transaction.fineAmount === 0}">
                    {{ item.transaction.fineAmount > 0 ? '₹' + item.transaction.fineAmount : 'None' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #emptyHistory>
             <div class="text-center py-10 text-muted">
              <span class="material-icons-outlined text-4xl mb-2 opacity-50">history</span>
              <p>No borrowing history found.</p>
            </div>
          </ng-template>
        </div>

        <!-- REVIEWS TAB -->
        <div *ngIf="activeTab() === 'reviews'" class="tab-pane animate-fade-in">
          <h3 class="mb-6">Reviews & Ratings</h3>
          <div class="grid gap-4" *ngIf="myReviews().length; else noReviews">
            <div class="card glass" *ngFor="let review of myReviews()">
              <div class="flex justify-between items-start mb-2">
                <a [routerLink]="['/dashboard/books', review.bookId]" class="text-primary no-underline hover:underline">
                  <h4 class="m-0">{{ getBookTitle(review.bookId) }}</h4>
                </a>
                <div class="flex text-warning">
                  <span class="material-icons-outlined" style="font-size: 18px;" *ngFor="let star of [1,2,3,4,5]">
                    {{ star <= review.rating ? 'star' : 'star_border' }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-muted mb-4">"{{ review.comment }}"</p>
              <div class="flex justify-between items-center text-xs">
                <span class="text-muted">{{ review.date | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
          <ng-template #noReviews>
            <p class="text-muted">No reviews written yet.</p>
          </ng-template>
        </div>

        <!-- READING LIST TAB -->
        <div *ngIf="activeTab() === 'wishlist'" class="tab-pane animate-fade-in">
          <h3 class="mb-6">Reading List</h3>
          
          <div class="mb-8">
            <h4 class="mb-4 text-primary flex items-center gap-2">
              <span class="material-icons-outlined">menu_book</span> Currently Reading
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6" *ngIf="borrowedBooks().length; else noReading">
              <div class="card book-card glass p-0" *ngFor="let item of borrowedBooks()">
                <div class="book-cover-mini cursor-pointer" [routerLink]="['/dashboard/books', item.book?.id]" [style.backgroundImage]="item.book?.imageUrl ? 'url(' + item.book?.imageUrl + ')' : ''" [style.backgroundSize]="'cover'" [style.backgroundPosition]="'center'" style="height: 120px; border-radius: 0.5rem 0.5rem 0 0;">
                  <span *ngIf="!item.book?.imageUrl" class="material-icons-outlined">menu_book</span>
                </div>
                <div class="p-4 flex flex-col flex-1">
                  <a [routerLink]="['/dashboard/books', item.book?.id]" class="text-main no-underline hover:text-primary">
                    <h4 class="text-sm mb-1 line-clamp-2">{{ item.book?.title }}</h4>
                  </a>
                  <p class="text-xs text-muted mb-4">{{ item.book?.author }}</p>
                  <div class="mt-auto">
                    <span class="badge badge-success text-xs">Reading</span>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noReading><p class="text-muted text-sm">Not currently reading any books.</p></ng-template>
          </div>

          <div class="mb-8">
            <h4 class="mb-4 text-warning flex items-center gap-2">
              <span class="material-icons-outlined">bookmark</span> Planning to Read
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6" *ngIf="myWishlist().length; else noWishlist">
              <div class="card book-card glass p-0" *ngFor="let item of myWishlist()">
                <div class="book-cover-mini cursor-pointer" [routerLink]="['/dashboard/books', item.book?.id]" [style.backgroundImage]="item.book?.imageUrl ? 'url(' + item.book?.imageUrl + ')' : ''" [style.backgroundSize]="'cover'" [style.backgroundPosition]="'center'" style="height: 120px; border-radius: 0.5rem 0.5rem 0 0;">
                  <span *ngIf="!item.book?.imageUrl" class="material-icons-outlined">bookmark</span>
                </div>
                <div class="p-4 flex flex-col flex-1">
                  <a [routerLink]="['/dashboard/books', item.book?.id]" class="text-main no-underline hover:text-primary">
                    <h4 class="text-sm mb-1 line-clamp-2">{{ item.book?.title }}</h4>
                  </a>
                  <p class="text-xs text-muted mb-4">{{ item.book?.author }}</p>
                  <div class="mt-auto">
                    <button class="btn btn-primary btn-sm w-full" [routerLink]="['/dashboard/books', item.book?.id]">View Book</button>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noWishlist><p class="text-muted text-sm">No books planned to read.</p></ng-template>
          </div>

          <div>
            <h4 class="mb-4 text-success flex items-center gap-2">
              <span class="material-icons-outlined">task_alt</span> Completed
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6" *ngIf="completedBooks().length; else noCompleted">
              <div class="card book-card glass p-0" *ngFor="let book of completedBooks()">
                <div class="book-cover-mini cursor-pointer" [routerLink]="['/dashboard/books', book?.id]" [style.backgroundImage]="book?.imageUrl ? 'url(' + book?.imageUrl + ')' : ''" [style.backgroundSize]="'cover'" [style.backgroundPosition]="'center'" style="height: 120px; border-radius: 0.5rem 0.5rem 0 0;">
                  <span *ngIf="!book?.imageUrl" class="material-icons-outlined">task_alt</span>
                </div>
                <div class="p-4 flex flex-col flex-1">
                  <a [routerLink]="['/dashboard/books', book?.id]" class="text-main no-underline hover:text-primary">
                    <h4 class="text-sm mb-1 line-clamp-2">{{ book?.title }}</h4>
                  </a>
                  <p class="text-xs text-muted mb-4">{{ book?.author }}</p>
                  <div class="mt-auto">
                    <span class="text-xs text-success flex items-center gap-1"><span class="material-icons-outlined" style="font-size:14px;">check</span> Read</span>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noCompleted><p class="text-muted text-sm">No books completed yet.</p></ng-template>
          </div>
        </div>

        <!-- SETTINGS TAB -->
        <div *ngIf="activeTab() === 'settings'" class="tab-pane animate-fade-in">
          <h3 class="mb-6">Account Settings</h3>
          
          <div class="card glass max-w-2xl">
            <form (ngSubmit)="saveSettings()" #settingsForm="ngForm">
              <h4 class="mb-4 text-primary border-b border-color pb-2">Profile Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" [(ngModel)]="editUser.name" required>
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" [(ngModel)]="editUser.email">
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" [(ngModel)]="editUser.phone">
                </div>
                <div class="form-group">
                  <label>Department / Class</label>
                  <input type="text" name="department" placeholder="Optional">
                </div>
                <div class="form-group md:col-span-2">
                  <label>Address</label>
                  <input type="text" name="address" [(ngModel)]="editUser.address">
                </div>
              </div>

              <h4 class="mb-4 text-primary border-b border-color pb-2 mt-8">Security</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="form-group">
                  <label>New Password</label>
                  <input type="password" name="password" [(ngModel)]="editPassword" placeholder="Leave blank to keep current">
                </div>
              </div>

              <h4 class="mb-4 text-primary border-b border-color pb-2 mt-8">Notification Preferences</h4>
              <div class="flex flex-col gap-3 mb-8">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="prefNewBooks" [(ngModel)]="editPrefs.newBooks" class="accent-primary">
                  <span>New book availability alerts</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="prefDueDates" [(ngModel)]="editPrefs.dueDates" class="accent-primary">
                  <span>Email notifications for due dates</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="prefReservations" [(ngModel)]="editPrefs.reservations" class="accent-primary">
                  <span>Reserved book available alerts</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="prefOverdue" [(ngModel)]="editPrefs.overdue" class="accent-primary">
                  <span>Overdue fines and reminders</span>
                </label>
              </div>

              <div *ngIf="message" [class]="isError ? 'error-message' : 'success-message'" class="mb-4">
                <span class="material-icons-outlined">{{ isError ? 'error_outline' : 'check_circle' }}</span>
                {{ message }}
              </div>

              <div class="flex justify-end">
                <button type="submit" class="btn btn-primary" [disabled]="!settingsForm.form.valid || isLoading">
                  <span class="material-icons-outlined">save</span>
                  <span>{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      align-items: start;
    }
    @media (max-width: 768px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }
    
    /* Sidebar */
    .profile-sidebar {
      padding: 2rem 1.5rem;
      position: sticky;
      top: 2rem;
    }
    .profile-avatar-large {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 600;
      color: white;
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
    }
    .status-indicator {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 3px solid var(--bg-card);
    }
    .bg-success { background-color: var(--status-success); }
    .bg-error { background-color: var(--status-error); }
    
    .profile-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 2rem;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .nav-btn:hover {
      background: var(--bg-card-hover);
      color: var(--text-main);
    }
    .nav-btn.active {
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent);
      color: var(--primary);
      border-left: 3px solid var(--primary);
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .nav-count {
      margin-left: auto;
      background: var(--primary);
      color: white;
      font-size: 0.7rem;
      padding: 0.1rem 0.5rem;
      border-radius: 9999px;
      font-weight: bold;
    }

    /* Content Area */
    .stat-card {
      padding: 1.5rem;
      text-align: center;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.8;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Info List */
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .info-item:last-child { border-bottom: none; padding-bottom: 0; }
    .info-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem; }
    .info-value { font-size: 0.95rem; font-weight: 500; }

    /* Notifications */
    .notifications-list { display: flex; flex-direction: column; gap: 1rem; }
    .notification-item { display: flex; gap: 1rem; align-items: flex-start; }
    .notification-icon {
      width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .notification-icon.warning { background: rgba(239, 68, 68, 0.1); color: var(--status-error); }
    .notification-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .notification-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--status-success); }
    .notification-text { font-size: 0.9rem; margin-bottom: 0.25rem; line-height: 1.4; }
    .notification-time { font-size: 0.75rem; color: var(--text-muted); }

    /* Borrowed Books */
    .book-list-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 1rem;
      align-items: stretch;
    }
    .book-cover-mini {
      width: 60px;
      background: var(--accent-gradient);
      border-radius: 0.5rem;
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .border-error { border: 1px solid rgba(239, 68, 68, 0.3); }

    .status-pill {
      display: inline-flex; align-items: center; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600;
    }
    .status-success { background: rgba(16, 185, 129, 0.1); color: var(--status-success); }
    .status-error { background: rgba(239, 68, 68, 0.1); color: var(--status-error); }

    /* Forms */
    .btn-text { background: transparent; border: none; cursor: pointer; font-weight: 500; font-size: 0.85rem; }
    .btn-text:hover { text-decoration: underline; }
    .error-message { color: var(--status-error); display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.5rem; }
    .success-message { color: var(--status-success); display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-radius: 0.5rem; }
    
    .border-color { border-color: var(--border-color); }
    .text-primary { color: var(--primary); }
    .text-success { color: var(--status-success); }
    .text-warning { color: #f59e0b; }
    .text-error { color: var(--status-error); }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class ProfileComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  
  user: any;
  activeTab = signal<Tab>('overview');
  historySearch = '';

  editUser: any = {};
  editPassword = '';
  message = '';
  isError = false;
  isLoading = false;

  editPrefs = {
    newBooks: true,
    dueDates: true,
    reservations: true,
    overdue: true
  };
  prefs = signal({
    newBooks: true,
    dueDates: true,
    reservations: true,
    overdue: true
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.dataService.users().find(u => u.id === id);
        if (found) {
          this.user = found;
        } else {
          this.user = this.dataService.currentUser();
        }
      } else {
        this.user = this.dataService.currentUser();
      }
      if (this.user) {
        this.editUser = { ...this.user };
        const savedPrefs = localStorage.getItem('lexora-prefs-' + this.user.id);
        if (savedPrefs) {
          try {
            const p = JSON.parse(savedPrefs);
            this.editPrefs = { ...p };
            this.prefs.set({ ...p });
          } catch(e) {}
        }
      }
    });
  }

  isCurrentUser() {
    return this.dataService.currentUser()?.id === this.user?.id;
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.message = ''; // clear any messages
  }

  // Computed data
  borrowedBooks = computed(() => {
    const userId = this.user?.id;
    if (!userId) return [];
    
    return this.dataService.transactions()
      .filter(t => t.memberId === userId && t.status === 'Issued')
      .map(t => {
        const book = this.dataService.books().find(b => b.id === t.bookId);
        const today = new Date();
        today.setHours(0,0,0,0);
        const due = new Date(t.dueDate);
        due.setHours(0,0,0,0);
        const diffTime = due.getTime() - today.getTime();
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { transaction: t, book, remainingDays, isOverdue: remainingDays < 0 };
      })
      .sort((a, b) => a.remainingDays - b.remainingDays);
  });

  filteredHistory = computed(() => {
    const userId = this.user?.id;
    if (!userId) return [];
    
    const query = this.historySearch.toLowerCase();
    
    return this.dataService.transactions()
      .filter(t => t.memberId === userId && t.status === 'Returned')
      .map(t => ({ transaction: t, book: this.dataService.books().find(b => b.id === t.bookId) }))
      .filter(item => item.book?.title.toLowerCase().includes(query) || item.book?.author.toLowerCase().includes(query))
      .sort((a, b) => new Date(b.transaction.returnDate!).getTime() - new Date(a.transaction.returnDate!).getTime());
  });

  stats = computed(() => {
    const userId = this.user?.id;
    if (!userId) return { totalBorrowed: 0, totalFines: 0, reviewsWritten: 0 };
    
    const allTxs = this.dataService.transactions().filter(t => t.memberId === userId);
    const fines = allTxs.reduce((sum, t) => sum + (t.fineAmount || 0), 0);
    const revs = this.dataService.reviews().filter(r => r.memberId === userId).length;
    
    return {
      totalBorrowed: allTxs.length,
      totalFines: fines,
      reviewsWritten: revs
    };
  });

  myReviews = computed(() => {
    const userId = this.user?.id;
    if (!userId) return [];
    return this.dataService.reviews().filter(r => r.memberId === userId)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  getBookTitle(bookId: string): string {
    return this.dataService.books().find(b => b.id === bookId)?.title || 'Unknown Book';
  }

  myWishlist = computed(() => {
    const userId = this.user?.id;
    if (!userId) return [];
    return this.dataService.wishlist().filter(w => w.memberId === userId).map(w => {
      return { ...w, book: this.dataService.books().find(b => b.id === w.bookId) };
    });
  });

  completedBooks = computed(() => {
    const userId = this.user?.id;
    if (!userId) return [];
    
    // Get unique books from returned transactions
    const returnedTxs = this.dataService.transactions().filter(t => t.memberId === userId && t.status === 'Returned');
    const bookIds = Array.from(new Set(returnedTxs.map(t => t.bookId)));
    
    return bookIds.map(id => this.dataService.books().find(b => b.id === id)).filter(b => !!b);
  });

  myNotifications = computed(() => this.dataService.myNotifications());

  async saveSettings() {
    this.message = '';
    this.isError = false;
    
    if (!this.user) return;
    this.isLoading = true;
    
    const updatedUser = { ...this.user, ...this.editUser };
    if (this.editPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!passwordRegex.test(this.editPassword)) {
        this.message = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
        this.isError = true;
        this.isLoading = false;
        return;
      }
      updatedUser.password = this.editPassword;
    }

    try {
      await this.dataService.updateMember(updatedUser);
      this.dataService.currentUser.set(updatedUser);
      this.user = updatedUser;
      
      this.prefs.set({ ...this.editPrefs });
      localStorage.setItem('lexora-prefs-' + this.user.id, JSON.stringify(this.editPrefs));
      
      this.message = 'Profile settings updated successfully.';
      this.isError = false;
      this.editPassword = ''; 
    } catch (e) {
      this.message = 'Failed to update profile. Please try again.';
      this.isError = true;
    } finally {
      this.isLoading = false;
    }
  }
}
