import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '@/@core/translate-loader';
import { provideServiceWorker } from '@angular/service-worker';
import {authorizeInterceptor } from '@/pages/auth/login/auth-interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHttpClient(withInterceptors([authorizeInterceptor])),
        provideTransloco({
            config: {
                availableLangs: ['ru', 'ro'],
                defaultLang: 'ro',
                reRenderOnLangChange: true,
                prodMode: !isDevMode()
            },
            loader: TranslocoHttpLoader
        }),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
    ]
};
