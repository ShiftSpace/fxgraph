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
      if(evt.key == 'r') {
        this.fireEvent('reset');
      }
    }.bind(this));
    
    $('box1').addEvent('mouseenter', function(evt) {
      evt = new Event(evt);
      this.fireEvent('mouseover');
    }.bind(this));
    
    $('box1').addEvent('mouseleave', function(evt) {
      evt = new Event(evt);
      this.fireEvent('mouseout');
    }.bind(this));
  }
});


var ex;
function init() {
  ex = new Example();

  var fxgraph = new Fx.Graph($('box1'), {
    controller: ex,
    duration: 400,
    transition: Fx.Transitions.Cubic.easeIn,
    graph: {
      start: {
        first: true,
        next: 'step1',
        selector: '.start',
        events: [
          {type: 'mouseover', state: 'step3', flag: 'mouse'},
          {type: 'mouseout', state: 'start', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
          {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
          {type: 'shiftup', state: 'start', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
        ]
      },
      step1: {
        previous: 'start',
        next: 'step2',
        selector: '.step1',
        hold: {duration: 1000},
        events: [
          {type: 'mouseover', state: 'step3', flag: 'mouse'},
          {type: 'mouseout', state: 'start', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
          {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
          {type: 'shiftup', state: 'start', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
        ]
      },
      step2: {
        previous: 'step1',
        next: 'step3',
        selector: '.step2',
        hold: {duration: 1000},
        events: [
          {type: 'mouseover', direction: 'step3', flag: 'mouse'},
          {type: 'mouseout', state: 'start', direction:'previous', unflag: 'mouse', condition: {not: ['shift']}},
          {type: 'shiftdown', direction: 'next', flag: 'shift', condition: {not: ['mouse']}},
          {type: 'shiftup', direction: 'previous', unflag: 'shift', condition: {not: ['mouse']}}
        ]
      },
      step3: {
        last: true,
        previous: 'step2',
        selector: '.step3',
        events: [
          {type: 'showmenu', flag:'menu'},
          {type: 'hidemenu', unflag:'menu'},
          {type: 'showconsole', flag:'console'},
          {type: 'hideconsole', unflag:'console'},
          {type: 'mouseout', state: 'step1', direction: 'previous', unflag:'mouse', condition: {not: ['shift', 'menu', 'console']}},
          {type: 'shiftup', state: 'step1', direction: 'previous', unflag:'shift', condition: {not: ['mouse']}},
          {type: 'reset', state: 'step1', direction: 'previous'}
        ]
      }
    }
  });
  
  $('step3').addEvent('click', function(evt) {
    evt = new Event(evt);
    fxgraph.setState('step3', false);
  });
}