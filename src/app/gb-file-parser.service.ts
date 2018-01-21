import {Injectable} from '@angular/core';
import {Parser} from 'xml2js';
import {evalFirst, find} from 'xml2js-xpath';

import {GbDailyStat, GbFile, GbTimePeriod, GbHourlyStat} from './gb-types';


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
        return  file;
    }

    // ensure the reading is sorted by start time in asc order
    file.intervalReadings.sort(
        (a, b) => a.timePeriod[0].start[0] - b.timePeriod[0].start[0]);

    file.startDate = this.adjustTimezone(file, file.intervalReadings[0].timePeriod[0].start[0]);

    file.endDate = this.adjustTimezone(file, file.intervalReadings[file.intervalReadings.length - 1].timePeriod[0].start[0]);

    file.hourlyStats = [];
    for (let i = 0; i < 24; i++) {
        file.hourlyStats.push(new GbHourlyStat(i + 1, 0));
    }

    file.dailyStats = [];
    let lastDay: Date = new Date(0);
    let index = -1;
    for (let reading of file.intervalReadings) {
      let period: GbTimePeriod = reading.timePeriod[0];
      let cost: number = reading.cost ? parseInt(reading.cost[0]) : 0;
      let value: number = parseInt(reading.value[0]);

      let startDate: Date = new Date(period.start[0] * 1000);
      let currentDay: Date = new Date(
          startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (currentDay.getTime() != lastDay.getTime()) {
        file.dailyStats.push(new GbDailyStat(currentDay, value));
        index++;
        lastDay = currentDay;
      } else {
        file.dailyStats[index].value += value;
      }

      // we will only have hourly stat if the data point is less than an hour (3600 sec)
      if (period.duration && period.duration[0] <= 3600) {
        let hour = startDate.getHours();
        file.hourlyStats[hour].value += value;
      }

      if (!file.interval) {
          file.interval = period.duration[0];
      }
    }

    if (file.intervalReadings && file.intervalReadings[0] && 
        file.intervalReadings[0].timePeriod && file.intervalReadings[0].timePeriod[0] &&
        file.intervalReadings[0].timePeriod[0].duration && file.intervalReadings[0].timePeriod[0].duration[0]) {
        file.interval = file.intervalReadings[0].timePeriod[0].duration[0];
    }

     file.period = Math.ceil( (file.endDate.getTime() - file.startDate.getTime()) / 1000 / 3600 / 24);

     console.log(file);

    return file;
  }


  adjustTimezone(file: GbFile, unixTime: number) : Date {
    let timezoneAdjustment: number = file.tzOffset ? file.tzOffset * 1000 : 0;
    return new Date(unixTime * 1000 + timezoneAdjustment);
  }
}
