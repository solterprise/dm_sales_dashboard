import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const authorizeInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const token = localStorage.getItem('token');
    const router = inject(Router);
    const authReq = token ? req.clone({ setHeaders: { token } }) : req;

    return next(authReq).pipe(
        catchError(err => {
            if (err.status === 401 || err.status === 403) {
                console.log('Не авторизован!');
                 router.navigate(['/auth/login']);
            }
            return throwError(() => err);
        })
    );
};
