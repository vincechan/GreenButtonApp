import {HttpClient, HttpClientModule} from '@angular/common/http';
import {async, inject, TestBed} from '@angular/core/testing';

import {GbFileParserService} from './gb-file-parser.service';
import {GbFile} from './gb-types';

describe('GbFileParserService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [GbFileParserService, HttpClient]
    });
  });

  it('should be created',
     inject([GbFileParserService], (service: GbFileParserService) => {
       expect(service).toBeTruthy();
     }));

  it('should parse 1hrLP_32Days.xml',
     async(inject([HttpClient], (http: HttpClient) => {
       http.get('assets/sample/1hrLP_32Days.xml', {responseType: 'text'})
           .subscribe(data => {
             let service: GbFileParserService = new GbFileParserService();
             let gbfile: GbFile = service.parseXml(data);
             expect(gbfile.location).toEqual('a galaxy far, far away');
             expect(gbfile.intervalReadings.length).toEqual(768);
             expect(gbfile.dstOffset).toEqual(3600);
             expect(gbfile.tzOffset).toEqual(-18000);
             expect(gbfile.dstStartRule).toEqual(906895360);
             expect(gbfile.dstEndRule).toEqual(3020824576);
           });
     })));

});
