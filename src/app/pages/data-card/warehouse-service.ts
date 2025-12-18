import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SaleResponse } from '@/@core/api/api-service';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getData(payload: any) {
        let params = new HttpParams()
            .set('dateEnd', payload.dateEnd);

        if (payload.warehouse != null) {
            params = params.set('warehouse', payload.warehouse);
        }

        return this.http.get<SaleResponse[]>(
            `${this.apiUrl}balances/getBalances`,
            { params }
        );
    }

}
