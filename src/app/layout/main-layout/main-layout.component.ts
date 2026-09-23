import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { ToastContainerComponent } from '../toast-container/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="app-layout">
      <!-- HEADER CHUNG -->
      <app-header></app-header>

      <!-- KHUNG THÂN: SIDEBAR + NỘI DUNG CHÍNH -->
      <div class="layout-body">
        <app-sidebar></app-sidebar>
        <main class="main-content-viewport">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- BOTTOM NAVIGATION CHO ĐIỆN THOẠI -->
      <app-bottom-nav></app-bottom-nav>

      <!-- HỆ THỐNG TOAST THÔNG BÁO -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-app);
    }

    .layout-body {
      display: flex;
      flex: 1;
    }

    .main-content-viewport {
      flex: 1;
      padding: 10px 14px;
      max-width: 100%;
      width: 100%;
      min-height: calc(100vh - 56px);
      box-sizing: border-box;
    }

    @media (max-width: 900px) {
      .main-content-viewport {
        padding: 10px 10px 72px 10px; /* Padding bottom tránh bị che bởi bottom nav */
      }
    }
  `]
})
export class MainLayoutComponent {}
