import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms'
import { UserService } from '../services/user.service'
import { Router } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  @ViewChild('signupSuccessModal') signupSuccessModal!: ElementRef;

  constructor(
    private userService: UserService, 
    private router: Router,
    private modalService: NgbModal

  ) { }

  formData: any = {};
  isNameValid: boolean = true;
  isEmailValid: boolean = true;
  isPasswordValid: boolean = true;


  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log(this.formData);
      this.userService.signUp(this.formData)
      .subscribe((response: any) => {
        console.log(response)
        if (response.success) {
          this.modalService.open(this.signupSuccessModal);
          setTimeout(() => {
            this.modalService.dismissAll();
            this.router.navigate(['login']);
          }, 5000);  //5s
        }
      });
    }
  }


}