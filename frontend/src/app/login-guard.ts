import { CanActivateFn, Router } from '@angular/router';
import { Api } from './api';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = () => {
    const api = inject(Api);
    const router = inject(Router);

    if (api.isLoggedIn()) {
        return true;
    }
    return router.parseUrl('/login');
};
