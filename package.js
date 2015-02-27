Package.describe({
  name: 'dispatch:time-window',
  summary: 'Parse, validate, manipulate, and display time windows in javascript.',
  version: '1.0.0',
  git: 'https://github.com/DispatchMe/meteor-time-window'
});

Package.onUse(function (api) {
  api.addFiles(['time_window.js'], 'web');
  api.export('TimeWindow', 'web');
});

Package.onTest(function (api) {
  api.use([
    'tinytest',
    'dispatch:time-window'
  ], 'web');

  api.addFiles([
    'time_window_tests.js'
  ], 'web');
});

