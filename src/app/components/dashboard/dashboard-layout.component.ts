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
  `
})
export class DashboardLayoutComponent implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);

  user = this.dataService.currentUser;
  globalSearch = '';
  isDarkTheme = true; // default to dark theme since it was original

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
