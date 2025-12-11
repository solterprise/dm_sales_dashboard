import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;
    private _user = signal<User | null>(null);
    isLoggedIn = computed(() => this._user() !== null);

    login(req: User): Observable<LoginResponse> {
        console.log(req);
        const headers = new HttpHeaders({
            Authorization: 'Basic ' + btoa(`${req.user}:${req.password}`)
        });
        console.log(headers);

        return this.http.get<LoginResponse>(`${this.apiUrl}auth/login`, { headers });
    }


    logout(): Observable<LogoutResponse> {
        this._user.set(null);
        return this.http.post<LogoutResponse>(`${this.apiUrl}/logout`, {});
    }

    get user() {
        return this._user;
    }
}

export interface User {
    user: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

interface LogoutResponse {
    success: boolean;
    message?: string;
}
