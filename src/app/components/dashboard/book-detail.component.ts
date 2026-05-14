import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="book-detail-container animate-fade-in" *ngIf="book()">
      
      <!-- Back Button -->
      <button class="btn-text mb-6 flex items-center gap-2" (click)="goBack()">
        <span class="material-icons-outlined">arrow_back</span> Back to Catalog
      </button>

      <!-- Book Header -->
      <div class="card glass flex flex-col md:flex-row gap-8 mb-8">
        <div class="book-cover-large" [style.backgroundImage]="book()?.imageUrl ? 'url(' + book()?.imageUrl + ')' : ''" [style.backgroundSize]="'cover'" [style.backgroundPosition]="'center'">
          <span *ngIf="!book()?.imageUrl" class="material-icons-outlined">menu_book</span>
        </div>
        
        <div class="flex-1 flex flex-col">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-gradient mb-2" style="font-size: 2.5rem; line-height: 1.2;">{{ book()?.title }}</h1>
              <h3 class="text-muted mb-4">{{ book()?.author }}</h3>
            </div>
            <span class="badge" [ngClass]="book()?.availableCopies! > 0 ? 'badge-success' : 'badge-error'" style="font-size: 1rem; padding: 0.5rem 1rem;">
              {{ book()?.availableCopies! > 0 ? 'Available (' + book()?.availableCopies + ' left)' : 'Out of Stock' }}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 mt-4">
            <div>
              <p class="text-xs text-muted uppercase">Category</p>
              <p class="font-medium">{{ book()?.category }}</p>
            </div>
            <div>
              <p class="text-xs text-muted uppercase">Publisher</p>
              <p class="font-medium">{{ book()?.publisher }}</p>
            </div>
            <div>
              <p class="text-xs text-muted uppercase">ISBN</p>
              <p class="font-medium">{{ book()?.isbn }}</p>
            </div>
            <div>
              <p class="text-xs text-muted uppercase">Edition</p>
              <p class="font-medium">{{ book()?.edition }}</p>
            </div>
            <div>
              <p class="text-xs text-muted uppercase">Shelf Location</p>
              <p class="font-medium">{{ book()?.shelfLocation }}</p>
            </div>
            <div>
              <p class="text-xs text-muted uppercase">Total Copies</p>
              <p class="font-medium">{{ book()?.totalCopies }}</p>
            </div>
          </div>
          
          <div class="mt-auto pt-6 border-t border-color flex gap-4">
            <button class="btn btn-primary" *ngIf="book()?.availableCopies! > 0" (click)="issueBook()">
              <span class="material-icons-outlined">library_add</span> Borrow Book
            </button>
            <button class="btn btn-secondary" *ngIf="book()?.availableCopies === 0" (click)="reserveBook()">
              <span class="material-icons-outlined">bookmark_add</span> Reserve
            </button>
            <button class="btn btn-secondary" (click)="toggleWishlist()">
              <span class="material-icons-outlined">{{ inWishlist() ? 'bookmark' : 'bookmark_border' }}</span>
              {{ inWishlist() ? 'Remove from Planned' : 'Plan to Read' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="mb-10">
        <h3 class="mb-4">About this Book</h3>
        <p class="text-muted leading-relaxed whitespace-pre-wrap">{{ book()?.description || 'No description available for this book.' }}</p>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <h3 class="mb-6 flex items-center gap-2">
          <span class="material-icons-outlined text-warning">star</span> 
          Community Reviews
          <span class="text-sm font-normal text-muted ml-2">({{ bookReviews().length }})</span>
        </h3>

        <!-- Write a Review (Only if borrowed) -->
        <div class="card glass mb-8" *ngIf="hasBorrowed() && !hasReviewed()">
          <h4 class="mb-4 text-primary">Write a Review</h4>
          <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
            <div class="mb-4">
              <label class="block mb-2">Rating</label>
              <div class="flex gap-2">
                <span class="material-icons-outlined cursor-pointer" style="font-size: 28px;"
                      *ngFor="let star of [1,2,3,4,5]" 
                      [ngClass]="star <= newReviewRating ? 'text-warning' : 'text-muted'"
                      (click)="newReviewRating = star"
                      (mouseenter)="hoverRating = star"
                      (mouseleave)="hoverRating = 0">
                  {{ star <= (hoverRating || newReviewRating) ? 'star' : 'star_border' }}
                </span>
              </div>
            </div>
            <div class="form-group mb-4">
              <label>Your Review</label>
              <textarea rows="3" name="comment" [(ngModel)]="newReviewComment" required placeholder="What did you think of the book?"></textarea>
            </div>
            <div class="flex justify-end">
              <button type="submit" class="btn btn-primary" [disabled]="!reviewForm.form.valid || newReviewRating === 0 || isSubmittingReview">
                Post Review
              </button>
            </div>
          </form>
        </div>

        <!-- Reviews List -->
        <div class="grid gap-4" *ngIf="bookReviews().length > 0; else noReviews">
          <div class="card glass" *ngFor="let review of bookReviews()">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-3">
                <div class="reviewer-avatar">{{ getReviewerName(review.memberId).charAt(0) }}</div>
                <div>
                  <h4 class="m-0 text-sm">{{ getReviewerName(review.memberId) }}</h4>
                  <div class="flex text-warning mt-1">
                    <span class="material-icons-outlined" style="font-size: 14px;" *ngFor="let star of [1,2,3,4,5]">
                      {{ star <= review.rating ? 'star' : 'star_border' }}
                    </span>
                  </div>
                </div>
              </div>
              <span class="text-xs text-muted">{{ review.date | date:'mediumDate' }}</span>
            </div>
            <p class="text-sm mt-3 leading-relaxed text-muted">{{ review.comment }}</p>
          </div>
        </div>
        <ng-template #noReviews>
          <div class="text-center py-8 card glass border-dashed">
            <span class="material-icons-outlined text-muted text-4xl mb-2 opacity-50">rate_review</span>
            <p class="text-muted">No reviews yet for this book.</p>
          </div>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    .book-cover-large {
      width: 200px;
      height: 300px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
      box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }
    .book-cover-large .material-icons-outlined {
      font-size: 6rem;
      opacity: 0.9;
    }
    .border-dashed {
      border: 2px dashed var(--border-color);
    }
    .reviewer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-card-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: var(--primary);
    }
    .btn-text {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-weight: 500;
      transition: color 0.2s;
    }
    .btn-text:hover {
      color: var(--primary);
    }
    textarea {
      width: 100%;
      background: var(--bg-main);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      resize: vertical;
    }
    textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }
  `]
})
export class BookDetailComponent implements OnInit {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  bookId = signal<string>('');
  
  newReviewRating = 0;
  hoverRating = 0;
  newReviewComment = '';
  isSubmittingReview = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookId.set(id);
      }
    });
  }

  book = computed(() => {
    return this.dataService.books().find(b => b.id === this.bookId());
  });

  bookReviews = computed(() => {
    return this.dataService.reviews()
      .filter(r => r.bookId === this.bookId())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  hasBorrowed = computed(() => {
    const user = this.dataService.currentUser();
    if (!user) return false;
    // Check if user has ever borrowed this book
    return this.dataService.transactions().some(t => t.memberId === user.id && t.bookId === this.bookId());
  });

  hasReviewed = computed(() => {
    const user = this.dataService.currentUser();
    if (!user) return false;
    return this.bookReviews().some(r => r.memberId === user.id);
  });

  inWishlist = computed(() => {
    const user = this.dataService.currentUser();
    if (!user) return false;
    return this.dataService.wishlist().some(w => w.memberId === user.id && w.bookId === this.bookId());
  });

  getReviewerName(memberId: string): string {
    const user = this.dataService.users().find(u => u.id === memberId);
    return user ? user.name : 'Unknown User';
  }

  goBack() {
    window.history.back();
  }

  async issueBook() {
    const user = this.dataService.currentUser();
    if (!user) return;
    
    // We remove confirm() to match the 'simple alert style message' requirement for better UX, or keep it. The user said 'change every website popup messages', so confirm is out too.
    const success = await this.dataService.issueBook(user.id, this.bookId());
    if (success) {
      this.toastService.success('Book borrowed successfully!');
    } else {
      this.toastService.error('Could not borrow book. Limit reached or unavailable.');
    }
  }

  async reserveBook() {
    const user = this.dataService.currentUser();
    if (!user) return;
    await this.dataService.reserveBook(user.id, this.bookId());
    this.toastService.success('Book reserved successfully!');
  }

  async toggleWishlist() {
    const user = this.dataService.currentUser();
    if (!user) return;
    await this.dataService.toggleWishlist(user.id, this.bookId());
  }

  async submitReview() {
    const user = this.dataService.currentUser();
    if (!user) return;

    this.isSubmittingReview = true;
    try {
      await this.dataService.addReview({
        bookId: this.bookId(),
        memberId: user.id,
        rating: this.newReviewRating,
        comment: this.newReviewComment
      });
      // Reset form
      this.newReviewRating = 0;
      this.newReviewComment = '';
      this.toastService.success('Review posted successfully!');
    } catch (e) {
      this.toastService.error('Failed to post review.');
    } finally {
      this.isSubmittingReview = false;
    }
  }
}
