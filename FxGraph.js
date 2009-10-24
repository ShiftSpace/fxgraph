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
    this.direction = 'next';
    this.delays = [];
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
    $H(graph).each(function(state, name) {
      if(state.first) {
        this.currentState = name;
      }
      if(state.events) state.events.each(function(stateEvent) {
        this.controller.addEvent(stateEvent.type, function(evt) {
          if(this.currentState != name) return;
          var nextState;
          if(stateEvent.direction) {
            this.direction = stateEvent.direction;
            nextState = state[this.direction];
          } 
          if(stateEvent.state) {
            nextState = stateEvent.state;
          }
          if(this.delays.length > 0) {
            this.delays.each($clear);
            this.delays = [];
          }
          this.setState(nextState);
        }.bind(this));
      }, this);
    }, this);
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
    this.transitionState = name;
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
    this.currentState = this.transitionState;
    var state = this.graph[this.currentState];
    if(state.onComplete) state.onComplete();
    if(state.hold) {
      this.delays.push(this.setState.delay(state.hold.duration, this, [state[this.direction]]));
    } else if(state[this.direction]) {
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