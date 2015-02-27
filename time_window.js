// In seconds
var ONE_MINUTE = 60;
var ONE_HOUR = 3600;

/**
 * A start time, end time, and duration.
 * @param {Object} [input] Can be a formatted string, HH:MM:SS
 * or an options hash with
 * { start: secondsFromOrigin, end: secondsFromOrigin, duration: seconds }
 * or an options hash with
 * { start: date, end: date }
 * Only two properties must be specified if using an options hash,
 * or an array of strings or option hashes.
 * @constructor
 */
TimeWindow = function (input) {
  if (typeof input === 'string') {
    var separator = ' - ';

    var start = input.substring(0, input.indexOf(separator)).split(':');
    var end = input.substring(input.indexOf(separator) +
    separator.length).split(':');

    this.start = parseInt(start[0]) * ONE_HOUR +
    parseInt(start[1]) * ONE_MINUTE +
    parseInt(start[2]);

    this.end = parseInt(end[0]) * ONE_HOUR +
    parseInt(end[1]) * ONE_MINUTE +
    parseInt(end[2]);
  } else if (typeof input === 'object') {
    if (input.start instanceof Date) {
      var newStart = new Date(input.start.getFullYear(),
        input.start.getMonth(),
        input.start.getDate()
      );

      input.start = (input.start.getTime() - newStart.getTime()) / 1000;
    }

    if (input.end instanceof Date) {
      var newEnd = new Date(input.end.getFullYear(),
        input.end.getMonth(),
        input.end.getDate()
      );

      input.end = (input.end.getTime() - newEnd.getTime()) / 1000;
    }

    this.start = input.start || input.end - input.duration;
    this.end = input.end || input.start + input.duration;
  } else {
    throw new Error('Could not parse arguments. Must be string or an object.');
  }

  this.duration = Math.round(this.end - this.start);
};

/**
 * Return a clone of the current time window.
 * @return {TimeWindow}
 */
TimeWindow.prototype.clone = function () {
  return new TimeWindow({start: this.start, end: this.end});
};

/**
 * Return true if any of the windows contain this window.
 * @param {TimeWindow||Array.<TimeWindow>} windows
 * @param {Number} [overlapThreshold]
 * @returns {*}
 */
TimeWindow.prototype.containedBy = function (windows, overlapThreshold) {
  if (!windows || windows.length === 0) return false;
  if (!windows.length) windows = [windows];

  overlapThreshold = overlapThreshold || 0;

  for (var i = 0; i < windows.length; i++) {
    var compareTo = windows[i];
    if (compareTo.start <= this.start + overlapThreshold &&
      compareTo.end >= this.end - overlapThreshold) return true;
  }

  return false;
};

/**
 * Return the difference of intersecting time windows.
 * @param {TimeWindow||Array.<TimeWindow>} windows The neighboring time windows.
 * @return {Array.<TimeWindow>} Return current time window if no intersection.
 */
TimeWindow.prototype.difference = function (windows) {
  if (!windows || windows.length === 0) return [];
  if (!windows.length) windows = [windows];

  var timeWindows = [];

  var difference = this.clone();

  windows.forEach(function (timeWindow) {
    // No intersection
    if (!difference.intersects(timeWindow, 1)) {
      timeWindows.push(difference);
      return;
    }

    if (difference.start < timeWindow.start &&
      difference.end < timeWindow.end) {
      timeWindows.push(new TimeWindow({
        start: difference.start,
        end: timeWindow.start
      }));
    } else if (difference.start > timeWindow.start &&
      difference.end > timeWindow.end) {
      timeWindows.push(new TimeWindow({
        start: timeWindow.end,
        end: difference.end
      }));
    } else if (difference.start < timeWindow.start &&
      difference.end > timeWindow.end) {
      timeWindows.push(new TimeWindow({
        start: difference.start,
        end: timeWindow.start
      }));
      timeWindows.push(new TimeWindow({
        start: timeWindow.end,
        end: difference.end
      }));
    }
  });

  return timeWindows;
};

/**
 * Check if the windows intersect.
 * @param {TimeWindow||Array.<TimeWindow>} windows The windows to check.
 * @param {Number} [threshold] Seconds of tolerance.
 * @return {Boolean} Return false if no intersection.
 */
