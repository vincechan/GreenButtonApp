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
    };
    reader.readAsText(file);
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
    let thatFile = this.gbfile;

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
        stat.cost
      ]);
    }

    this.chart = new Chart({
      chart: {type: 'column'},
      title: {text: 'Daily Energy Usage'},
      tooltip: {
        formatter: function() {
          let tt = '<b>' + Highcharts.dateFormat('%a, %b %e, %Y', this.x) +'</b><br/>';
          tt += 'Usage: ' + this.points[0].y.toFixed(1) + thatFile.usageUnit + '<br/>';
          if (thatFile.hasCostData) {
            tt += 'Cost: ' + thatFile.costUnit + this.points[1].y.toFixed(2) + '<br/>';
          }
           return tt;
        },
        shared: true,
        useHTML: true
      },
      xAxis: {type: 'datetime', title: {text: 'Date'}},
      yAxis: [
        {
          title: {text: 'Energy Usage'},
          labels: {
            formatter: function() {
              return (this.value).toFixed(1) + ' ' + thatFile.usageUnit;
            }
          },
        },
        {
          title: {text: 'Cost'},
          labels: {
            formatter: function() {
              return thatFile.costUnit + (this.value).toFixed(2);
            }
          },
          visible: thatFile.hasCostData,
          opposite: true
        },
      ],
      series: [
        {name: 'energy usage', type: 'column', data: dailyUsage},
        {name: 'cost', type: 'spline', yAxis: 1, data: dailyCost, visible: thatFile.hasCostData }
      ]
    });
  }

  createHourlyChart() {
    let thatFile = this.gbfile;
    let formatHour = h => {
      if (h == 0 || h == 24) {
        return '12 AM';
      }
      else if (h < 12) {
        return (h) + 'AM';
      }
      else if (h == 12) {
        return '12 PM';
      }
      else {
        return (h % 12) + 'PM';
      }
    };
    let hourlyUsage = [];
    let hourlyCost = [];
    for (let stat of this.gbfile.hourlyStats) {
      hourlyUsage.push([stat.hour, stat.value]);
      hourlyCost.push([stat.hour, stat.cost]);
    }
    this.chart = new Chart({
      chart: {type: 'column'},
      title: {text: 'Hourly Energy Usage'},
      tooltip: {
        formatter: function() {
          let tt = '<b>' + 'From ' + formatHour(this.x) + ' to ' + formatHour(this.x + 1) +'</b><br/>';
          tt += 'Usage: ' + this.points[0].y.toFixed(1) + thatFile.usageUnit + '<br/>';
          if (thatFile.hasCostData) {
            tt += 'Cost: ' + thatFile.costUnit + this.points[1].y.toFixed(2) + '<br/>';
          }
           return tt;
        },
        shared: true,
        useHTML: true
      },
      xAxis: {type: 'category', title: {text: 'Hour'}, labels: {
        formatter: function() {
          return formatHour(this.value);
        }
      }},
      yAxis: [
        {
          title: {text: 'Energy Usage'},
          labels: {
            formatter: function() {
              return (this.value).toFixed(1) + ' ' + thatFile.usageUnit;
            }
          },
        },
        {
          title: {text: 'Cost'},
          labels: {
            formatter: function() {
              return thatFile.costUnit + (this.value).toFixed(2);
            }
          },
          visible: thatFile.hasCostData,
          opposite: true
        }
      ],
      series: [
        {name: 'energy usage', type: 'column', data: hourlyUsage},
        {name: 'cost', type: 'spline', yAxis: 1, data: hourlyCost, visible: thatFile.hasCostData}
      ],
    });
  }
}
