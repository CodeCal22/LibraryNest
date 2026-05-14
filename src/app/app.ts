import { Component, signal, OnInit, inject, Renderer2 } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('lib');
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);
  toastService = inject(ToastService);

  ngOnInit() {
    const savedTheme = localStorage.getItem('nexus-theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true; // Default to dark
    if (isDark) {
      this.renderer.setAttribute(this.document.documentElement, 'data-theme', 'dark');
    } else {
      this.renderer.removeAttribute(this.document.documentElement, 'data-theme');
    }
  }
}
