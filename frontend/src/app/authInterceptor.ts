import {
    HttpEvent,
    HttpHandler,
    HttpHandlerFn,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { User } from '../types/user';
import { Observable } from 'rxjs';
import { Api } from './api';
import { inject } from '@angular/core';

export function authInterceptor(
    request: HttpRequest<unknown>,
    next: HttpHandlerFn
) {
    // Inject the current `AuthService` and use it to get an authentication token:
    const token = inject(Api).getToken();
    // Clone the request to add the authentication header.
    if (token) {
        request = request.clone({
            setHeaders: {
                Authorization: `Token ${token}`,
            },
        });
    }
    return next(request);
}
