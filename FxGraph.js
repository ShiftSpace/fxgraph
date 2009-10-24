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
    this.direction = null;
    this.processStates(options.graph);
    this.element.set('morph', {
      duration: options.duration,
      transition: options.transition,
      onComplete: this.onStateArrive.bind(this)
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
      if(state.first) this.setState(name, false);
      if(state.events) state.events.each(function(evt) {
        this.controller.addEvent(evt.type, function(evt) {
          var nextState;
          if(evt.direction) {
            this.direction = evt.direction;
            nextState = state[this.direction];
          } else {
            nextState = event.state;
          }
          this.setState(nextState);
        }.bind(this));
      }, this);
    }
  },

  /*
    Function: state
      Return the current state of the animation graph.
  */
  state: function() { return this.currentState; },
  
  /*
    Function: setState
      Set the current state of the graph. Has the side effect
      of triggering the morph to that state.
  */
  setState: function(name, animate) {
    this.currentState = name;
    if(animate === false) return;
    var state = this.graph[name];
    this.cancel();
    this.element.morph(state.selector);
  },
  
  /*
    Function: onStateArrive
      Call on each time the graph arrives at a state. If there's
      a hold, delayed execution to the next state. The next state
      is based on the current direction of the graph.
  */
  onStateArrive: function() {
    var state = this.currentState;
    if(state.onComplete) state.onComplete();
    if(state.hold) {
      this.setState.delay(state.hold.duration, this, [state[this.direction]]);
    } else {
      this.setState(state[this.direction]);
    }
  },
  
  /*
    Function: cancel
      Cancel the current animation.
  */
  cancel: function() {
    this.element.get('morph').cancel();
  }
});