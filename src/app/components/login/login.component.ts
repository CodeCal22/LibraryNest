import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card glass animate-fade-in">
        <div class="login-header">
          <span class="material-icons-outlined login-icon text-gradient">local_library</span>
          <h1 class="text-gradient">Nexus LMS</h1>
          <p>Login to access the library system</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" [(ngModel)]="username" required placeholder="Enter your username (e.g. admin or librarian1)">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required placeholder="Enter your password (e.g. password)">
          </div>

          <div *ngIf="error" class="error-message">
            <span class="material-icons-outlined">error_outline</span>
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary w-100" [disabled]="!loginForm.form.valid">
            <span>Sign In</span>
            <span class="material-icons-outlined">arrow_forward</span>
          </button>
          
          <div class="footer-links">
            <p>Don't have an account? <a routerLink="/signup" class="text-gradient">Sign up here</a></p>
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
      box-shadow: var(--shadow-lg), 0 0 40px rgba(139, 92, 246, 0.1);
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
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  private router = inject(Router);
  private dataService = inject(DataService);

  async onSubmit() {
    const success = await this.dataService.login(this.username, this.password);
    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid username or password';
    }
  }
}
