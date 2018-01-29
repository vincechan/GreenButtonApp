export enum Uom {
  /**
   * Current, ampere, A
   */
  A = 5,

  /**
   * Plane angle, degrees, deg
   */
  deg = 9,
  
  /**
   * Relative temperature in degrees Celsius. In the SI unit system the symbol is ºC. Electric charge is measured in coulomb that has the unit symbol C. To distinguish degree Celsius from coulomb the symbol used in the UML is degC. Reason for not using ºC is the special character º is difficult to manage in software.
   */
  degC = 23,

  /**
   * Electric capacitance, Farad (C/V), °C
   */
  F = 25,

  /**
   * Time, seconds, s
   */
  sec = 27,

  /**
   * Electric inductance, Henry (Wb/A), H
   */
  H = 28,

  /**
   * Electric potential, Volt (W/A), V
   */
  V = 29,

  /**
   * Electric resistance, Ohm (V/A), O
   */
  Ohm = 30,

  /**
   * Real power, Watt. By definition, one Watt equals one Joule per second.
   * Electrical power may have real and reactive components. The real portion of
   * electrical power (I²R) or VIcos?, is expressed in Watts. (See also apparent
   * power and reactive power.), W
   */
  W = 38,

  /**
   * Apparent power, Volt Ampere (See also real power and reactive power.), VA
   */
  VA = 61,

  /**
   * Reactive power, Volt Ampere reactive. The “reactive” or “imaginary”
   * component of electrical power (VISin?). (See also real power and apparent
   * power)., VAr
   */
  VAr = 63,

  /**
   * Apparent energy, Volt Ampere hours, VAh
   */
  VAh = 71,

  /**
   * Real energy, Watt hours, Wh
   */
  Wh = 72,

  /**
   * Reactive energy, Volt Ampere reactive hours, VArh
   */
  VArh = 73,

  /**
   * Time, minute = s * 60, min
   */
  min = 159,

  /**
   * Time, hour = minute * 60, h
   */
  h = 160,


}

export class GbTimePeriod {
  duration: number[];
  start: number[];
}

/**
 * Specific value measured by a meter or other asset. Each Reading is associated
 * with a specific ReadingType.
 */
export class GbIntervalReading {
  /**
   * Specifies a cost associated with this reading, in hundred-thousandths of
   * the currency specified in the ReadingType for this reading. (e.g., 840 =
   * USD, US dollar)
   */
  cost: number[];

  /**
   * Value in units specified by ReadingType
   */
  value: number[];

  /**
   * The date time and duration of a reading. If not specified, readings for
   * each “intervalLength” in ReadingType are present.
   */
  timePeriod: GbTimePeriod[];
}

export class GbDailyStat {
  constructor(public date: Date, public value: number, public cost: number) {}
}

export class GbHourlyStat {
  constructor(public hour: number, public value: number, public cost: number) {}
}

/**
 * Kind of service represented by a usage point
 */
export enum GbServiceKind {
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
  location: string = "";

  intervalReadings: GbIntervalReading[] = [];

  dailyStats: GbDailyStat[] = [];

  hourlyStats: GbHourlyStat[] = [];

  startDate: Date;

  endDate: Date;

  /**
   * Data interval in seconds. This specifies the granularity of the data. The
   * smaller the interval, the more granualr the data.
   */
  interval: number = 0;

  /**
   * Data period. This specifies the number of days.
   */
  period: number = 0;

  /**
   * Rule to calculate end of daylight savings time in the current year.  Result
   * of dstEndRule must be greater than result of dstStartRule.
   */
  dstEndRule: number;

  /**
   * Daylight savings time offset from local standard time.
   */
  dstOffset: number = 0;

  /**
   * Rule to calculate start of daylight savings time in the current year.
   * Result of dstEndRule must be greater than result of dstStartRule.
   */
  dstStartRule: number;

  /**
   * Local time zone offset from UTCTime. Does not include any daylight savings
   * time offsets.
   */
  tzOffset: number = 0;

  totalCost: number = 0;

  totalUsage: number = 0;

  totalDurationInHours: number = 0;

  avgCostPerHour: number = 0;

  avgUsagePerHour: number = 0;

  costUnit = "$";

  costUnitMultiplier = 1/100000;

  usageUnit = "kW⋅h";

  usageUnitMultiplier = 1/1000;

  isValid: boolean = false;

  hasCostData: boolean = false;

  hasUsageData: boolean = false;

}
