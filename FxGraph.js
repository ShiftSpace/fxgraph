Fx.Graph = new Class({
  Implements: [Options, Events],

  initialize: function(el, options) {
    this.element = el;
    this.graph = options.graph;
    this.processStates(options.graph);
    this.element.set('morph', {
      duration: options.duration,
      transition: options.transition
    });
  },
  
  processStates: function(graph){
    for(var name in graph) {
      state = graph[name];
      if(state.events) state.events.each(function(evt) {
        console.log("adding event", evt.type, "to", evt.obj.name);
        console.log(evt.obj == ex);
        evt.obj.addEvent(evt.type, function() {
          this.setState(name);
        }.bind(this));
        window.foo = evt.obj;
        console.log(evt.obj);
      }, this);
    }
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