import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless change detection - Angular 20+
    provideZonelessChangeDetection(),

    // Routing with input binding for route params as component inputs
    provideRouter(routes, withComponentInputBinding()),

    // Animations (async for better performance)
    provideAnimationsAsync(),

    // HTTP client for loading translations and future API calls
    provideHttpClient(),

    // Transloco i18n configuration
    provideTransloco({
      config: {
        availableLangs: ['en', 'fi', 'et', 'ru'],
        defaultLang: 'et',
        fallbackLang: 'et',
        reRenderOnLangChange: true,
        prodMode: false, // Set to true in production
      },
      loader: TranslocoHttpLoader,
    }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
