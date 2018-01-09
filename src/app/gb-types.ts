export class GbTimePeriod {
  duration: number[];
  start: number[];
  startDate: Date;
}

/**
 * Specific value measured by a meter or other asset. Each Reading is associated with a specific ReadingType.
 */
export class GbIntervalReading {
  /**
   * Specifies a cost associated with this reading, in hundred-thousandths of the currency specified in the ReadingType for this reading. (e.g., 840 = USD, US dollar)
   */
  cost : number;

  /**
   * Value in units specified by ReadingType
   */
  value: number;

  /**
   * The date time and duration of a reading. If not specified, readings for each “intervalLength” in ReadingType are present.
   */
  timePeriod: GbTimePeriod[];
}

export class GbDailyStat {
  constructor(public Date: Date, public Value: number) {}
}

/**
 * Kind of service represented by a usage point
 */
enum GbServiceKind {
  Electricity = 0,
  Gas = 1,
  Water = 2,
  Time = 3,
  Head = 4,
  /**
   * Refuse (waster) serv ice
   */
  Refuse = 5,
  Sewerage = 6,
  /**
   * Rates (e.g. tax, charge, toll, duty, tariff, etc.) service
   */
  Rates = 7,
  TvLicense = 8,
  Internet = 9
}

export class GbFile {
  /**
   * Location
   */
  location: string;

  intervalReadings: GbIntervalReading[];

  dailyStats: GbDailyStat[];

  /**
   * Rule to calculate end of daylight savings time in the current year.  Result of dstEndRule must be greater than result of dstStartRule.
   */
  dstEndRule: number;

  /**
   * Daylight savings time offset from local standard time.
   */
  dstOffset: number;

  /**
   * Rule to calculate start of daylight savings time in the current year. Result of dstEndRule must be greater than result of dstStartRule.
   */
  dstStartRule: number;

  /**
   * Local time zone offset from UTCTime. Does not include any daylight savings time offsets.
   */
  tzOffset: number;
}
