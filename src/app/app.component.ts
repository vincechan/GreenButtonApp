import { GbDailyStat, GbFile, Uom } from './gb-types';
import { Component } from '@angular/core';
import { GbFileParserService } from './gb-file-parser.service';
import { Chart } from 'angular-highcharts'
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import * as Highcharts from 'highcharts';
import * as HC_exporting from 'highcharts/modules/exporting';
HC_exporting(Highcharts);

@Component({
  providers: [GbFileParserService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  chart: Chart;

  constructor(
    private gbparser: GbFileParserService,
    private http: HttpClient,
  ) {}

  parseRemoteFile(url: string) {    
    this.http.get(url, { headers: new HttpHeaders({ 'Accept': 'application/xml' }), responseType: 'text' })
    .subscribe(xmlData => {
      let gbfile = this.gbparser.parseXml(xmlData);
      this.createChart(gbfile);
    });
  }

  parseFile($event) {
    var file: File = $event.target.files[0];
    var reader: FileReader = new FileReader();

    reader.onloadend = (e) => {
      let gbfile = this.gbparser.parseXml(reader.result);
      console.log(gbfile);
      this.createChart(gbfile);
    }
    reader.readAsText(file);
  }

  createChart(gbfile: GbFile) {
    let dailyData = [];
    for (let stat of gbfile.dailyStats) {
      
      dailyData.push(
        [Date.UTC(stat.date.getFullYear(), stat.date.getMonth(), stat.date.getDate()), 
        stat.value]);
    }
    console.log(gbfile.dailyStats);
    console.log(dailyData);

    this.chart = new Chart({
      chart: {
        type: "column"
      },
      title: {
        text: "Green Button Data at: " + gbfile.location
      },
      xAxis: {
        type: 'datetime',
        title: {
            text: 'Date'
        }
      },
      yAxis: {
        title: {
          text: "Usage"
        },
      },
      series: [{
        name: 'energy usage series',
        data: dailyData
      }]
    });
  }
}
