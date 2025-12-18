import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService, User } from '@/pages/auth/login/auth-service';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, TranslocoModule, ReactiveFormsModule, ToastModule],
    templateUrl: './login.html',
    providers: [MessageService]
})
export class Login {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    protected isLoading = false;
    private messageService = inject(MessageService);

    loginForm = new FormGroup({
        user: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required)
    });

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.isLoading = true;
        this.authService
            .login(this.loginForm.value as User)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/']);
                },
                error: (error) => {
                    if (error.status === 401) {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось авторизоваться',    life: 5000  });
                    }
                    console.log(error);
                }
            });
    }
}
