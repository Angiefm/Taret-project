import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor, httpLoggingInterceptor } from './app/core/interceptors/auth.interceptor';

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
    
    importProvidersFrom(KeycloakAngularModule),
    
    KeycloakService,
    
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    
    provideHttpClient(
      withInterceptors([
        authInterceptor,         
        httpLoggingInterceptor   
      ])
    )
  ]
}).catch(err => {
  console.error('❌ Error iniciando la aplicación:', err);
});