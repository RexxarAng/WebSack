import { NgModule } from '@angular/core';
import { GotchaComponent } from './gotcha.component';
import { FormsModule }   from '@angular/forms';


@NgModule({
  declarations: [
    GotchaComponent
  ],
  imports: [
    FormsModule
  ],
  exports: [
    GotchaComponent
  ]
})
export class GotchaModule { }
