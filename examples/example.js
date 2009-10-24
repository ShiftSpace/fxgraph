window.addEvent('domready', init);

var Example = new Class({
  Implements: [Options, Events],
  name: 'Example',
  
  initialize: function() {
    this.fxgraph = new Fx.Graph($('box1'), {
      duration: 3000,
      transition: Fx.Transitions.Cubic.easeIn,
      graph: {
        start: {
          selector: '.start',
          events: [
            {type:'step1', object:this, next:'step1'}
          ]
        },
        step1: {
          selector: '.step1'
        }
      }
    });
    
    $('step1').addEvent('click', function() {
      this.fireEvent('step1');
    }.bind(this));
  }
});

var ex;
function init() {
  ex = new Example();
}