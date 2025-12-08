import { Component, inject, signal } from '@angular/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { SplitButton } from 'primeng/splitbutton';
import { AuthService } from '@/pages/auth/login/auth-service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CountryService } from '@/pages/service/country.service';
import { Menu } from 'primeng/menu';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, SplitButton, TranslocoPipe],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <span>Data Management</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <p-splitbutton [label]="currentLang()|uppercase" [model]="languages" icon="pi pi-globe" />
                    <p-splitbutton [label]="'utils.profile' | transloco" [model]="items" icon="pi pi-user" />
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    languages!: MenuItem[];
    private authService = inject(AuthService);
    private langService = inject(TranslocoService);
    currentLang = signal<string>('');

    constructor(public layoutService: LayoutService) {
        this.items = [
            {
                label: 'Выход',
                icon: 'pi pi-fw pi-sign-out',
                command: () => this.logout()
            }
        ];
        this.languages = [
            {
                label: 'RO',
                command: () => this.switchLang('ro')
            },
            {
                label: 'RU',
                command: () => this.switchLang('ru')
            }
        ];
        this.currentLang.set(this.langService.getActiveLang());
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.authService.logout();
    }

    protected switchLang(lang: string) {
        this.langService.setActiveLang(lang);
        this.currentLang.set(lang);
    }
}
