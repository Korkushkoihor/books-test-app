import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'books',
        pathMatch: 'full',
    },
    {
        path: 'books',
        loadComponent: () => import('./public/books').then((m) => m.Books),
    },
    {
        path: '**',
        loadComponent: () => import('./public/not-found').then((m) => m.NotFound),
    },
];
