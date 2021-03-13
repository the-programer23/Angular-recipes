import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import {EffectsModule } from '@ngrx/effects'
import {StoreDevtoolsModule} from '@ngrx/store-devtools'
import { StoreRouterConnectingModule } from '@ngrx/router-store';

import {environment} from '../environments/environment'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { RecipeService } from './recipes/recipe.service';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { SharedModule } from './shared/shared.module';
import * as fromApp from './store/app.reducer'
import { AuthEffects } from './auth/store/auth.effects';


@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, SharedModule, 
    StoreModule.forRoot(fromApp.appReducer), 
    EffectsModule.forRoot([AuthEffects]), 
    StoreDevtoolsModule.instrument({logOnly : environment.production}),
    StoreRouterConnectingModule.forRoot()],
   
  providers: [
    RecipeService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
