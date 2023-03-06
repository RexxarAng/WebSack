import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as moment from "moment";

@Injectable()
export class AuthService {
    authToken: any;
    user: any;
    public jwtHelperService: JwtHelperService = new JwtHelperService();

    constructor(
        private http: HttpClient,
        @Inject('API_URL') private apiUrl: string
        ) { }

    startSignup(username: any) {
        const url = `${this.apiUrl}/startSignup`
        return this.http.post(url, username);
    }

    signup(user: any) {
        const url = `${this.apiUrl}/signup`
        return this.http.post(url, user);
    }

    completeSignup(user: any) {
        const url = `${this.apiUrl}/completeSignup`
        return this.http.post(url, user);
    }

    startAuthenticate(user: any) {
        const url = `${this.apiUrl}/startAuthenticate`
        return this.http.post(url, user);
    }

    authenticateUser(user: any) {
        const url = `${this.apiUrl}/authenticate`
        return this.http.post(url, user);
    }

    // JK
    verifyUserImg(user: any) {
        const url = `${this.apiUrl}/imgVerify`
        return this.http.post(url, user);
    }


    tokenGetter() {
        return sessionStorage.getItem('id_token');
      }

    getProfile() {
        this.loadToken();
        const httpOptions = {
            headers: new HttpHeaders({
              'Authorization': this.authToken
            })
        }; 
        const url = `${this.apiUrl}/profile`
        return this.http.get(url, httpOptions)
    }

    storeUserToken(token: string, user: string) {
        sessionStorage.setItem('id_token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        this.authToken = token;
        this.user = user;
    }

    loadToken() {
        const token = sessionStorage.getItem('id_token');
        this.authToken = token;
    }

    loggedIn() {
        this.loadToken();
        return !this.jwtHelperService.isTokenExpired(this.authToken);
    }

    logout() {
        this.authToken = null;
        this.user = null;
        sessionStorage.clear();
    }

}