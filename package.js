Package.describe({
  name: 'dispatch:time-window',
  summary: 'Time windows helpers.'
});

Package.onUse(function (api) {
  api.addFiles(['time_window.js'], 'web');
  api.export('TimeWindow', 'web');
});

Package.onTest(function (api) {
  api.use([
    'tinytest',
    'time-window'
  ], 'web');

  api.addFiles([
    'time_window_tests.js'
  ], 'web');
});

