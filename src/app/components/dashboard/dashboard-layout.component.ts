import { Component, inject, computed, OnInit, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="app-layout">
      <!-- Top Navbar -->
      <header class="navbar">
        <div class="navbar-brand">
          <span class="material-icons-outlined text-gradient" style="font-size: 2rem;">account_balance</span>
          <h2 class="text-gradient" style="margin: 0; font-size: 1.5rem;">Lexora Archives</h2>
        </div>

        <nav class="navbar-links">
          <a routerLink="/dashboard/overview" routerLinkActive="active" class="nav-item">
            Overview
          </a>
          
          <a routerLink="/dashboard/books" routerLinkActive="active" class="nav-item">
            Catalog
          </a>

          <a routerLink="/dashboard/leaderboard" routerLinkActive="active" class="nav-item">
            Leaderboard
          </a>

          <a *ngIf="isLibrarianOrAdmin()" routerLink="/dashboard/members" routerLinkActive="active" class="nav-item">
            Members
          </a>

          <a *ngIf="isLibrarianOrAdmin()" routerLink="/dashboard/transactions" routerLinkActive="active" class="nav-item">
            Issue & Return
          </a>
          
          <a *ngIf="user()?.role === 'Member'" routerLink="/dashboard/my-books" routerLinkActive="active" class="nav-item">
            My Books
          </a>
        </nav>

        <div class="flex items-center gap-4">
          <div class="search-bar">
            <span class="material-icons-outlined text-muted">search</span>
            <input type="text" placeholder="Search... (Press Enter)"
                   [(ngModel)]="globalSearch"
                   (keyup.enter)="onGlobalSearch()">
          </div>

          <!-- Notifications -->
          <div style="position: relative;">
            <button class="btn-icon" style="position: relative;" (click)="showNotifications = !showNotifications" title="Notifications">
              <span class="material-icons-outlined">notifications</span>
              <span *ngIf="notifications().length > 0" class="notif-badge">
                {{ notifications().length }}
              </span>
            </button>
            
            <div *ngIf="showNotifications" class="notif-dropdown glass animate-fade-in">
              <div class="notif-header flex justify-between items-center">
                <h3 style="margin: 0; font-size: 1rem;">Notifications</h3>
                <button class="btn-icon" style="padding: 2px;" (click)="showNotifications = false">
                  <span class="material-icons-outlined text-muted" style="font-size: 18px;">close</span>
                </button>
              </div>
              <div class="notif-body" *ngIf="notifications().length > 0; else noNotifs">
                <div class="notification-item" *ngFor="let n of notifications()">
                  <div class="notification-icon" [ngClass]="n.type">
                    <span class="material-icons-outlined" style="font-size: 20px;">{{ n.icon }}</span>
                  </div>
                  <div class="notification-content">
                    <p class="notification-text" style="margin:0; font-size: 0.85rem; line-height:1.4;">{{ n.message }}</p>
                    <span class="notification-time" style="font-size: 0.75rem; color: var(--text-muted);">{{ n.time }}</span>
                  </div>
                </div>
              </div>
              <ng-template #noNotifs>
                <div class="notif-empty text-muted text-center" style="padding: 2rem 1rem;">
                  <p>You're all caught up!</p>
                </div>
              </ng-template>
              <div class="notif-footer text-center" style="padding: 0.75rem; border-top: 1px solid var(--border-color); background: var(--bg-card-hover);" (click)="showNotifications = false">
                <a routerLink="/dashboard/profile" class="text-primary no-underline font-medium text-sm hover:underline">Notification Settings</a>
              </div>
            </div>
          </div>

          <!-- Theme Toggle -->
          <button class="btn-icon" (click)="toggleTheme()" [title]="isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span class="material-icons-outlined">{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</span>
          </button>

          <!-- User Profile Dropdown / Area -->
          <div class="user-profile flex items-center gap-2">
            <div class="avatar" style="cursor: pointer;" routerLink="/dashboard/profile" title="View Profile">
              {{ user()?.name?.charAt(0) || 'U' }}
            </div>
            <button class="btn-icon text-status-error" (click)="logout()" title="Logout" style="color: var(--status-error);">
              <span class="material-icons-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="main-content">
        <div class="content-area animate-fade-in">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .notif-badge {
      position: absolute;
      top: 0px;
      right: 0px;
      background: var(--status-error);
      color: white;
      font-size: 0.65rem;
      font-weight: bold;
      border-radius: 9999px;
      padding: 0.15rem 0.35rem;
      border: 2px solid var(--bg-card);
      line-height: 1;
      min-width: 18px;
      text-align: center;
    }
    .notif-dropdown {
      position: absolute;
      top: 100%;
      right: -60px; /* shift slightly to align with the bell since it's far right */
      margin-top: 0.5rem;
      width: 320px;
      border-radius: 1rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      z-index: 100;
      overflow: hidden;
    }
    .notif-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-card-hover);
    }
    .notif-body {
      max-height: 350px;
      overflow-y: auto;
      background: var(--bg-card);
    }
    .notification-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    .notification-item:last-child {
      border-bottom: none;
    }
    .notification-item:hover {
      background: var(--bg-card-hover);
    }
    .notification-icon {
      width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .notification-icon.warning { background: rgba(239, 68, 68, 0.1); color: var(--status-error); }
    .notification-icon.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .notification-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--status-success); }
  `]
})
export class DashboardLayoutComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);

  user = this.dataService.currentUser;
  notifications = this.dataService.myNotifications;
  globalSearch = '';
  isDarkTheme = true; // default to dark theme since it was original
  showNotifications = false;

  ngOnInit() {
    // Load theme preference from localStorage if it exists
    const savedTheme = localStorage.getItem('lexora-theme');
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
    } else {
      // Default dark
      this.isDarkTheme = true;
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('lexora-theme', this.isDarkTheme ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkTheme) {
      this.renderer.setAttribute(this.document.documentElement, 'data-theme', 'dark');
    } else {
      this.renderer.removeAttribute(this.document.documentElement, 'data-theme'); // default root is light
    }
  }

  isLibrarianOrAdmin() {
    const role = this.user()?.role;
    return role === 'Librarian' || role === 'Admin';
  }

  onGlobalSearch() {
    if (this.globalSearch.trim()) {
      this.router.navigate(['/dashboard/books'], { queryParams: { q: this.globalSearch.trim() } });
      this.globalSearch = ''; // Clear search bar after navigating
    }
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }
}
