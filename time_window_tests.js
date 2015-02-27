var ONE_HOUR = 3600; // in seconds

Tinytest.add('dispatch:time-window -- constructor', function (test) {
  // Time window from 8 AM to 3 PM
  var timeWindow = new TimeWindow('08:00:00 - 15:00:00');

  test.equal(timeWindow.start, 8 * ONE_HOUR);
  test.equal(timeWindow.end, 15 * ONE_HOUR);
  test.equal(timeWindow.duration, 7 * ONE_HOUR);

  // Time window from 9 AM to 11 AM
  timeWindow = new TimeWindow({start: 9 * ONE_HOUR, end: 11 * ONE_HOUR});

  test.equal(timeWindow.start, 9 * ONE_HOUR);
  test.equal(timeWindow.end, 11 * ONE_HOUR);
  test.equal(timeWindow.duration, 2 * ONE_HOUR);

  // Time window from 10 AM to 12 PM
  timeWindow = new TimeWindow({start: 10 * ONE_HOUR, duration: 2 * ONE_HOUR});

  test.equal(timeWindow.start, 10 * ONE_HOUR);
  test.equal(timeWindow.end, 12 * ONE_HOUR);
  test.equal(timeWindow.duration, 2 * ONE_HOUR);

  // Time window from 11 AM to 1 PM
  timeWindow = new TimeWindow({end: 13 * ONE_HOUR, duration: 2 * ONE_HOUR});

  test.equal(timeWindow.start, 11 * ONE_HOUR);
  test.equal(timeWindow.end, 13 * ONE_HOUR);
  test.equal(timeWindow.duration, 2 * ONE_HOUR);

  var newDate = new Date();

  // Time window from now to 1 hour from now
  timeWindow = new TimeWindow({start: newDate, duration: ONE_HOUR});

  var start = new Date(newDate.getFullYear(),
    newDate.getMonth(),
    newDate.getDate()
  );

  start = (newDate.getTime() - start.getTime()) / 1000;

  test.equal(timeWindow.start, start);
  test.equal(timeWindow.duration, ONE_HOUR);
  test.equal(timeWindow.end, start + ONE_HOUR);
});

Tinytest.add('dispatch:time-window -- helpers', function (test) {
  var eightFifteenToTenThirty = new TimeWindow('08:15:00 - 10:30:00');

  var nineToTen = new TimeWindow('09:00:00 - 10:00:00');
  var nineToEleven = new TimeWindow('09:00:00 - 11:00:00');
  var tenToTwelve = new TimeWindow('10:00:00 - 12:00:00');
  var twelveToThirteen =  new TimeWindow('12:00:00 - 13:00:00');

  //========================= toString =========================

  test.equal(eightFifteenToTenThirty.toString(), '8:15am - 10:30am');
  test.equal(nineToEleven.toString(), '9:00am - 11:00am');
  test.equal(tenToTwelve.toString(), '10:00am - 12:00pm');
  test.equal(twelveToThirteen.toString(), '12:00pm - 1:00pm');

  // Add seconds to end of times due to 'HH:MM:SS' formatter
  test.equal(eightFifteenToTenThirty.toString('HH:MM:SS'), '8:15:00am - 10:30:00am'); // jshint ignore:line
  test.equal(nineToEleven.toString('HH:MM:SS'), '9:00:00am - 11:00:00am');
  test.equal(tenToTwelve.toString('HH:MM:SS'), '10:00:00am - 12:00:00pm');
  test.equal(twelveToThirteen.toString('HH:MM:SS'), '12:00:00pm - 1:00:00pm');

  //========================== containedBy ===========================

  test.equal(nineToEleven.containedBy([nineToTen]), false);
  test.equal(nineToTen.containedBy([nineToEleven]), true);

  //========================== difference ===========================

  // Union of time windows
  var timeWindowDifferences =
    nineToEleven.difference([tenToTwelve, twelveToThirteen]);

  // With intersecting time windows, difference returns a new
  // time window with start being the start of the first time window,
  // end being the start of the second time window, and duration being
  // the duration of the new time window.
  test.equal(timeWindowDifferences[0].start, nineToEleven.start);
  test.equal(timeWindowDifferences[0].end, tenToTwelve.start);
  test.equal(timeWindowDifferences[0].duration,
    tenToTwelve.start - nineToEleven.start);

  // With time windows that do not intersect
  // difference returns the original time window.
  test.equal(timeWindowDifferences[1].toString(), nineToEleven.toString());

  //======================= intersects =======================

  test.isFalse(new TimeWindow('07:00:00 - 07:59:59')
    .intersects(new TimeWindow('08:00:00 - 09:00:00')));

  test.isTrue(new TimeWindow('07:00:00 - 08:00:00')
    .intersects(new TimeWindow('08:00:00 - 09:00:00')));

  test.isFalse(new TimeWindow('08:00:00 - 09:00:00')
    .intersects(new TimeWindow('09:00:01 - 10:00:00')));

  test.isTrue(new TimeWindow('08:00:00 - 08:00:01')
    .intersects(new TimeWindow('08:00:02 - 09:00:00'), 1));

  //========================== union ===========================

  // Union of time windows
  var timeWindowUnions =
    eightFifteenToTenThirty.union([nineToEleven, twelveToThirteen]);

  // 8:15 --------- 10:30
  //         9:00 -------- 11:00
  //                                12:00 ---- 13:00
  // We should expect
  // 8:15 ---------------- 11:00    12:00 ---- 13:00
  test.equal(timeWindowUnions[0].start, 8.25 * ONE_HOUR);
  test.equal(timeWindowUnions[0].end, 11 * ONE_HOUR);
  test.equal(timeWindowUnions[0].duration, 2.75 * ONE_HOUR);

  test.equal(timeWindowUnions[1].toString(), '12:00pm - 1:00pm');
});

