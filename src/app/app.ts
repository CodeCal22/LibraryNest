import { Component, signal, OnInit, inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('lib');
  private document = inject(DOCUMENT);
  private renderer = inject(Renderer2);

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
