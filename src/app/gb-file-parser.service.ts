import {Injectable} from '@angular/core';
import {Parser} from 'xml2js';
import {evalFirst, find} from 'xml2js-xpath';

import {GbDailyStat, GbFile, GbHourlyStat, GbTimePeriod} from './gb-types';


@Injectable()
export class GbFileParserService {
  constructor() {}

  public parseXml(xmlString: string): GbFile {
    var file: GbFile = new GbFile();

    let parser: Parser = new Parser();
    parser.parseString(xmlString, function(err, json) {

      file.dstStartRule = parseInt(
          evalFirst(
              json, '//feed/entry/content/LocalTimeParameters/dstStartRule',
              true),
          16);

      file.dstEndRule = parseInt(
          evalFirst(
              json, '//feed/entry/content/LocalTimeParameters/dstEndRule',
              true),
          16);

      file.dstOffset = parseInt(evalFirst(
          json, '//feed/entry/content/LocalTimeParameters/dstOffset', true));

      file.tzOffset = parseInt(evalFirst(
          json, '//feed/entry/content/LocalTimeParameters/tzOffset', true));

      file.location = evalFirst(json, '//feed/entry/title', true);

      file.intervalReadings =
          find(json, '//feed/entry/content/IntervalBlock/IntervalReading');
    });

    if (file.intervalReadings == null || file.intervalReadings.length == 0) {
      return file;
    }

    // ensure the reading is sorted by start time in asc order
    file.intervalReadings.sort(
        (a, b) => a.timePeriod[0].start[0] - b.timePeriod[0].start[0]);

    file.hourlyStats = [];
    for (let i = 0; i < 24; i++) {
      file.hourlyStats.push(new GbHourlyStat(i + 1, 0, 0));
    }

    file.dailyStats = [];
    let lastDay: Date = new Date(0);
    let index = -1;
    for (let reading of file.intervalReadings) {
      let period: GbTimePeriod = reading.timePeriod[0];
      let cost: number = reading.cost ? parseInt(reading.cost[0]) : 0;
      let value: number = parseInt(reading.value[0]);
      
      let startDate: Date = this.adjustTimezone(file, period.start[0]);
      let startDay: Date = new Date(
          startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (startDay.getTime() != lastDay.getTime()) {
        file.dailyStats.push(new GbDailyStat(startDay, value, cost));
        index++;
        lastDay = startDay;
      } else {
        file.dailyStats[index].value += value;
        file.dailyStats[index].cost += cost;
      }

      if (!file.interval) {
        file.interval = period.duration[0];
      }

      // we will only have hourly stat if the data point is less than an hour
      // (3600 sec)
      if (file.interval <= 3600) {
        let hour = startDate.getHours();
        file.hourlyStats[hour].value += value;
        file.hourlyStats[hour].cost += value;
      }

      file.totalCost += cost;
      file.totalUsage += value;
    }

    file.startDate = file.dailyStats[0].date;
    file.endDate = file.dailyStats[file.dailyStats.length - 1].date;

    
    file.totalDurationInHours = Math.round((file.endDate.valueOf() - file.startDate.valueOf()) / 1000 / 60 / 60);
    console.log(file.totalDurationInHours);
    if (file.totalDurationInHours > 0) {
        file.avgCostPerHour = Math.round(file.totalCost / file.totalDurationInHours);
        file.avgUsagePerHour = Math.round(file.totalUsage / file.totalDurationInHours);
    }
    

    console.log(file);

    return file;
  }


  adjustTimezone(file: GbFile, unixTime: number): Date {
    let timezoneAdjustment: number = file.tzOffset ? file.tzOffset * 1000 : 0;
    return new Date(unixTime * 1000 + timezoneAdjustment);
  }
}
