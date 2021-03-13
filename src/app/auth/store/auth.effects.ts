import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as AuthActions from './auth.actions'
import {environment} from '../../../environments/environment'
import {User} from '../user.model'
import { AuthService } from '../auth.service';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
  }

const handleAuthentication = (email: string, userId: string, token: string, expiresIn: string) => {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate)
    localStorage.setItem("userData" , JSON.stringify(user))
    return new AuthActions.Authenticate_Sucess({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expirationDate
    })
}  

const handleCatchError = (errorRes) => {
                let errorMessage = 'Un error desconocido ocurrió';

                    if (!errorRes.error || !errorRes.error.error) {
                    return of(new AuthActions.Authenticate_Fail(errorMessage));
                    }

                    switch (errorRes.error.error.message) {
                    case 'EMAIL_EXISTS':
                        errorMessage = 'Este email ya fué registrado';
                        break;
                    case 'EMAIL_NOT_FOUND':
                        errorMessage = 'Este email no existe';
                        break;
                    case 'INVALID_PASSWORD':
                        errorMessage = 'Email o contraseña incorrecto';
                        break;
                  
                    }
                return of(new AuthActions.Authenticate_Fail(errorMessage))
}

@Injectable()
export class AuthEffects {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction : AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' +
                environment.firebaseAPIKey,
                {
                email: signupAction.payload.email,
                password: signupAction.payload.password,
                returnSecureToken: true,
                }).pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                    }),
                    map(resData => {
                    return handleAuthentication(resData.email, resData.localId, resData.idToken, resData.expiresIn)
                }), catchError(resError => {
                    return handleCatchError(resError)
                })) 
        })
    )

    
    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http
            .post<AuthResponseData>(
              'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' +
                environment.firebaseAPIKey,
              {
                email: authData.payload.email,
                password: authData.payload.password,
                returnSecureToken: true,
              }
            ).pipe(
                tap(resData => {
                    this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                }),
                map(resData => {
                return handleAuthentication(resData.email, resData.localId, resData.idToken, resData.expiresIn)
            }), catchError(errorRes => {
                return handleCatchError(errorRes)
            }))
        })
    )

    @Effect({ dispatch: false })
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => {
            this.router.navigate(['/']);
        })
    )

    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        //tap does not return anything
        tap(() => {
    
            this.authService.clearLogoutTimer()
            localStorage.removeItem("userData")
            this.router.navigate(['/auth'])
        })
    )


    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN),
        //map allow us to return something
        map(() => {
            //JSON.parse() converts string into a JSON object.
            const userData: {
                email: string;
                id: string;
                _token: string;
                _tokenExpirationDate: Date;
            } = JSON.parse(localStorage.getItem('userData'));
        
            if (!userData) {
                return {type : "Dummy"};
            }
            //new Date(userData._tokenExpirationDate) outputs the local time
            const loadedUser = new User(
                userData.email,
                userData.id,
                userData._token,
                new Date(userData._tokenExpirationDate)
            );
        
            if (loadedUser.token) {
                const expirationDuration =
                new Date(userData._tokenExpirationDate).getTime() -
                new Date().getTime();
                this.authService.setLogoutTimer(expirationDuration)
                return new AuthActions.Authenticate_Sucess({
                email : loadedUser.email,
                userId : loadedUser.id,
                token : loadedUser.token,
                expirationDate: new Date(userData._tokenExpirationDate)
                })
                // const expirationDuration =
                // new Date(userData._tokenExpirationDate).getTime() -
                // new Date().getTime();
                // this.autoLogout(expirationDuration);
            }
            return {type : "Dummy"};
        })
    )

    constructor(private actions$ : Actions, private http: HttpClient, private router : Router, private authService: AuthService){}
}