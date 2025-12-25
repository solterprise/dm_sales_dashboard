import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        <a href="https://solterprise.com/ru" target="_blank" rel="noopener noreferrer" class="solterprise-bg">Powered by Solterprise</a>
    </div>
    <style>
        .solterprise-bg {
            font-size: 16px;
            font-weight: 400;
            background: linear-gradient(to right, #4a90e2, #a355b9, #ff6b6b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>`

})
export class AppFooter {}
