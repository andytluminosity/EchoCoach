import {
    ApplicationConfig,
    importProvidersFrom,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
    provideHttpClient,
    withInterceptors,
    withInterceptorsFromDi,
    withXsrfConfiguration,
} from '@angular/common/http';
import { authInterceptor } from './authInterceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(
            withXsrfConfiguration({
                cookieName: 'csrftoken',
                headerName: 'X-CSRFToken',
            }),
            withInterceptors([authInterceptor])
        ),
    ],
};
