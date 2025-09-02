import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appHttpInterceptor } from './app/core/interceptors/app-http.interceptor';

import localeEsCO from '@angular/common/locales/es-CO'; 
import { registerLocaleData } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';

registerLocaleData(localeEsCO);

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080/',
        realm: 'FalaHotel',
        clientId: 'FalaFrontend'  
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      },
      bearerExcludedUrls: ['/assets', '/clients/public']
    });
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    importProvidersFrom(BrowserAnimationsModule),

    //Keycloak
    importProvidersFrom(KeycloakAngularModule),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },

    //HTTP
    provideHttpClient(
        withInterceptors([ appHttpInterceptor ]) 
    ),

    // Locale
    { provide: LOCALE_ID, useValue: 'es-CO' },

    //Snackbar global
    importProvidersFrom(MatSnackBarModule),
  ]
}).catch(err => {
  console.error('Error iniciando la aplicación:', err);
});
