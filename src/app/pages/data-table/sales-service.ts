import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
    sales = signal<any[]>([])

    getLocalData(): any[] {
        return this.sales();
    }

}
