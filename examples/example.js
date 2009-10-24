window.addEvent('domready', init);

var Example = new Class({
  Implements: [Options, Events],
  name: 'Example',
  
  initialize: function() {
    console.log("init example");
  }
});

var ex;
function init() {
  ex = new Example();

  var fxgraph = new Fx.Graph($('box1'), {
    duration: 3000,
    transition: Fx.Transitions.Cubic.easeIn,
    graph: {
      start: {
        selector: '.start',
        events: [
          {type:'step1', obj:ex, next:'step1'}
        ]
      },
      step1: {
        selector: '.step1'
      }
    }
  });
  
  $('step1').addEvent('click', function() {
    ex.fireEvent('step1');
  }.bind(this));
}