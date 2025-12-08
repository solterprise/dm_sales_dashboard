import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        <a href="https://solterprise.com/ru" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Powered by Solterprise</a>
    </div>`
})
export class AppFooter {}
