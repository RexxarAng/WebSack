import { NgModule } from '@angular/core';
import { GotchaComponent } from './gotcha.component';
import { FormsModule }   from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    GotchaComponent
  ],
  imports: [
    FormsModule,
    BrowserModule
  ],
  exports: [
    GotchaComponent
  ]
})
export class GotchaModule { }
