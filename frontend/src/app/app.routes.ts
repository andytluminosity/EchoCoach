import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Register } from './register/register';
import { Login } from './login/login';
import { Record } from './record/record';
import { loginGuard } from './login-guard';
import { Results } from './results/results';

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
    {
        path: 'login',
        component: Login,
        title: 'Login',
    },
    {
        path: 'record',
        component: Record,
        title: 'Record',
        canActivate: [loginGuard],
    },
    {
        path: 'results',
        component: Results,
        title: 'Results',
        canActivate: [loginGuard],
    },
];
