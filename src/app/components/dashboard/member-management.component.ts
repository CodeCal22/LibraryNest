import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { User, Role } from '../../models';

@Component({
  selector: 'app-member-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="members-container">
      <div class="flex justify-between items-center mb-6">
        <h2>Member Management</h2>
        <button class="btn btn-primary" (click)="openAddModal()">
          <span class="material-icons-outlined">person_add</span> Add New Member
        </button>
      </div>

      <div class="card glass">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let member of members()">
                <td>#{{ member.id }}</td>
                <td class="font-bold">{{ member.name }}</td>
                <td>{{ member.username }}</td>
                <td>{{ member.role }}</td>
                <td>
                  <span class="badge" [ngClass]="{'badge-success': member.status === 'Active', 'badge-error': member.status === 'Suspended'}">
                    {{ member.status }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn-icon" (click)="openEditModal(member)">
                      <span class="material-icons-outlined text-muted">edit</span>
                    </button>
                    <button class="btn-icon" *ngIf="member.status === 'Active'" (click)="toggleStatus(member)" title="Suspend Member">
                      <span class="material-icons-outlined text-status-warning">block</span>
                    </button>
                    <button class="btn-icon" *ngIf="member.status === 'Suspended'" (click)="toggleStatus(member)" title="Activate Member">
                      <span class="material-icons-outlined text-status-success">check_circle</span>
                    </button>
                    <button class="btn-icon" (click)="deleteMember(member.id)" title="Delete Member">
                      <span class="material-icons-outlined text-status-error">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Member Modal -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="card glass modal-content animate-fade-in">
          <h3 class="mb-4">{{ isEditing() ? 'Edit Member' : 'Add New Member' }}</h3>
          
          <form (ngSubmit)="saveMember()" #memberForm="ngForm">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" name="name" [(ngModel)]="currentMember.name" required>
              </div>
              <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" [(ngModel)]="currentMember.username" required>
              </div>
              <div class="form-group">
                <label>Role</label>
                <select name="role" [(ngModel)]="currentMember.role" required>
                  <option value="Member">Member</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select name="status" [(ngModel)]="currentMember.status" required>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div class="form-group col-span-2" *ngIf="!isEditing() || updatePassword()">
                <label>Password</label>
                <input type="password" name="password" [(ngModel)]="currentMember.password" [required]="!isEditing()">
              </div>
              <div class="form-group col-span-2" *ngIf="isEditing()">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--accent-primary);">
                  <input type="checkbox" [(ngModel)]="shouldUpdatePassword" name="updatePass" style="width: auto;"> 
                  Update Password
                </label>
              </div>
            </div>

            <div class="flex gap-4 mt-6 justify-end">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!memberForm.form.valid">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-status-warning { color: var(--status-warning); }
    .text-status-success { color: var(--status-success); }
    .text-status-error { color: var(--status-error); }
    
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
    }
    .col-span-2 { grid-column: span 2 / span 2; }
  `]
})
export class MemberManagementComponent {
  private dataService = inject(DataService);

  members = this.dataService.users;
  
  showModal = signal(false);
  isEditing = signal(false);
  shouldUpdatePassword = false;
  
  currentMember: Partial<User> = {};

  updatePassword() {
    return this.shouldUpdatePassword;
  }

  async toggleStatus(member: any) {
    const newStatus = member.status === 'Active' ? 'Suspended' : 'Active';
    await this.dataService.updateMember({ ...member, status: newStatus });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.shouldUpdatePassword = true;
    this.currentMember = { role: 'Member', status: 'Active' };
    this.showModal.set(true);
  }

  openEditModal(member: User) {
    this.isEditing.set(true);
    this.shouldUpdatePassword = false;
    this.currentMember = { ...member };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentMember = {};
  }

  async saveMember() {
    // Basic validations
    if (this.isEditing()) {
      const userToSave = { ...this.currentMember } as User;
      if (!this.shouldUpdatePassword) {
        // Find existing password if not updated
        const existing = this.members().find(m => m.id === userToSave.id);
        userToSave.password = existing?.password;
      }
      await this.dataService.updateMember(userToSave);
    } else {
      await this.dataService.addMember(this.currentMember as Omit<User, 'id'>);
    }
    this.closeModal();
  }

  async deleteMember(id: string) {
    if(confirm('Are you sure you want to delete this member?')) {
      await this.dataService.deleteMember(id);
    }
  }
}
