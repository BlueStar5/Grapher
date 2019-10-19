declare let ResizeSensor;
let settings = {
  mode: "pan",

  selecting: function() {

  },
  focusZoom: true,
  rescaleContent: false,

  selected: [],
  lastSelected: function() {
    return this.selected[this.selected.length - 1];
  },
  selectRadius: 5,
  isSelected: function(object) {
    return this.selected.includes(object);
  },

  pointRadius: 4,
  selectedRadius: 6,

  gridThickness: 1,
  lineThickness: 2,
  selectedThickness: 4,

  rescaleWeightX: .5,
  rescaleWeightY: .5,

  tolerance: 1e-10,
  displayPlaces: 3,
  detailedConsole: true,
  logToConsole: true,

  gridBackground: '#002244',
  gridLineColors: {
    grid: '#ff0',
    x: '#f00',
    y: '#99ff00'
  },
  vectorColor: '#f80',
  lineColor: '#0ac'
};
let selections = {
  groups: [[], []],
  groupNum: 0,
  setNextGroup: function() {
    if (this.selectedGroup === this.groups.length - 1) {
      this.selectedGroup = 0;
    }
    else {
      this.selectedGroup++;
    }
  },
  isSelected: function(object) {
    return this.groups.some(group => group.includes(object));
  },
  getSelected: function() {
    return this.groups[this.groupNum];
  },
  lastSelected: function() {
    let selected = this.getSelected();
    return selected[selected.length - 1];
  },
  getGroup: function() {
    return this.groups[this.groupNum];
  },
  clearSelection: function() {
    this.getGroup().length = 0;
  },
  addToGroup: function(object, groupNum = this.groupNum) {
    let group;
    if (groupNum !== undefined) {
      group = this.groups[groupNum];
    }
    else {
      group = this.getGroup();
    }
    if (!group.includes(object)) {
      group.push(object);
    }
  },
  setCommandGroup: function(command, groupNum) {
    let commandGroups = this.commandSelectGroups[command];
    if (groupNum === undefined) {
      groupNum = this.groupNum;
    }
    if (!commandGroups.includes(groupNum)) {
      commandGroups.push(groupNum);
    }
  },
  getCommandGroups: function(command) {
    return this.commandSelectGroups[command].map(groupNum => this.getGroup(groupNum));
  },
  clearCommandGroups: function(command) {
    this.commandSelectGroups[command] = [];
  },
  commandSelectGroups: {
    segment: []
  }
}
let ui = {
  canvas: <HTMLCanvasElement> document.getElementById('canvas'),
  canvasWrapper: document.getElementById('canvas-wrapper'),
  leftSide: document.getElementById('left'),
  canvasOffsetX: function() {
    return parseInt(getComputedStyle(this.leftSide).getPropertyValue('width'));
  },
  buttons: document.getElementsByClassName('mode'),
  checkboxes: document.getElementsByClassName('toggle'),
  objectList: document.getElementById('object-list'),
  objectChildren: document.getElementById('object-children'),
  props: document.getElementsByClassName('properties'),
  clearProps: function() {
    for (let i = 0; i < this.props.length; i++) {
      this.props[i].classList.add('no-display');
    }
    while (this.objectChildren.firstChild) {
      this.objectChildren.removeChild(this.objectChildren.firstChild);
    }
  },
  updateVectorProps: function(vector) {
    let vectorProps : HTMLDivElement = <HTMLDivElement> document.getElementsByClassName(vector.id)[0] || <HTMLDivElement> document.getElementsByName('vector')[0];

    vectorProps.classList.remove('no-display');

    let inputX : HTMLInputElement = <HTMLInputElement> vectorProps.children.namedItem('vector-x').children[0];
    let inputY : HTMLInputElement = <HTMLInputElement> vectorProps.children.namedItem('vector-y').children[0];

    [inputX, inputY].forEach(i => i.addEventListener('input', e => {
      vector.setPosition(new Vector(parseFloat(inputX.value), parseFloat(inputY.value)));
      cam.update();
    }));

    inputX.value = vector.x;
    inputY.value = vector.y;
  },
  updateLineProps: function(line) {
    document.getElementById('line').classList.remove('no-display');

    document.getElementById('line-heading').innerHTML = line.length() === Infinity ? 'Line' : 'Line Segment';

    /*line.children.forEach(c => {
      if (!document.getElementsByClassName(c.id).length) {
        let li = document.createElement('li');
        li.appendChild(this.getVectorTemplate(c));
        this.objectChildren.appendChild(li);
      }
      this.updateVectorProps(c);
    });*/
  },
  getVectorTemplate: function(vector) {
    let textH2 = document.createTextNode('Vector');

    let h2 = document.createElement('h2');
    h2.classList.add('side-heading');
    h2.classList.add('properties-heading');
    h2.appendChild(textH2);

    let textX = document.createTextNode('x: ');

    let textY = document.createTextNode('y: ');

    let inputX = document.createElement('input');
    inputX.type = 'text';
    inputX.value = vector.x;

    let inputY = document.createElement('input');
    inputY.type = 'text';
    inputY.value = vector.y;

    [inputX, inputY].forEach(e => addEventListener('input', function(e) {
      vector.setPosition(new Vector(parseFloat(inputX.value), parseFloat(inputY.value)));
      cam.update();
    }));

    let labelX = document.createElement('label');
    labelX.setAttribute('name', 'vector-x');
    labelX.appendChild(textX);
    labelX.appendChild(inputX);

    let labelY = document.createElement('label');
    labelY.setAttribute('name', 'vector-y');
    labelY.appendChild(textY);
    labelY.appendChild(inputY);

    let div = document.createElement('div');
    div.setAttribute('name', 'vector');
    div.classList.add('properties');
    div.classList.add(vector.id);
    div.appendChild(h2);
    div.appendChild(labelX);
    div.appendChild(labelY);

    return div;
  },
  canvasCSSWidth: function() {
    return parseInt(getComputedStyle(this.canvas).getPropertyValue('width'));
  },
  canvasCSSHeight: function() {
    return parseInt(getComputedStyle(this.canvas).getPropertyValue('height'));
  },
  addObject: function(prefix, object) {
    let item = this.objectList.children.namedItem(object.id);
    let itemList;
    if (item) {
      itemList = item.children[1];
    }
    else {
      item = document.createElement("li");
      let div = document.createElement("div");
      let text = document.createTextNode(prefix + object.toString());

      item.id = object.id;

      div.appendChild(text);
      item.appendChild(div);
      itemList = document.createElement("ul");
      item.addEventListener("mousedown", function() {
        if (div.id) {
          div.id = '';
          itemList.id = '';
        }
        else {
          div.id = 'darken';
          itemList.id = 'show';
        }
      });
      this.objectList.appendChild(item);
    }
    if (object.children) {
      object.children.forEach(c => {
        if (!itemList.children.namedItem(c.id)) {
          let subItem = document.createElement("li");
          subItem.id = c.id;
          subItem.appendChild(document.createTextNode("Vector " + c.toString()));
          itemList.appendChild(subItem);
        }
      });
      item.appendChild(itemList);
    }
  },
  wireUpButtons: function() {
    for (let i = 0; i < ui.buttons.length; i++) {
      let button = ui.buttons[i];
      button.addEventListener('mousedown', e => {
        settings.mode = (<HTMLButtonElement> e.target).getAttribute('value').toLowerCase();
      });
    }
  },
  wireUpCheckboxes: function() {
    for (let i = 0; i < this.checkboxes.length; i++) {
      let checkbox = this.checkboxes[i];
      // set the checkbox to reflect default setting values
      checkbox.checked = settings[checkbox.getAttribute('value')];

      checkbox.addEventListener('change', e => {
        if (e.target.checked) {
          settings[e.target.getAttribute('value')] = true;
        }
        else {
          settings[e.target.getAttribute('value')] = false;
        }
      });
    }
  },
  init: function() {
    this.canvas.width = this.canvasCSSWidth();
    this.canvas.height = this.canvasCSSHeight();

    this.wireUpButtons();
    this.wireUpCheckboxes();
  }
};
let commands = {
  getVectorFromMouse: function(mouse) {
    let vector = canvasToGrid(new Vector(mouse.downX, mouse.downY));
    if (settings.selecting && selections.getSelected().length) {
      let lastSelected = selections.lastSelected();
      if (lastSelected &&
        lastSelected.distanceTo(vector) <= settings.selectRadius) {
        if (lastSelected.constructor.name === Vector.name) {
          vector = lastSelected;
        }
        else {
          if (lastSelected.constructor.name === LineSegment.name ||
            lastSelected.constructor.name === Line.name ||
            lastSelected.constructor.name === Arc.name) {
            vector = lastSelected.pointClosestTo(vector);

            let existingVector = plane.getVectors().filter(v => v.equals(vector))[0];
            if (existingVector) {
              vector = existingVector;
            }
            else {
              vector.fixTo(lastSelected);
            }
          }
        }
      }
    }
    console.log(vector);
    return vector;
  },
  pan: function(mouse) {
      if (mouse.down && settings.mode === 'pan') {
        cam.translate(new Vector(-mouse.deltaX, -mouse.deltaY));
      }
  },
  segment: function(mouse, keys) {
    if (settings.mode === 'segment') {
      let vector = commands.getVectorFromMouse(mouse);
      plane.addTempVector(vector);
      let command = log.getLastCommand();
      if (!command || command.constructor.name !== SegmentCreation.name || command.finished) {
        command = new SegmentCreation();
        log.logCommand(command);
      }
      command.addArg(vector);
      if (!keys.shift) {
        if (command.argsFilled()) {
          command.execute();
          if (keys.control) {
            command = new SegmentCreation();
            command.addArg(vector);
            command.nextArg();
            log.logCommand(command);
          }
        }
        else {
          command.nextArg();
        }
      }
    }
  },
  line: function(mouse, keys) {
    if (settings.mode === 'line') {
      let vector = commands.getVectorFromMouse(mouse);
      plane.addTempVector(vector);
      let command = log.getLastCommand();
      if (!command || command.constructor.name !== LineCreation.name || command.finished) {
        command = new LineCreation();
        log.logCommand(command);
      }
      command.addArg(vector);
      if (!keys.shift) {
        if (command.argsFilled()) {
          command.execute();
          if (keys.control) {
            command = new LineCreation();
            command.addArg(vector);
            command.nextArg();
            log.logCommand(command);
          }
        }
        else {
          command.nextArg();
        }
      }
    }
  },
  select: function(mouse, keys) {
    if (settings.selecting) {
      if (!keys.shift) {
        selections.clearSelection();
      }

      ui.clearProps();

      // get canvas pos of mouse click
      let pos = canvasToGrid(new Vector(mouse.downX, mouse.downY));

      // get vector within required radius of the mouse click
      let vector = plane.vectors.filter(v => pos.subtract(v).magnitude() <= settings.selectRadius)[0];

      if (vector) {
        selections.addToGroup(vector);
        ui.updateVectorProps(vector);
      }
      else {
        let line = plane.lines.filter(l => l.distanceTo(pos) <= settings.selectRadius)[0];
        if (line) {
          selections.addToGroup(line);
          ui.updateLineProps(line);
        }
        else {
          let arc = plane.arcs.filter(a => a.distanceTo(pos) <= settings.selectRadius)[0];
          if (arc) {
            selections.addToGroup(arc);
          }
        }
      }
    }
  },
  vector: function(mouse) {
    if (settings.mode === 'vector') {
      let vector = commands.getVectorFromMouse(mouse);
      plane.addVector(vector);
      ui.addObject("Vector ", vector);
    }
  },
  move: function(mouse) {
    if (settings.mode === 'move' && mouse.down) {
      let translation = new Vector(mouse.deltaX, -mouse.deltaY);
      selections.getSelected().forEach(obj => {
        if (settings.logToConsole) {
          console.log("|\n|---Object " + obj.id + " being translated---\n|");
        }
        obj.translate(translation);
        log.objectCommands++;
      });


      /*let v = plane.getVector(settings.selected[0]);
      if (v) {
        if (settings.logToConsole) {
          console.log("|\n|---Vector " + v.id + " being translated---\n|");
        }
        v.translate(translation);
        log.objectCommands++; // TODO
      }
      else {
        let l = plane.getLine(settings.selected[0]);
        if (l) {
          if (settings.logToConsole) {
            console.log("|\n|---Line " + l.id + " being translated---\n|");
          }
          l.translate(translation);
        }
      }*/
    }
  },
  arc: function(mouse, keys) {
    if (settings.mode === 'arc') {
      //
      let vector = commands.getVectorFromMouse(mouse);
      plane.addTempVector(vector);
      let command = log.getLastCommand();
      if (!command || command.constructor.name !== ArcCreation.name || command.finished) {
        command = new ArcCreation();
        log.logCommand(command);
      }
      command.addArg(vector);
      if (!keys.shift) {
        if (command.argsFilled()) {
          command.execute();
          if (keys.control) {
            command = new ArcCreation();
            command.addArg(vector);
            command.nextArg();
            log.logCommand(command);
          }
        }
        else {
          command.nextArg();
        }
      }
      console.log(command);
    }
  },
  fix: function(mouse) {
    console.log("HOYA");
    if (settings.mode === 'fix')
    {
      let v = plane.getVector(settings.selected[0]);
      if (v) {
        v.constraints.fixed = !v.constraints.fixed;
      }
    }
  }
};
let log = {
  transformations: [],
  log: function(transformation) {
    this.transformations.push(transformation);
    if (settings.logToConsole) {
      console.log(transformation.toString());
    }
  },
  plane: null,
  broadcast: function(transformation) {
    transformation.id = this.objectCommands;
    this.log(transformation);
    this.plane.getObjects().filter(obj => !(transformation.exclude && transformation.exclude.includes(obj)))
    .forEach(obj => obj.receive(transformation));
  },
  commands: [],
  logCommand: function(command) {
    this.commands.push(command);
  },
  getLastCommand: function() {
    return this.commands[this.commands.length - 1];
  },
  objectCommands: 0
};
ui.init();

