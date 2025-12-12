import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            @for (item of model; track $index; let i = $index) {
                @if (!item.separator) {
                    <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                } @else {
                    <li class="menu-separator"></li>
                }
            }
        </ul>
    `
})
export class AppMenu {
    model: MenuItem[] = [];
    private transloco = inject(TranslocoService);

    ngOnInit() {
        this.model = [
            {
                label: 'Menu',
                items: [{
                    label: this.transloco.translate('sales.title'),
                    icon: 'pi pi-shopping-cart',
                    routerLink: ['/'] }]
            },
            {
                label: '',
                items: [{ label: 'Card', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/card'] }]
            }
        ];
    }
}
