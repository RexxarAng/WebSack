import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginError = false;
  signInData: any = {};

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loginError = false
      console.log(this.signInData);
      console.log('Form submitted!');

      this.authService.authenticateUser(this.signInData).subscribe((data: any) => {
          if (!data.success) {
            this.loginError = true;
          } else {
            this.loginError = false;
            this.authService.storeUserToken(data.token, data.user);
            console.log(this.authService.tokenGetter());
            this.router.navigate(['/profile']);
          }
      });
    }
  }
}