import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Documentation } from '@/pages/documentation/documentation';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from '@/pages/auth/login/auth-guard';
import { DataCard } from '@/pages/data-card/data-card';
import { DataTable } from '@/pages/data-table/data-table';

export const appRoutes: Routes = [
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    {
        path: '',
        component: AppLayout,
/*
        canActivate: [authGuard],
*/
        children: [
            { path: '', component: DataTable },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];
