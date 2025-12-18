import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/pages/auth/login/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (localStorage.getItem('token')) {
        return true;
    } else {
        auth.logout();
        router.navigate(['/auth/login']);
        return false;
    }
};
