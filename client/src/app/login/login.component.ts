import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loginError = false;
  signInData: any = {};


  onSubmit(form: NgForm) {


    if (form.valid) {
      this.loginError = false
      this.signInData = {
        email: this.email,
        password: this.password
      };
      console.log('Form submitted!');
      console.log(this.signInData);

      if (this.email !== 'test' || this.password !== '12345') {
        this.loginError = true;
      } else {
        // If the login succeeds, we'll clear the error message and
        // navigate to the user's dashboard.
        this.loginError = false;
        // Use your preferred routing method here, such as Angular Router or window.location.
        window.location.href = '/dashboard';
      }
    } else {
      this.loginError = true
    }
  }
}
