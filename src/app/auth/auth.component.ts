import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Store } from '@ngrx/store';
import {Subscription } from 'rxjs';

import * as AuthActions from './store/auth.actions'
import * as fromApp from '../store/app.reducer'
import { AlertComponent } from '../shared/alert/alert.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  isLoggedIn = true;
  isLoading = false;
  error: string = null;
  private closeSub: Subscription;
  private authSub: Subscription;

  constructor(private store: Store<fromApp.AppState>,
    private componentFactoryResolver: ComponentFactoryResolver) {}
  
  ngOnInit(){
   this.authSub = this.store.select('auth').subscribe(authState => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
      if (this.error) {
        this.showErrorAlert(this.error);
      }
    })
  }

  
  onSwitchMode() {
    this.isLoggedIn = !this.isLoggedIn;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const password = form.value.password;
    this.isLoading = true;

    if (this.isLoggedIn) {
      this.store.dispatch(new AuthActions.LoginStart({email, password}))
    } else {
      this.store.dispatch(new AuthActions.SignupStart({email, password}))
    }

    form.reset();
  }

  onHandleError() {
    this.store.dispatch(new AuthActions.ClearError());
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
    if(this.authSub){
      this.authSub.unsubscribe();
    }
  }

  private showErrorAlert(message: string) {
     this.componentFactoryResolver.resolveComponentFactory(
      AlertComponent
    );
   
  }
}
