import {Injectable} from '@angular/core';
import {Parser} from 'xml2js';
import {evalFirst, find} from 'xml2js-xpath';

import {GbDailyStat, GbFile, GbHourlyStat, GbTimePeriod} from './gb-types';


@Injectable()
export class GbFileParserService {
  constructor() {}

  file: GbFile;
  public parseXml(xml: string): GbFile {
    this.file = new GbFile();
    this.parse(xml);
    this.validateFile();
    if (this.file.isValid) {
        this.process();
    }
    return this.file;
  }

  parse(xml: string) {
    let thatFile = this.file;

    let parser: Parser = new Parser();
    parser.parseString(xml, function(err, json) {

      thatFile.dstStartRule = parseInt(
          evalFirst(
              json, '//feed/entry/content/LocalTimeParameters/dstStartRule',
              true),
          16);

      thatFile.dstEndRule = parseInt(
          evalFirst(
              json, '//feed/entry/content/LocalTimeParameters/dstEndRule',
              true),
          16);

      thatFile.dstOffset = parseInt(evalFirst(
          json, '//feed/entry/content/LocalTimeParameters/dstOffset', true));

      thatFile.tzOffset = parseInt(evalFirst(
          json, '//feed/entry/content/LocalTimeParameters/tzOffset', true));

      thatFile.location = evalFirst(json, '//feed/entry/title', true);

      thatFile.intervalReadings =
          find(json, '//feed/entry/content/IntervalBlock/IntervalReading');
    });
  }

  /**
   * Check whether the file is valid.
   */
  validateFile() {
    if (this.file.intervalReadings && this.file.intervalReadings.length > 0) {
      this.file.hasCostData = this.file.intervalReadings[0].cost && this.file.intervalReadings[0].cost.length > 0 ? true : false;
      this.file.hasUsageData = this.file.intervalReadings[0].value && this.file.intervalReadings[0].value.length > 0 ? true : false;
    }
    console.log(this.file);

    this.file.isValid = this.file.hasUsageData;

    /** 
     * TODO: check whether the file contains electrictiy data. green button data is not exclusively electricity data.
     */
  }

  process() {
    // ensure the reading is sorted by start time in asc order
    this.file.intervalReadings.sort(
        (a, b) => a.timePeriod[0].start[0] - b.timePeriod[0].start[0]);
    
    // init hourlyStats
    this.file.hourlyStats = [];
    for (let i = 0; i < 24; i++) {
      this.file.hourlyStats.push(new GbHourlyStat(i, 0, 0));
    }

    // init dailyStats
    this.file.dailyStats = [];

    let lastDay: Date = new Date(0);
    let index = -1;
    for (let reading of this.file.intervalReadings) {
      let period: GbTimePeriod = reading.timePeriod[0];
      let cost: number = this.file.hasCostData ? reading.cost[0] : 0;
      let value: number = reading.value[0];

      // convert cost to the correct value according the unit
      cost = cost * this.file.costUnitMultiplier;

      // convert usage to the correct value according to the unit
      value = value * this.file.usageUnitMultiplier;

      let startDate: Date = this.adjustTimezone(this.file, period.start[0]);
      let startDay: Date = new Date(
          startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      if (startDay.getTime() != lastDay.getTime()) {
        this.file.dailyStats.push(new GbDailyStat(startDay, value, cost));
        index++;
        lastDay = startDay;
      } else {
        this.file.dailyStats[index].value += value;
        this.file.dailyStats[index].cost += cost;
      }

      if (!this.file.interval) {
        this.file.interval = period.duration[0];
      }

      // we will only have hourly stat if the data point is less than an hour
      // (3600 sec)
      if (this.file.interval <= 3600) {
        let hour = startDate.getHours();
        this.file.hourlyStats[hour].value += value;
        this.file.hourlyStats[hour].cost += value;
      }

      this.file.totalCost += cost;
      this.file.totalUsage += value;
    }

    this.file.startDate = this.file.dailyStats[0].date;
    this.file.endDate =
        this.file.dailyStats[this.file.dailyStats.length - 1].date;

    this.file.totalDurationInHours = Math.round(
        (this.file.endDate.valueOf() - this.file.startDate.valueOf()) / 1000 /
        60 / 60);

    if (this.file.totalDurationInHours > 0) {
      this.file.avgCostPerHour = this.file.totalCost / this.file.totalDurationInHours;
      this.file.avgUsagePerHour = this.file.totalUsage / this.file.totalDurationInHours;
    }
  }

  /**
   * Adjust a unix time from green button file timezone to local timezone in the browser. 
   * There are 3 relevant timezone:
   *   timezone in green button file (where data is collected)
   *   timezone in UTC
   *   timezone in local browser
   * We will convert from green button file timezone to UTC, then from UTC to local timezone in browser
   * 
   * @param file - the green button file that has timezone information
   * @param unixTime - the unix time that needs adjustment
   */
  adjustTimezone(file: GbFile, unixTime: number): Date {
    // get the timezone adjustment between local (in browser) to UTC
    // getTimezoneOffset() returns the offset between UTC to local in minutes. 
    // e.g. for UTC+10, -600 will be returned
    // we need to * 60 * 1000 to convert to milliseconds
    // we need to * -1 to reverse the conversation
    let localTimezoneAdjustment = (new Date()).getTimezoneOffset() * 60 * 1000 * -1;

    // get the timezone adjustment between green button file timezone to UTC
    let dataTimezoneAdjustment: number = file.tzOffset ? file.tzOffset * 1000 : 0;

    // perform adjustment and return the result
    // + dataTimezoneAdjustment to convert green button timezone to UTC
    // - localTimezoneAdjustment to convert UTC to local timezone in browser
    return new Date(unixTime * 1000 + dataTimezoneAdjustment - localTimezoneAdjustment);
  }
}
