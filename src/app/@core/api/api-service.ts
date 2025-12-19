import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    public getList(payload: any): Observable<SaleResponse[]> {
        let params = new HttpParams()
            .set('dateStart', payload.dateStart)
            .set('dateEnd', payload.dateEnd);
        if (payload.warehouse) {
            params = params.set('warehouse', payload.warehouse);
        }
        return this.http.get<SaleResponse[]>(`${this.apiUrl}sales/getSales`, { params });
    }
}

export interface SaleResponse {
    amount: number;
    category: string;
    deliveryAmount: number;
    deliveryQuantity: number;
    item: string;
    itemId: number;
    price: number;
    quantity: number;
    warehouse: string;
    warehouseId: number;
}