TimeWindow.prototype.intersects = function (windows, threshold) {
  if (!windows || windows.length === 0) return false;

  if (!windows.length) windows = [windows];

  threshold = threshold || 0;

  var self = this;

  for (var i = 0; i < windows.length; i++) {
    var compareTo = windows[i];

    // If this window ends before the compareTo starts
    // or starts after the compareTo ends -- they do not intersect.
    var doNotIntersect = self.end < compareTo.start - threshold ||
      self.start > compareTo.end + threshold;

    // Otherwise they do
    // 8:15 --------- 10:30
    //         9:00 -------- 11:00
    if (!doNotIntersect) return true;
  }

  return false;
};

/**
 * A start and end time displayed as a string
 * @param {String} [format] Default to HH:MM (also accepts HH:MM:SS)
 * @return {String}
 */
TimeWindow.prototype.toString = function (format) {
  var startSuffix = 'am';
  var endSuffix = 'am';

  var startHours = (this.start - this.start % ONE_HOUR) / ONE_HOUR;
  var startMinutes = ((this.start - startHours * ONE_HOUR) -
    (this.start - startHours * ONE_HOUR) % ONE_MINUTE) / ONE_MINUTE;
  var startSeconds = this.start - startHours * ONE_HOUR -
    startMinutes * ONE_MINUTE;

  var endHours = (this.end - this.end % ONE_HOUR) / ONE_HOUR;
  var endMinutes = ((this.end - endHours * ONE_HOUR) -
    (this.end - endHours * ONE_HOUR) % ONE_MINUTE) / ONE_MINUTE;
  var endSeconds = this.end - endHours * ONE_HOUR - endMinutes * ONE_MINUTE;

  if (startHours > 11) {
    startHours -= (startHours === 12) ? 0 : 12;
    startSuffix = 'pm';
  }
  if (endHours > 11) {
    endHours -= (endHours === 12) ? 0 : 12;
    endSuffix = 'pm';
  }

  if (startMinutes < 10) startMinutes = '0' + startMinutes;
  if (endMinutes < 10) endMinutes = '0' + endMinutes;

  if (startSeconds < 10) startSeconds = '0' + startSeconds;
  if (endSeconds < 10) endSeconds = '0' + endSeconds;

  var startTime = startHours + ':' + startMinutes;
  var endTime = endHours + ':' + endMinutes;

  if (format === 'HH:MM:SS') {
    startTime += ':' + startSeconds;
    endTime += ':' + endSeconds;
  }

  return startTime + startSuffix + ' - ' + endTime + endSuffix;
};

/**
 * Return an array of unioned time windows.
 * @param {Array.<TimeWindow>} windows The neighboring time windows.
 * @param {Number} [threshold] The threshold to join windows in seconds.
 * @return {Array.<TimeWindow>} Return current time window if no intersection.
 */
TimeWindow.prototype.union = function (windows, threshold) {
  if (!windows) return [];
  if (!windows.length) windows = [windows];

  var unionWindows = [];

  var union = this.clone();

  windows.forEach(function (timeWindow) {
    // No intersection
    if (!union.intersects(timeWindow, threshold)) {
      unionWindows.push(timeWindow);
      return;
    }

    if (timeWindow.start < union.start) union.start = timeWindow.start;
    if (timeWindow.end > union.end) union.end = timeWindow.end;
  });

  union.duration = union.end - union.start;
  unionWindows.unshift(union);

  return unionWindows;
};

// ********************* Utility Functions **********************

/**
 * Create an array of time windows from an array of inputs.
 * It will combine windows based on the overlap threshold.
 * @param {Array.<string||Object>} input Ex. [8:00-11:59,12:00-15:59]
 * @param {Number} [joinThreshold] The threshold before joining windows.
 * @returns {Array.<TimeWindow>}
 */
TimeWindow.array = function (input, joinThreshold) {
  if (!input || !input.length) return [];

  // Combine the array of inputs into fewer time windows
  // [8:00:00 - 11:59:59, 12:00:00 - 15:59:59, 16:00:00 - 19:59:59] =>
  // [8:00:00 - 19:59:59]

  // clone the array so we can safely mutate it
  input = input.slice();

  var timeWindow = new TimeWindow(input.shift());
  var timeWindows = input.map(function (hours) {
    return new TimeWindow(hours);
  });

  return timeWindows.length ?
    timeWindow.union(timeWindows, joinThreshold)
    : [timeWindow];
};
