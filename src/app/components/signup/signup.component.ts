import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card glass animate-fade-in">
        <div class="login-header">
          <span class="material-icons-outlined login-icon text-gradient">account_balance</span>
          <h1 class="text-gradient">Join Lexora</h1>
          <p>Create your archives account</p>
        </div>

        <form (ngSubmit)="onSubmit()" #signupForm="ngForm">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" [(ngModel)]="name" required placeholder="Enter your full name">
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" [(ngModel)]="username" required placeholder="Choose a username">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required placeholder="Create a password">
          </div>

          <div *ngIf="error" class="error-message">
            <span class="material-icons-outlined">error_outline</span>
            {{ error }}
          </div>
          
          <div *ngIf="successMessage" class="success-message">
            <span class="material-icons-outlined">check_circle</span>
            {{ successMessage }}
          </div>

          <button type="submit" class="btn btn-primary w-100" [disabled]="!signupForm.form.valid || isLoading">
            <span>{{ isLoading ? 'Creating...' : 'Sign Up' }}</span>
            <span *ngIf="!isLoading" class="material-icons-outlined">arrow_forward</span>
          </button>
          
          <div class="footer-links">
            <p>Already have an account? <a routerLink="/login" class="text-gradient">Sign in here</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: radial-gradient(circle at center, var(--bg-card-hover) 0%, var(--bg-main) 100%);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 3rem 2.5rem;
      border-radius: 1.5rem;
      box-shadow: var(--shadow-lg), 0 0 40px rgba(212, 175, 55, 0.1);
    }
    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .login-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .login-header h1 {
      font-size: 2.25rem;
      margin-bottom: 0.5rem;
    }
    .w-100 {
      width: 100%;
      margin-top: 1.5rem;
    }
    .error-message {
      color: var(--status-error);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 0.5rem;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .success-message {
      color: var(--status-success);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 0.5rem;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .footer-links {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .footer-links a {
      font-weight: 500;
      text-decoration: none;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class SignupComponent {
  name = '';
  username = '';
  password = '';
  error = '';
  successMessage = '';
  isLoading = false;

  private router = inject(Router);
  private dataService = inject(DataService);

  async onSubmit() {
    this.error = '';
    this.successMessage = '';
    
    // basic check
    if (this.dataService.users().find(u => u.username === this.username)) {
      this.error = 'Username already exists.';
      return;
    }

    this.isLoading = true;
    try {
      await this.dataService.addMember({
        username: this.username,
        password: this.password,
        name: this.name,
        role: 'Member',
        status: 'Active'
      });
      
      this.successMessage = 'Account created successfully! Redirecting...';
      
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } catch (e) {
      this.error = 'Failed to create account. Please try again later.';
    } finally {
      this.isLoading = false;
    }
  }
}
