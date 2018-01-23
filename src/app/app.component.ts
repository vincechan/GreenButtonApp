import {HttpClient} from '@angular/common/http';
import {HttpHeaders} from '@angular/common/http';
import {Component} from '@angular/core';
import {MatButtonToggleChange} from '@angular/material';
import {Chart} from 'angular-highcharts'
import * as Highcharts from 'highcharts';

import {GbFileParserService} from './gb-file-parser.service';
import {GbDailyStat, GbFile, Uom} from './gb-types';

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
    this.http
        .get(url, {
          headers: new HttpHeaders({'Accept': 'application/xml'}),
          responseType: 'text'
        })
        .subscribe(xmlData => {
          this.gbfile = this.gbparser.parseXml(xmlData);
          this.createChart();
        });
  }

  parseFile($event) {
    var file: File = $event.target.files[0];
    var reader: FileReader = new FileReader();

    reader.onloadend = (e) => {
      this.gbfile = this.gbparser.parseXml(reader.result);
      this.createChart();
    } reader.readAsText(file);
  }

  changeChartType($event: MatButtonToggleChange) {
    this.chartType = $event.value;
    this.createChart();
  }

  createChart() {
    if (this.chartType == 'hourly') {
      this.createHourlyChart();
    } else {
      this.createDailyChart();
    }
  }

  createDailyChart() {
    let dailyUsage = [];
    let dailyCost = [];
    for (let stat of this.gbfile.dailyStats) {
      dailyUsage.push([
        Date.UTC(
            stat.date.getFullYear(), stat.date.getMonth(), stat.date.getDate()),
        stat.value
      ]);
      dailyCost.push([
        Date.UTC(
            stat.date.getFullYear(), stat.date.getMonth(), stat.date.getDate()),
        (stat.cost / 100000)
      ]);
    }

    this.chart = new Chart({
      chart: {type: 'column'},
      title: {text: 'Daily Energy Usage'},
      xAxis: {type: 'datetime', title: {text: 'Date'}},
      yAxis: [
        {
          title: {text: 'Energy Usage'},
          labels: {
            formatter: function() {
              return (this.value / 1000) + ' kilowatt-hours';
            }
          },
        },
        {
          title: {text: 'Cost'},
          labels: {
            formatter: function() {
              return '$' + (this.value).toFixed(2);
            }
          },
          opposite: true
        },
      ],
      series: [
        {name: 'energy usage', type: 'column', data: dailyUsage},
        {name: 'cost', type: 'spline', yAxis: 1, data: dailyCost}
      ]
    });
  }

  createHourlyChart() {
    let hourlyUsage = [];
    let hourlyCost = [];
    for (let stat of this.gbfile.hourlyStats) {
      hourlyUsage.push([stat.hour, stat.value]);
      hourlyCost.push([stat.hour, (stat.cost / 100000)]);
    }
    this.chart = new Chart({
      chart: {type: 'column'},
      title: {text: 'Hourly Energy Usage'},
      xAxis: {type: 'category', title: {text: 'Hour'}},
      yAxis: [
        {
          title: {text: 'Energy Usage'},
          labels: {
            formatter: function() {
              return (this.value / 1000) + ' kilowatt-hours';
            }
          },
        },
        {
          title: {text: 'Cost'},
          labels: {
            formatter: function() {
              return '$' + (this.value).toFixed(2);
            }
          },
          opposite: true
        }
      ],
      series: [
        {name: 'energy usage', type: 'column', data: hourlyUsage},
        {name: 'cost', type: 'spline', yAxis: 1, data: hourlyCost}
      ],
    });
  }
}
