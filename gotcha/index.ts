// index.ts
import { YourComponent } from './src/client';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [YourComponent],
  imports: [BrowserModule, MatDialogModule],
  bootstrap: [YourComponent]
})
export class AppModule { }
