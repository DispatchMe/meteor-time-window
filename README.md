Time Window [![Build Status](https://travis-ci.org/DispatchMe/meteor-time-window.svg?branch=master)](https://travis-ci.org/DispatchMe/meteor-time-window)
=============

Parse, validate, manipulate, and display time windows in javascript.

##Usage

`meteor add dispatch:time-window`

The time range can be formatted as a string (Ex. 9:00:00 - 10:00:00) or an object with two out of three parameters, start, end, and duration (Ex. { start: new Date(), duration: 3600 }).

```
var timeWindow = new TimeWindow('9:00:00 - 10:00:00');
var otherTimeWindow = new TimeWindow({ start: 32400, duration: 7200 }) // Times in seconds

// Union of two windows
timeWindow.union(otherTimeWindow);

// Difference of two windows
timeWindow.difference(otherTimeWindow);

// Do the windows intersect
timeWindow.intersects(otherTimeWindow);

```

Checkout the [example](https://github.com/DispatchMe/meteor-time-window/tree/master/example).
