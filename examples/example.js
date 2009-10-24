window.addEvent('domready', init);


var Example = new Class({
  Implements: [Options, Events],
  name: 'Example',
  
  initialize: function() {
    window.addEvent('keydown', function(evt) {
      evt = new Event(evt);
      if(evt.code == 16) {
        this.fireEvent('shiftdown');
      }
    }.bind(this));

    window.addEvent('keyup', function(evt) {
      evt = new Event(evt)
      if(evt.code == 16) {
        this.fireEvent('shiftup');
      }
    }.bind(this));
  }
});


var ex;
function init() {
  ex = new Example();

  var fxgraph = new Fx.Graph($('box1'), {
    controller: ex,
    duration: 500,
    transition: Fx.Transitions.Cubic.easeIn,
    graph: {
      start: {
        first: true,
        next: 'step1',
        selector: '.start',
        events: [
          {type:'shiftdown', direction:'next'},
          {type:'shiftup', state:'start', direction:'previous'}
        ]
      },
      step1: {
        previous: 'start',
        next: 'step2',
        selector: '.step1',
        hold: {duration: 1000},
        events: [
          {type:'shiftdown', direction:'next'},
          {type:'shiftup', state:'start', direction:'previous'}
        ]
      },
      step2: {
        previous: 'step1',
        next: 'step3',
        selector: '.step2',
        hold: {duration: 1000},
        events: [
          {type:'shiftdown', direction:'next'},
          {type:'shiftup', direction:'previous'}
        ]
      },
      step3: {
        previous: 'step2',
        selector: '.step3',
        events: [
          {type:'reset', state:'step1'}
        ]
      }
    }
  });
}