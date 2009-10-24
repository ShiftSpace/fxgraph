Fx.Graph = new Class({
  Implements: [Options, Events],
  
  defaults: {
    
  },

  initialize: function(el, options) {
    this.element = el;
    this.setOptions(this.defaults, options);
    this.graph = this.options.graph;
    this.processStates(this.options.graph);
    this.element.set('morph', {
      duration: this.options.duration,
      transition: this.options.transition
    });
  },
  
  processStates: function(graph){
    $H(graph).each(function(state, name) {
      if(state.events) state.events.each(function(event) {
        event.object.addEvent(event.type, function() {
          this.setState(name);
        }.bind(this));
      }, this);
    }, this);
  },

  state: function() {
    return this.__currentState;
  },
  
  setState: function(name) {
    var state = this.graph[name];
    this.element.get('morph').cancel();
    this.__currentState = name;
    if(state.hold) {
      this.element.morph.removeEvents('onComplete');
      this.element.morph.onComplete(this.setState.delay(state.hold.duration, this, [state.hold.next]));
    }
    this.element.morph(state.selector);
  },
  
  cancel: function() {
    this.element.get('morph').cancel();
  }
});