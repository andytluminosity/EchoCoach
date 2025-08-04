import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './register/register';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'Home page',
    },
    {
        path: 'register',
        component: Register,
        title: 'Register',
    },
];
