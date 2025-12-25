import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu],
    template: ` <div class="layout-sidebar flex flex-col h-full justify-between p-4">
  <app-menu></app-menu>

  <span class="text-sm text-gray-500">Version 25.12.2025</span>
</div>
`
})
export class AppSidebar {
    constructor(public el: ElementRef) {}
}