let ctx = ui.canvas.getContext('2d');
ctx.strokeStyle = '#99ff00';

let keyboard = new Keyboard();
let mouse = new Mouse();

let grid = new Grid();
let plane = new Plane(grid);
let cam = new Camera(-ui.canvasCSSWidth() / 2, -ui.canvasCSSHeight() / 2, ui.canvasCSSWidth() / 2, ui.canvasCSSHeight() / 2, plane);
log.plane = plane;
// update canvas when resized
new ResizeSensor(ui.canvasWrapper, function() {
  // store old and new dimensions to calculate delta
  let newWidth = ui.canvasCSSWidth();
  let newHeight = ui.canvasCSSHeight();
  let oldWidth = ui.canvas.width;
  let oldHeight = ui.canvas.height;

  let deltaMinX = -(newWidth - oldWidth) * (1 - settings.rescaleWeightX);
  let deltaMinY = -(newHeight - oldHeight) * (1 - settings.rescaleWeightY);
  let deltaMaxX = (newWidth - oldWidth) * settings.rescaleWeightX;
  let deltaMaxY = (newHeight - oldHeight) * settings.rescaleWeightY;

  ui.canvas.width = newWidth;
  ui.canvas.height = newHeight;

  cam.resize(deltaMinX, deltaMinY, deltaMaxX, deltaMaxY);
  cam.update();
});

