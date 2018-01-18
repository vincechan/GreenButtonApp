import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSidenavModule, MatIconModule, MatListModule, MatMenuModule, MatCardModule, MatButtonToggleModule } from '@angular/material'
import { NgModule } from '@angular/core';
import 'hammerjs';

import { AppComponent } from './app.component';
import { GbFileParserService } from './gb-file-parser.service';
import { ChartModule } from 'angular-highcharts'
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    ChartModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
  ],
  providers: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
