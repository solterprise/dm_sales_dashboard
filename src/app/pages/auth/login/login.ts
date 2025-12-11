import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { TranslocoModule, TranslocoPipe } from '@jsverse/transloco';
import { AuthService, User } from '@/pages/auth/login/auth-service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, TranslocoModule, ReactiveFormsModule],
    templateUrl: './login.html'
})
export class Login {
   private readonly authService = inject(AuthService);
   private  readonly  router = inject(Router);

    loginForm = new FormGroup({
        user: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
    });

    onSubmit() {
        console.log(this.loginForm.value as User);
        this.authService.login(this.loginForm.value as User).subscribe({
            next: value =>{
             this.router.navigate(['/']);
            },
            error: error =>{
                console.log(error);
            }
        })
    }
}
