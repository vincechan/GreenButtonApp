import { GbDailyStat, GbFile, Uom } from './gb-types';
import { Component } from '@angular/core';
import { GbFileParserService } from './gb-file-parser.service';
import { Chart } from 'angular-highcharts'
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { MatButtonToggleChange } from '@angular/material';
import * as Highcharts from 'highcharts';
declare var require: any;
require('highcharts/modules/exporting')(Highcharts);

@Component({
  providers: [GbFileParserService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  chartType = 'daily';
  gbfile: GbFile;
  chart: Chart;

  constructor(
    private gbparser: GbFileParserService,
    private http: HttpClient,
  ) {}

  parseRemoteFile(url: string) {    
    this.http.get(url, { headers: new HttpHeaders({ 'Accept': 'application/xml' }), responseType: 'text' })
    .subscribe(xmlData => {
      this.gbfile = this.gbparser.parseXml(xmlData);
      this.createChart();
    });
  }

  parseFile($event) {
    var file: File = $event.target.files[0];
    var reader: FileReader = new FileReader();

    reader.onloadend = (e) => {
      this. gbfile = this.gbparser.parseXml(reader.result);
      this.createChart();
    }
    reader.readAsText(file);
  }

  changeChartType($event: MatButtonToggleChange) {
    this.chartType = $event.value;
    this.createChart();
  }

  createChart() {
    if (this.chartType == 'hourly') {
      this.createHourlyChart();
    }
    else {
      this.createDailyChart();
    }
  }

  createDailyChart() {
    let dailyData = [];
    for (let stat of this.gbfile.dailyStats) {
      
      dailyData.push(
        [Date.UTC(stat.date.getFullYear(), stat.date.getMonth(), stat.date.getDate()), 
        stat.value]);
    }

    this.chart = new Chart({
      chart: {
        type: "column"
      },
      title: {
        text: "Daily Energy Usage"
      },
      xAxis: {
        type: 'datetime',
        title: {
            text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: "Energy Usage"
        },
      },
      series: [{
        name: 'energy usage',
        data: dailyData
      }]
    });
  }

  createHourlyChart() {
    let hourlyData = [];
    for (let stat of this.gbfile.hourlyStats) {
      hourlyData.push(
        [stat.hour, 
        stat.value]);
    }
    this.chart = new Chart({
      chart: {
        type: "column"
      },
      title: {
        text: "Hourly Energy Usage"
      },
      xAxis: {
        type: 'category',
        title: {
            text: 'Hour'
        }
      },
      yAxis: {
        title: {
          text: "Energy Usage"
        },
      },
      series: [{
        name: 'energy usage',
        data: hourlyData
      }]
    });
  }
}
