import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginError = false;
  signInData: any = {};

  constructor(private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.loginError = false
      console.log(this.signInData);
      console.log('Form submitted!');
      console.log(this.signInData);
      var success = false;
      if (this.signInData.email == "rex@gmail.com") {
        success = true;
      } else {
        success = false;
      }
      if (!success) {
        this.loginError = true;
      } else {
        // If the login succeeds, we'll clear the error message and
        // navigate to the user's dashboard.
        this.loginError = false;
        // Use your preferred routing method here, such as Angular Router or window.location.
        this.router.navigate(['']);
      }
    } else {
      this.loginError = true
    }
  }
}
