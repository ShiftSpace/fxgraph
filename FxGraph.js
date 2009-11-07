// ==Builder==
// @required
// @package        FxGraph
// ==/Builder==

/*
  Class: Fx.Graph
    Class for simplifying multistep animations that are driven by
    user generated events - especially via the keybard/mouse. You define
    a graph of states and a controller object. The controller object
    will generate events that will drive the animation based on the
    graph option passed in via the Fx.Graph initializer.
*/
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
    
    this.directions = {};
    this.delays = [];
    this.flags = {};
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
      if(state.first) this.currentState = name;
      this.getDirections(name, graph);
      if(state.events) state.events.each(function(stateEvent) {
        this.controller.addEvent(stateEvent.type, function(evt) {
          if(this.currentState != name) return;
          if(stateEvent.flag) this.flags[stateEvent.flag] = true
          if(stateEvent.unflag) delete this.flags[stateEvent.unflag];
          if(!stateEvent.direction && !stateEvent.state) return;
          var not = $get(stateEvent, 'condition', 'not');
          if(not && (new Set($H(this.flags).getKeys())).aintersection(not).length != 0) return;
          var nextState;
          if(stateEvent.direction) {
            this.direction = stateEvent.direction;
            nextState = state[this.direction];
          } 
          if(stateEvent.state) nextState = stateEvent.state;
          this.clearTimers();
          this.setState(nextState);
        }.bind(this));
      }, this);
    }, this);
  },
  
  /*
    Function: handleEventForState
      
  */
  handleEventForState: function(state, eventType, event)
  {
    
  },
  
  /*
    Function: getDirections
      Determine the direction relationships between a state and other states on the graph.
      
    Parameters:
      state - a state name.
      graph - the graph to examine.
  */
  getDirections: function(state, graph)
  {
    var result = {};
    function collect(dir, r) {
      var curState = state;
      while(graph[curState][dir]) {
        var ns = graph[curState][dir];
        r[ns] = dir;
        curState = ns;
      }
      return r;
    };
    this.directions[state] = collect('previous', collect('next', {}));
  },
  
  /*
    Function: clearTimers
      Clear any hold timers.
  */
  clearTimers: function() {
    if(this.delays.length > 0) {
      this.delays.each($clear);
      this.delays = [];
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
      
    Parameters:
      name - the name of the state.
      options -
        animate: flag for animating to the state. defaults to true.
        direction: the direction the animation is going.
  */
  setState: function(name, options) {
    var direction = $get(options, 'direction'),
        animate = $get(options, 'animate'),
        exitFn = $get(this.graph, this.transitionState, 'onExit'),
        state = this.graph[name];
        
    if (direction){
      this.direction = direction;
    } else {
      this.direction = this.directions[$pick(this.transitionState, this.currentState)][name];
    }
    
    if(exitFn) exitFn(this.element, this);
    this.transitionState = name;
    if(state.onStart) state.onStart(this.element, this);
    this.cancel();
    
    if(animate !== false) {
      var morph = state.selector;
      if(!morph) morph = ($callable(state.styles)) ? state.styles() : state.styles;
      this.element.morph(morph);
    } else {
      this.onStateArrive();
    }
  },
  
  /*
    Function: onStateArrive
      Call on each time the graph arrives at a state. If there's
      a hold, delayed execution to the next state. The next state
      is based on the current direction of the graph.
  */
  onStateArrive: function() {
    function fix(selector) {
      return selector.substr(1, selector.length-1);
    };

    if(this.graph[this.currentState].selector) this.element.removeClass(fix(this.graph[this.currentState].selector));
    if(this.graph[this.transitionState].selector) this.element.addClass(fix(this.graph[this.transitionState].selector));

    Fx.Graph.clear.each(function(style) {
      this.element.setStyle(style, '');
    }, this);

    this.currentState = this.transitionState;
    var state = this.graph[this.currentState];
    if(state.onComplete) state.onComplete(this.element, this);
    if(state.last) return;

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
  cancel: function(clearTimers) {
    if(clearTimers === true) this.clearTimers();
    this.element.get('morph').cancel();
  }
});

Fx.Graph.clear = ['width', 'height', 'left', 'right', 'top', 'bottom', 'background-color', 'opacity', 'visibility'];