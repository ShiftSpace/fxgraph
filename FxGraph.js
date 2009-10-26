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
      if(state.first) {
        this.currentState = name;
      }
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
    SSLog("SET STATE:", name, "OLD:", this.transitionState, SSLogForce);
    var exitFn = $get(this.graph, this.transitionState, 'onExit');
    if(exitFn) {
      SSLog("EXIT FN", SSLogForce);
      exitFn(this.element, this);
    }
    this.transitionState = name;
    var state = this.graph[name];
    if(state.onStart) state.onStart(this.element, this);
    this.cancel();
    if(animate !== false) {
      this.element.morph(state.selector);
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
    SSLog("STATE ARRIVE:", this.transitionState, SSLogForce);
    function fix(selector) {
      return selector.substr(1, selector.length-1);
    };
    this.element.removeClass(fix(this.graph[this.currentState].selector));
    this.element.addClass(fix(this.graph[this.transitionState].selector));
    Fx.Graph.clear.each(function(style) {
      this.element.setStyle(style, '');
    }, this);
    var exitFn = $get(this.graph, this.currentState, 'onExit');
    if(exitFn) {
      SSLog("EXIT FN", SSLogForce);
      exitFn(this.element, this);
    }
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
  cancel: function() {
    this.element.get('morph').cancel();
  }
});

Fx.Graph.clear = ['width', 'height', 'left', 'right', 'top', 'bottom', 'background-color', 'opacity', 'visibility'];