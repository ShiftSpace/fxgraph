Fx.Graph = new Class({
  Implements: [Options, Events],

  /*
    Function: initialize
      Initialize the animation graph
    
    Parameters:
      el - a dom element
  */
  initialize: function(el, options) {
    this.element = ($type(el) == 'string') ? $(el) : el;
    this.controller = options.controller;
    this.graph = options.graph;
    this.processStates(options.graph);
    this.element.set('morph', {
      duration: options.duration,
      transition: options.transition
    });
  },
  
  /*
    Function: processStates
      Process the graph description. Adds events to the controller
      so that the graph can be controlled via events.
      
    Parameters:
      graph - the graph object passed in via the initialize options.
  */
  processStates: function(graph){
    for(var name in graph) {
      state = graph[name];
      if(state.events) state.events.each(function(evt) {
        this.controller.addEvent(evt.type, function(evt) {
          this.setState(name);
        }.bind(this));
      }, this);
    }
  },

  /*
    Function: state
      Return the current state of the animation graph.
  */
  state: function() {
    return this.__currentState;
  },
  
  /*
    Function: setState
      Set the current state of the graph. Has the side effect
      of triggering the morph to that state.
  */
  setState: function(name) {
    var state = this.graph[name];
    this.cancel();
    this.__currentState = name;
    if(state.hold) {
      this.element.morph.removeEvents('onComplete');
      this.element.morph.onComplete(this.setState.delay(state.hold.duration, this, [state.hold.next]));
    }
    this.element.morph(state.selector);
  },
  
  /*
    Function: cancel
      Cancel the current animation.
  */
  cancel: function() {
    this.element.get('morph').cancel();
  }
});