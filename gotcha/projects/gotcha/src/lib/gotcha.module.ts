import { NgModule } from '@angular/core';
import { GotchaComponent } from './gotcha.component';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GotchaLoginComponent } from './gotcha-login/gotcha-login.component';

@NgModule({
  declarations: [
    GotchaComponent,
    GotchaLoginComponent
  ],
  imports: [
    FormsModule,
    BrowserModule
  ],
  exports: [
    GotchaComponent,
    GotchaLoginComponent
  ]
})
export class GotchaModule { }
