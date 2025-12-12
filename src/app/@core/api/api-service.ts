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

    public getList(payload: Sale): Observable<any[]> {
        const params = new HttpParams()
            .set('dateStart', payload.dateStart)
            .set('dateEnd', payload.dateEnd)
            .set('warehouse', payload.warehouse!);
        return this.http.get<any>(`${this.apiUrl}sales/getSales`, { params });
    }
}

export interface Sale {
    dateStart: string;
    dateEnd: string;
    warehouse: string| null;
}
