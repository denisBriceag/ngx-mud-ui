import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MudAvatar } from 'ngx-mud-ui/avatar';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudChip } from 'ngx-mud-ui/chip';
import type { MudIconName } from 'ngx-mud-ui/icons';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import {
  MudSidebar,
  MudSidebarContent,
  MudSidebarGroup,
  MudSidebarHeader,
  MudSidebarItem,
  MudSidebarLayout,
  MudSidebarToggle,
} from 'ngx-mud-ui/sidebar';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';

interface Filter {
  path: string;
  icon: MudIconName;
  label: string;
  count: number;
}

// The icons are registered once in app.config.ts:
// provideMudIcons([sidebar, plusLarge, pageText, edit, pageUpload, pageDownload, people, history, search, moreVertical])
@Component({
  selector: 'app-sidebar-page',
  imports: [
    MudSidebarLayout,
    MudSidebar,
    MudSidebarHeader,
    MudSidebarGroup,
    MudSidebarItem,
    MudSidebarToggle,
    MudSidebarContent,
    MudAvatar,
    MudBadge,
    MudButton,
    MudIconButton,
    MudChip,
    MudIconComponent,
    MudTabGroup,
    MudTab,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <mud-sidebar-layout>
      <mud-sidebar #sb="mudSidebar" aria-label="Împuterniciri" [(collapsed)]="collapsed">
        <div mudSidebarHeader>
          <!-- The toggle stays outside the @if blocks so it keeps focus when the rail swaps. -->
          <div class="mpower-profile">
            @if (!sb.compact()) {
              <mud-avatar name="Anastasia Cojocaru" />
              <div class="mpower-profile__text">
                <strong>Anastasia Cojocaru</strong><span>IDNP 12012092309223019</span>
              </div>
            }
            <button mudIconButton mudSidebarToggle aria-label="Meniu">
              <mud-icon name="sidebar" [scale]="20" />
            </button>
          </div>
          @if (sb.compact()) {
            <mud-avatar name="Anastasia Cojocaru" />
            <button
              mudButton
              shape="circular"
              size="md"
              class="mpower-new"
              aria-label="Împuternicire nouă"
            >
              <mud-icon name="plus-large" [scale]="20" />
            </button>
          } @else {
            <button mudButton size="md" fullWidth>Împuternicire nouă</button>
          }
        </div>
        <!-- Swap on sb.compact(), not collapsed(): below 768px the rail is always drawn extended. -->
        <mud-sidebar-group heading="Filtrare împuterniciri după:" [divider]="sb.compact()">
          @for (f of filters; track f.path) {
            <a
              mud-sidebar-item
              [routerLink]="f.path"
              routerLinkActive
              #rla="routerLinkActive"
              [selected]="rla.isActive"
            >
              <mud-icon icon [name]="f.icon" [scale]="20" />
              {{ f.label }}
              <mud-badge trailing [count]="f.count" variant="neutral" size="xl" />
            </a>
          }
        </mud-sidebar-group>
        <mud-sidebar-group>
          <a mud-sidebar-item routerLink="/jurnal"
            ><mud-icon icon name="history" [scale]="20" />Jurnal de acțiuni</a
          >
        </mud-sidebar-group>
        <mud-sidebar-group heading="Contacte" [divider]="sb.compact()">
          @if (sb.compact()) {
            <div class="mpower-contacts-rail">
              <button mudIconButton aria-label="Caută contacte">
                <mud-icon name="search" [scale]="20" />
              </button>
              <div class="avatar-stack">
                <mud-avatar name="Vladimir Odobescu" size="sm" /><mud-avatar
                  name="Andrei Codreanu"
                  size="sm"
                />
              </div>
            </div>
          } @else {
            <div class="mpower-chips">
              <mud-chip size="sm" [selected]="true">Toți</mud-chip>
              <mud-chip size="sm">Fizice</mud-chip>
              <mud-chip size="sm">Juridice</mud-chip>
              <button mudIconButton size="sm" aria-label="Caută contacte">
                <mud-icon name="search" [scale]="16" />
              </button>
            </div>
            @for (c of contacts; track c) {
              <div class="mpower-contact">
                <mud-avatar [name]="c" size="sm" />
                <span class="mpower-contact__name">{{ c }}</span>
                <button mudIconButton size="sm" [attr.aria-label]="'Acțiuni pentru ' + c">
                  <mud-icon name="more-vertical" [scale]="20" />
                </button>
              </div>
            }
          }
        </mud-sidebar-group>
      </mud-sidebar>
      <main mudSidebarContent>
        <mud-tab-group size="sm" aria-label="Împuternicire">
          @for (tab of tabs; track tab) {
            <mud-tab [label]="tab">
              <div class="mpower-cards">
                <div class="mpower-card"></div>
                <div class="mpower-card"></div>
                <div class="mpower-card"></div>
              </div>
            </mud-tab>
          }
        </mud-tab-group>
      </main>
    </mud-sidebar-layout>
  `,
  styles: `
    :host {
      display: block;
      padding-block: 40px;
    }
    .mpower-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mud-sidebar--compact .mpower-profile {
      justify-content: center;
    }
    .mpower-profile__text {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      color: var(--mud-color-text-base-tertiary);
      font-size: 14px;
      line-height: 20px;
    }
    .mpower-profile__text strong {
      color: var(--mud-color-text-base-default);
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
    .mud-btn.mpower-new {
      width: 40px;
      min-width: 40px;
      padding: 0;
    }
    .mpower-chips {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 24px 12px;
    }
    .mpower-contact {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 24px;
      color: var(--mud-color-text-base-default);
      font-size: 14px;
      line-height: 20px;
    }
    .mpower-contact__name {
      flex: 1;
      font-weight: 500;
    }
    .mpower-contacts-rail {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding-top: 16px;
    }
    .mpower-contacts-rail .avatar-stack {
      flex-direction: column;
    }
    .mpower-contacts-rail .avatar-stack .avatar {
      margin: -10px 0 0;
    }
    .mpower-contacts-rail .avatar-stack .avatar:first-child {
      margin-top: 0;
    }
    .mpower-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 24px;
    }
    .mpower-card {
      height: 280px;
      border-radius: 16px;
      background: var(--mud-color-background-base-secondary);
    }
  `,
})
export class SidebarPageExample {
  readonly collapsed = signal(false);
  readonly filters: Filter[] = [
    { path: '/toate', icon: 'page-text', label: 'Toate împuternicirile', count: 1 },
    { path: '/schite', icon: 'edit', label: 'Schițe', count: 1 },
    { path: '/acordate', icon: 'page-upload', label: 'Acordate', count: 1 },
    { path: '/primite', icon: 'page-download', label: 'Primite', count: 1 },
    { path: '/cosemnate', icon: 'people', label: 'Cosemnate', count: 1 },
  ];
  readonly contacts = ['Vladimir Odobescu', 'Andrei Codreanu'];
  readonly tabs = ['Detalii', 'Acțiuni', 'Cosemnatari', 'Evenimente', 'Info utilă'];
}
