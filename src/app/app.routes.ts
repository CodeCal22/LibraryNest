import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardLayoutComponent } from './components/dashboard/dashboard-layout.component';
import { OverviewComponent } from './components/dashboard/overview.component';
import { BookCatalogComponent } from './components/dashboard/book-catalog.component';
import { MemberManagementComponent } from './components/dashboard/member-management.component';
import { IssueReturnComponent } from './components/dashboard/issue-return.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProfileComponent } from './components/dashboard/profile.component';
import { MyBooksComponent } from './components/dashboard/my-books.component';
import { BookDetailComponent } from './components/dashboard/book-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'books', component: BookCatalogComponent },
      { path: 'books/:id', component: BookDetailComponent },
      { path: 'members', component: MemberManagementComponent },
      { path: 'transactions', component: IssueReturnComponent },
      { path: 'my-books', component: MyBooksComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:id', component: ProfileComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
