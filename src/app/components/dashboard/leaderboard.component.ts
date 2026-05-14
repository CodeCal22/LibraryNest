import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="leaderboard-container animate-fade-in">
      <div class="text-center mb-10">
        <h1 class="text-gradient" style="font-size: 3rem; margin-bottom: 0.5rem;">Reading Champions</h1>
        <p class="text-muted text-lg">Top readers and their favorite genres</p>
      </div>

      <!-- Top 3 Podium -->
      <div class="podium-container mb-12" *ngIf="leaderboardData().length >= 3">
        <!-- Rank 2 -->
        <div class="podium-item rank-2 glass">
          <div class="medal silver">2</div>
          <div class="avatar-large">{{ leaderboardData()[1].user.name.charAt(0) }}</div>
          <h3 class="mt-4 mb-1 truncate w-full">{{ leaderboardData()[1].user.name }}</h3>
          <div class="badge badge-silver mb-3">{{ leaderboardData()[1].rankTitle }}</div>
          <div class="text-2xl font-bold text-gradient">{{ leaderboardData()[1].booksReadCount }}</div>
          <div class="text-xs text-muted uppercase">Books Read</div>
        </div>
        
        <!-- Rank 1 -->
        <div class="podium-item rank-1 glass">
          <div class="medal gold">1</div>
          <span class="material-icons-outlined crown text-warning">emoji_events</span>
          <div class="avatar-large highlight">{{ leaderboardData()[0].user.name.charAt(0) }}</div>
          <h3 class="mt-4 mb-1 truncate w-full">{{ leaderboardData()[0].user.name }}</h3>
          <div class="badge badge-gold mb-3">{{ leaderboardData()[0].rankTitle }}</div>
          <div class="text-3xl font-bold text-gradient">{{ leaderboardData()[0].booksReadCount }}</div>
          <div class="text-xs text-muted uppercase">Books Read</div>
        </div>

        <!-- Rank 3 -->
        <div class="podium-item rank-3 glass">
          <div class="medal bronze">3</div>
          <div class="avatar-large">{{ leaderboardData()[2].user.name.charAt(0) }}</div>
          <h3 class="mt-4 mb-1 truncate w-full">{{ leaderboardData()[2].user.name }}</h3>
          <div class="badge badge-bronze mb-3">{{ leaderboardData()[2].rankTitle }}</div>
          <div class="text-2xl font-bold text-gradient">{{ leaderboardData()[2].booksReadCount }}</div>
          <div class="text-xs text-muted uppercase">Books Read</div>
        </div>
      </div>

      <!-- Full List -->
      <div class="card glass">
        <h3 class="mb-6 border-b border-color pb-4">Global Rankings</h3>
        
        <div class="leaderboard-list">
          <div class="leaderboard-row" *ngFor="let entry of leaderboardData(); let i = index">
            <div class="rank-number" [ngClass]="{'text-warning': i===0, 'text-muted': i>2}">
              #{{ i + 1 }}
            </div>
            
            <div class="flex-1 flex items-center gap-4">
              <div class="avatar-small">{{ entry.user.name.charAt(0) }}</div>
              <div>
                <a [routerLink]="['/dashboard/profile', entry.user.id]" class="text-main no-underline hover:text-primary font-medium text-lg">
                  {{ entry.user.name }}
                </a>
                <div class="text-xs text-muted mt-1">{{ entry.rankTitle }}</div>
              </div>
            </div>

            <div class="genres-section hidden md:flex gap-2 flex-1 flex-wrap">
              <span class="genre-badge" *ngFor="let g of entry.genres.slice(0,3)">
                {{ g.name }} <strong class="text-main">{{ g.count }}</strong>
              </span>
              <span class="text-xs text-muted self-center" *ngIf="entry.genres.length > 3">+{{ entry.genres.length - 3 }}</span>
              <span class="text-xs text-muted italic" *ngIf="entry.genres.length === 0">No genres yet</span>
            </div>

            <div class="score-section text-right">
              <div class="text-2xl font-bold text-primary">{{ entry.booksReadCount }}</div>
              <div class="text-xs text-muted uppercase">Books</div>
            </div>
          </div>
          
          <div *ngIf="leaderboardData().length === 0" class="text-center py-8 text-muted">
            No reading data available yet.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 3rem;
    }
    .podium-container {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 3rem;
    }
    @media (max-width: 768px) {
      .podium-container {
        flex-direction: column;
        align-items: center;
        gap: 2rem;
      }
      .rank-1, .rank-2, .rank-3 { height: auto !important; width: 100% !important; max-width: 300px; }
    }
    .podium-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem;
      border-radius: 1.5rem;
      position: relative;
      text-align: center;
      width: 240px;
      transition: transform 0.3s;
    }
    .podium-item:hover {
      transform: translateY(-5px);
    }
    .rank-1 { height: 320px; border: 2px solid rgba(212, 175, 55, 0.4); box-shadow: 0 0 30px rgba(212, 175, 55, 0.15); z-index: 10; }
    .rank-2 { height: 280px; border: 2px solid rgba(192, 192, 192, 0.3); }
    .rank-3 { height: 260px; border: 2px solid rgba(205, 127, 50, 0.3); }

    .medal {
      position: absolute;
      top: -15px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .gold { background: linear-gradient(135deg, #FFD700, #DAA520); }
    .silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
    .bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }

    .crown {
      position: absolute;
      top: -45px;
      font-size: 3rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    .avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-card-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      color: var(--text-main);
      margin-bottom: 0.5rem;
    }
    .avatar-large.highlight {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      width: 100px;
      height: 100px;
      font-size: 3rem;
    }

    .badge-gold { background: rgba(218, 165, 32, 0.1); color: #DAA520; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge-silver { background: rgba(158, 158, 158, 0.1); color: #9E9E9E; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;}
    .badge-bronze { background: rgba(205, 127, 50, 0.1); color: #CD7F32; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;}

    .leaderboard-row {
      display: flex;
      align-items: center;
      padding: 1.25rem 0;
      border-bottom: 1px solid var(--border-color);
      transition: background 0.2s, transform 0.2s;
    }
    .leaderboard-row:last-child {
      border-bottom: none;
    }
    .leaderboard-row:hover {
      background: var(--bg-card-hover);
      border-radius: 0.75rem;
      padding-left: 1rem;
      padding-right: 1rem;
      margin-left: -1rem;
      margin-right: -1rem;
    }

    .rank-number {
      font-size: 1.5rem;
      font-weight: 800;
      width: 50px;
      text-align: center;
    }

    .avatar-small {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: var(--accent-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.25rem;
    }

    .genre-badge {
      background: var(--bg-main);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class LeaderboardComponent {
  private dataService = inject(DataService);

  leaderboardData = computed(() => {
    const users = this.dataService.users();
    const transactions = this.dataService.transactions().filter(t => t.status === 'Returned');
    const books = this.dataService.books();

    return users.map(user => {
      // Get unique returned books for this user
      const userTxs = transactions.filter(t => t.memberId === user.id);
      const uniqueBookIds = Array.from(new Set(userTxs.map(t => t.bookId)));
      const booksRead = uniqueBookIds.map(id => books.find(b => b.id === id)).filter(b => !!b);

      const count = booksRead.length;

      // Genre breakdown
      const genreCounts: Record<string, number> = {};
      booksRead.forEach(b => {
        const cat = b!.category || 'Uncategorized';
        genreCounts[cat] = (genreCounts[cat] || 0) + 1;
      });

      // Sort genres by count descending
      const genres = Object.keys(genreCounts).map(g => ({ name: g, count: genreCounts[g] }))
        .sort((a, b) => b.count - a.count);

      // Determine gamified rank title
      let rankTitle = 'Novice Reader';
      if (count >= 10) rankTitle = 'Grandmaster';
      else if (count >= 5) rankTitle = 'Scholar';
      else if (count >= 2) rankTitle = 'Avid Reader';

      return {
        user,
        booksReadCount: count,
        genres,
        rankTitle
      };
    }).sort((a, b) => b.booksReadCount - a.booksReadCount);
  });
}
