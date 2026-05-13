import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header-section">
      <h1 class="page-title text-gradient">My Profile</h1>
      <p class="text-muted">Manage your personal information and account settings</p>
    </div>

    <div class="content-grid" style="max-width: 600px;">
      <div class="card glass animate-fade-in" style="animation-delay: 0.1s;">
        <div class="profile-header">
          <div class="profile-avatar">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <h2 style="margin: 0; font-size: 1.5rem;">{{ user?.name }}</h2>
            <p class="text-muted" style="margin-top: 0.25rem;">{{ user?.role }} | <span [ngClass]="user?.status === 'Active' ? 'status-pill status-success' : 'status-pill status-error'">{{ user?.status }}</span></p>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" #profileForm="ngForm" style="margin-top: 2rem;">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" [(ngModel)]="editName" required>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" [value]="user?.username" disabled class="disabled-input">
            <small class="text-muted">Usernames cannot be changed.</small>
          </div>

          <div class="form-group">
            <label for="password">New Password (leave blank to keep current)</label>
            <input type="password" id="password" name="password" [(ngModel)]="editPassword" placeholder="Enter new password">
          </div>

          <div *ngIf="message" [class]="isError ? 'error-message' : 'success-message'">
            <span class="material-icons-outlined">{{ isError ? 'error_outline' : 'check_circle' }}</span>
            {{ message }}
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
            <button type="submit" class="btn btn-primary" [disabled]="!profileForm.form.valid || isLoading">
              <span class="material-icons-outlined">save</span>
              <span>{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .profile-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 600;
      color: white;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
    }
    .disabled-input {
      opacity: 0.7;
      cursor: not-allowed;
      background: var(--bg-main);
    }
    .error-message {
      color: var(--status-error);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
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
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 0.5rem;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
  `]
})
export class ProfileComponent implements OnInit {
  private dataService = inject(DataService);
  
  user: any;
  editName = '';
  editPassword = '';
  
  message = '';
  isError = false;
  isLoading = false;

  ngOnInit() {
    this.user = this.dataService.currentUser();
    if (this.user) {
      this.editName = this.user.name;
    }
  }

  async onSubmit() {
    this.message = '';
    this.isError = false;
    
    if (!this.user) return;

    this.isLoading = true;
    
    const updatedUser = {
      ...this.user,
      name: this.editName,
    };

    if (this.editPassword) {
      updatedUser.password = this.editPassword;
    }

    try {
      await this.dataService.updateMember(updatedUser);
      // Update local current user state since it was modified
      this.dataService.currentUser.set(updatedUser);
      this.user = updatedUser;
      
      this.message = 'Profile updated successfully.';
      this.isError = false;
      this.editPassword = ''; // clear password field
    } catch (e) {
      this.message = 'Failed to update profile. Please try again.';
      this.isError = true;
    } finally {
      this.isLoading = false;
    }
  }
}
