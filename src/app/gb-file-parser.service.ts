import {Injectable} from '@angular/core';
import {Parser} from 'xml2js';
import {evalFirst, find} from 'xml2js-xpath';

import {GbFile} from './gb-types';


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

    // ensure the reading is sorted by start time in asc order
    file.intervalReadings.sort(
        (a, b) => a.timePeriod[0].start[0] - b.timePeriod[0].start[0]);

    return file;
  }
}
