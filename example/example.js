if (Meteor.isClient) {
  var timeRange1 = new ReactiveVar('9:00:00 - 10:00:00');
  var timeRange2 = new ReactiveVar('11:00:00 - 12:00:00');

  var func = new ReactiveVar();

  Template.example.events({
    'blur .timeRange1': function (event) {
      timeRange1.set(event.currentTarget.value);
    },
    'blur .timeRange2': function (event) {
      timeRange2.set(event.currentTarget.value);
    },
    'change select': function (event) {
      func.set(event.currentTarget.value);
    }
  });

  Template.example.helpers({
    result: function () {
      if (!func.get()) return;

      var timeWindow1 = new TimeWindow(timeRange1.get());
      var timeWindow2 = new TimeWindow(timeRange2.get());

      var result = timeWindow1[func.get()](timeWindow2);

      if (func.get() === 'intersects') {
        return (result) ? 'Intersection!' : 'No intersection!';
      }

      return result;
    }
  });
}
