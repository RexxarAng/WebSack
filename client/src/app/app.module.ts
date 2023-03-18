import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from './environments/environment';
import { AuthService } from "./services/auth.service";
import { ProfileComponent } from './profile/profile.component';
import { GotchaModule } from '@websack/gotcha';
import { JwtModule } from '@auth0/angular-jwt';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

export function getToken() {
  return sessionStorage.getItem('id_token');
 }

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    GotchaModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: getToken,
        allowedDomains: ['https://websack.eloquent-jennings.cloud'],
        disallowedRoutes: [
          'https://websack.eloquent-jennings.cloud/api/login',
          'https://websack.eloquent-jennings.cloud/api/signup',
          'https://websack.eloquent-jennings.cloud/api/startSignup'
        ]
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    AuthService,
    { provide: 'API_URL', useValue: environment.apiUrl }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