plane.addVector(new Vector(50, 0));
plane.addVector(new Vector(0, 0));
plane.addVector(new Vector(0, 50));

cam.update();
mouse.onWheel(mouse => {
  let sensitivity = 10;
  cam.scaleContent((cam.dilation + Math.max(Math.min(mouse.deltaWheel * sensitivity, 200 - cam.dilation), 50 - cam.dilation)) / cam.dilation, new Vector(-mouse.wheelX, -mouse.wheelY).subtract(cam.min));
}, 0);
mouse.onMove(commands.pan, 0);
mouse.onDown(commands.select, 0, [keyboard.keys]);
mouse.onMove(commands.move, 0);
mouse.onDown(commands.vector, 1);
mouse.onDown(commands.segment, 1, [keyboard.keys]);
mouse.onDown(commands.line, 1, [keyboard.keys]);
mouse.onDown(commands.arc, 1, [keyboard.keys]);
mouse.onDown(commands.fix, 1);
mouse.onMove(cam.update.bind(cam), 2);
mouse.onDown(cam.update.bind(cam), 2);
mouse.onWheel(cam.update.bind(cam), 2);

keyboard.onDown("tab", function(keys) {
  selections.groupNum++;
});
function equal(x, y) {
  return Math.abs(x - y) <= settings.tolerance;
}
function lessOrEqual(x, y) {
  return x < y || equal(x, y);
}
function getSign(n) {
  return Math.abs(n) / n || 0;
}
function floorTowardZero(n) {
  return (Math.floor(Math.abs(n)) * Math.round(Math.abs(n) / n)) || 0;
}
function roundFromZero(n, dPlaces = 0) {
  let factor = Math.pow(10, dPlaces);
  n *= factor;

  return (Math.round(Math.abs(n)) * Math.round(Math.abs(n) / n)) / factor || 0;
}
function sqr(x) {
  return x * x;
}
function canvasToGrid(vector) {
  let v = vector.add(cam.min).multiply(cam.perPixel / 100);
  v.y *= -1;
  return v;
}
function flattenArray(arr) {
  return arr.reduce((flat, item) => Array.isArray(item) ? flat.concat(item) : flat.concat([item]), [])
}
