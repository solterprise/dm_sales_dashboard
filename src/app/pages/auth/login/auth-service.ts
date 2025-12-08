import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private baseUrl = 'https://example.com/api';
    private _user = signal<User | null>(null);
    isLoggedIn = computed(() => this._user() !== null);

    login(req: User): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, req).pipe(tap(() => this._user.set(req)));
    }

    logout(): Observable<LogoutResponse> {
        this._user.set(null);
        return this.http.post<LogoutResponse>(`${this.baseUrl}/logout`, {});
    }

    get user() {
        return this._user;
    }
}

export interface User {
    login: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: number;
    name: string;
    email: string;
}

interface LogoutResponse {
    success: boolean;
    message?: string;
}
