import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material'
import { NgModule } from '@angular/core';
import 'hammerjs';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    MatToolbarModule,
  ],
  providers: [
    MatToolbarModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
