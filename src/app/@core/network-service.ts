import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NetworkService {
    private _online = signal(navigator.onLine);
    onlineStatus = computed(() => this._online());

    constructor() {
        window.addEventListener('online', () => this._online.set(true));
        window.addEventListener('offline', () => this._online.set(false));
    }
}
