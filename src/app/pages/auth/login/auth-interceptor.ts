import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authorizeInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    // Получаем токен
    const token = localStorage.getItem('token');

    // Клонируем запрос и добавляем заголовок 'token'
    const authReq = token ? req.clone({ setHeaders: { token } }) : req;

    // Пропускаем дальше и обрабатываем ошибки
    return next(authReq).pipe(
        catchError(err => {
            if (err.status === 401) {
                console.log('Не авторизован!');
                // можно редирект или логаут
            }
            return throwError(() => err);
        })
    );
};
