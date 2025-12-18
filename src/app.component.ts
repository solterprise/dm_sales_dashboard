import { Component, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NetworkService } from '@/@core/network-service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast position="top-right" />
        <router-outlet />
    `
})
export class AppComponent {
    private networkService = inject(NetworkService);
    private messageService = inject(MessageService);
    private isOfflineToastShown = false;

    constructor() {
        effect(() => {
            const online = this.networkService.onlineStatus();
            if (!online && !this.isOfflineToastShown) {
                this.isOfflineToastShown = true;
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Нет сети',
                    detail: 'Проверьте подключение к интернету, данные могут быть неактуальны',
                    life: 5000
                });
            } else if (online && this.isOfflineToastShown) {
                this.isOfflineToastShown = false;
                this.messageService.clear();
            }
        });
    }

}
