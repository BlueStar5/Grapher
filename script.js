var settings = {
  mode: "pan",

  selecting: false,
  focusZoom: true,
  rescaleContent: false,

  selected: null,
  selectRadius: 5,

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
var ui = {
  canvas: document.getElementById('canvas'),
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
    for (var i = 0; i < this.props.length; i++) {
      this.props[i].classList.add('no-display');
    }
    while (this.objectChildren.firstChild) {
      this.objectChildren.removeChild(this.objectChildren.firstChild);
    }
  },
  updateVectorProps: function(vector) {
    var vectorProps = document.getElementsByClassName(vector.id)[0] || document.getElementsByName('vector')[0];

    vectorProps.classList.remove('no-display');

    var inputX = vectorProps.children.namedItem('vector-x').children[0];
    var inputY = vectorProps.children.namedItem('vector-y').children[0];

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
        var li = document.createElement('li');
        li.appendChild(this.getVectorTemplate(c));
        this.objectChildren.appendChild(li);
      }
      this.updateVectorProps(c);
    });*/
  },
  getVectorTemplate: function(vector) {
    var textH2 = document.createTextNode('Vector');

    var h2 = document.createElement('h2');
    h2.classList.add('side-heading');
    h2.classList.add('properties-heading');
    h2.appendChild(textH2);

    var textX = document.createTextNode('x: ');

    var textY = document.createTextNode('y: ');

    var inputX = document.createElement('input');
    inputX.type = 'text';
    inputX.value = vector.x;

    var inputY = document.createElement('input');
    inputY.type = 'text';
    inputY.value = vector.y;

    [inputX, inputY].forEach(e => addEventListener('input', function(e) {
      vector.setPosition(new Vector(parseFloat(inputX.value), parseFloat(inputY.value)));
      cam.update();
    }));

    var labelX = document.createElement('label');
    labelX.setAttribute('name', 'vector-x');
    labelX.appendChild(textX);
    labelX.appendChild(inputX);

    var labelY = document.createElement('label');
    labelY.setAttribute('name', 'vector-y');
    labelY.appendChild(textY);
    labelY.appendChild(inputY);

    var div = document.createElement('div');
    div.setAttribute('name', 'vector');
    div.classList.add('properties');
    div.classList.add(vector.id);
    div.appendChild(h2);
    div.appendChild(labelX);
    div.appendChild(labelY);

    return div;
  },
  canvasCSSWidth: function() {
    return parseInt(getComputedStyle(canvas).getPropertyValue('width'));
  },
  canvasCSSHeight: function() {
    return parseInt(getComputedStyle(canvas).getPropertyValue('height'));
  },
  addObject: function(prefix, object) {
    var item = this.objectList.children.namedItem(object.id);
    var itemList;
    if (item) {
      itemList = item.children[1];
    }
    else {
      item = document.createElement("li");
      var div = document.createElement("div");
      var text = document.createTextNode(prefix + object.toString());

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
          var subItem = document.createElement("li");
          subItem.id = c.id;
          subItem.appendChild(document.createTextNode("Vector " + c.toString()));
          itemList.appendChild(subItem);
        }
      });
      item.appendChild(itemList);
    }
  },
  wireUpButtons: function() {
    for (var i = 0; i < ui.buttons.length; i++) {
      var button = ui.buttons[i];
      button.addEventListener('mousedown', e => {
        settings.mode = e.target.getAttribute('value').toLowerCase();
      });
    }
  },
  wireUpCheckboxes: function() {
    for (var i = 0; i < this.checkboxes.length; i++) {
      var checkbox = this.checkboxes[i];
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
var commands = {
  pan: mouse => {
      if (mouse.down && settings.mode === 'pan') {
        cam.translate(new Vector(-mouse.deltaX, -mouse.deltaY));
      }
  },
  line: mouse => {
    if (settings.mode === 'line') {
      // store vector temporarily
      var vector = canvasToGrid(new Vector(mouse.downX, mouse.downY));
      if (settings.selecting && settings.selected) {
        var vectorSelected = plane.getVector(settings.selected);
        if (vectorSelected) {
          vector = vectorSelected;
        }
        else {
          var lineSelected = plane.getLine(settings.selected);
          vector = lineSelected.pointClosestTo(vector);
          var existingVector = plane.getVectors().filter(v => v.equals(vector))[0];
          if (existingVector) {
            vector = existingVector;
          }
          else {
            vector.fixTo(lineSelected);
          }
        }
      }
      plane.addTempVector(vector);

      // create line when both vectors are available
      if (plane.tempVectors.length === 2) {
        // if the two vectors are equal, create the vector instead
        if (plane.tempVectors[1].subtract(plane.tempVectors[0]).magnitude() === 0) {
          plane.addVector(plane.tempVectors[0]);
          ui.addObject("Vector ", plane.tempVectors[0]);
        }
        else {
          var line = new Line(plane.tempVectors[0], plane.tempVectors[1]);

          plane.tempVectors.forEach(v => plane.addVector(v));
          plane.addLine(line);
          ui.addObject("Line ", line);
        }
        // clear temp vector storage
        plane.tempVectors.splice(0);
      }
    }
  },
  select: mouse => {
    if (settings.selecting) {
      // clear previous selection
      settings.selected = null;

      ui.clearProps();

      // get canvas pos of mouse click
      var pos = canvasToGrid(new Vector(mouse.downX, mouse.downY));

      // get vector within required radius of the mouse click
      var vector = plane.vectors.filter(v => pos.subtract(v).magnitude() <= settings.selectRadius)[0];

      if (vector) {
        settings.selected = vector.id;
        ui.updateVectorProps(vector);
      }
      else {
        var line = plane.lines.filter(l => l.distanceTo(pos) <= settings.selectRadius)[0];
        if (line) {
          settings.selected = line.id;
          ui.updateLineProps(line);
        }
      }
    }
  },
  vector: mouse => {
    if (settings.mode === 'vector') {
      var vector = canvasToGrid(new Vector(mouse.downX, mouse.downY));

      if (settings.selecting && settings.selected) {
        var vectorSelected = plane.getVector(settings.selected);
        if (vectorSelected) {
          vector = vectorSelected;
        }
        else {
          var lineSelected = plane.getLine(settings.selected);
          vector = lineSelected.pointClosestTo(vector);
          var existingVector = plane.getVectors().filter(v => v.equals(vector))[0];
          if (existingVector) {
            vector = existingVector;
          }
          else {
            vector.fixTo(lineSelected);
          }
        }
      }

      plane.addVector(vector);

      ui.addObject("Vector ", vector);
    }
  },
  move: mouse => {
    if (settings.mode === 'move' && mouse.down) {
      var translation = new Vector(mouse.deltaX, -mouse.deltaY);

      var v = plane.getVector(settings.selected);
      if (v) {
        if (settings.logToConsole) {
          console.log("|\n|---Vector " + v.id + " being translated---\n|");
        }
        v.translate(translation);
        log.objectCommands++; // TODO
      }
      else {
        var l = plane.getLine(settings.selected);
        if (l) {
          if (settings.logToConsole) {
            console.log("|\n|---Line " + l.id + " being translated---\n|");
          }
          l.translate(translation);
        }
      }
    }
  },
  segment: mouse => {
    if (settings.mode === 'segment') {
      // store vector temporarily
      var vector = canvasToGrid(new Vector(mouse.downX, mouse.downY));

      if (settings.selecting && settings.selected) {
        var vectorSelected = plane.getVector(settings.selected);
        if (vectorSelected) {
          vector = vectorSelected;
        }
        else {
          var lineSelected = plane.getLine(settings.selected);
          vector = lineSelected.pointClosestTo(vector);
          var existingVector = plane.getVectors().filter(v => v.equals(vector))[0];
          if (existingVector) {
            vector = existingVector;
          }
          else {
            vector.fixTo(lineSelected);
          }
        }
      }
      plane.addTempVector(vector);

      // create segment when both vectors are available
      if (plane.tempVectors.length === 2) {
        var seg = new LineSegment(plane.tempVectors[0], plane.tempVectors[1]);

        plane.tempVectors.forEach(v => plane.addVector(v));
        plane.addLine(seg);

        ui.addObject("Line Segment ", seg);

        // clear temp vector storage
        plane.tempVectors.splice(0);
      }
    }
  },
  fix: mouse => {
    console.log("HOYA");
    if (settings.mode === 'fix')
    {
      var v = plane.getVector(settings.selected);
      if (v) {
        v.constraints.fixed = !v.constraints.fixed;
      }
    }
  }
};
var log = {
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
  objectCommands: 0
};
ui.init();

var ctx = ui.canvas.getContext('2d');
ctx.strokeStyle = '#99ff00';

var keyboard = new Keyboard();
var mouse = new Mouse();

var grid = new Grid();
var plane = new Plane(grid)
var cam = new Camera(-ui.canvasCSSWidth() / 2, -ui.canvasCSSHeight() / 2, ui.canvasCSSWidth() / 2, ui.canvasCSSHeight() / 2, plane);
log.plane = plane;
// update canvas when resized
new ResizeSensor(ui.canvasWrapper, function() {
  // store old and new dimensions to calculate delta
  var newWidth = ui.canvasCSSWidth();
  var newHeight = ui.canvasCSSHeight();
  var oldWidth = ui.canvas.width;
  var oldHeight = ui.canvas.height;

  var deltaMinX = -(newWidth - oldWidth) * (1 - settings.rescaleWeightX);
  var deltaMinY = -(newHeight - oldHeight) * (1 - settings.rescaleWeightY);
  var deltaMaxX = (newWidth - oldWidth) * settings.rescaleWeightX;
  var deltaMaxY = (newHeight - oldHeight) * settings.rescaleWeightY;

  ui.canvas.width = newWidth;
  ui.canvas.height = newHeight;

  cam.resize(deltaMinX, deltaMinY, deltaMaxX, deltaMaxY);
  cam.update();
});

cam.update();

function Translation(object, vector, args) {
  this.id = 0;
  this.name = 'translation';
  this.object = object;
  this.vector = vector;
  if (args) {
    this.exclude = args.exclude;
    this.preImage = args.preImage;
    this.image = args.image;
  }
  this.getPreImage = function() {
    return this.preImage || (this.image ? this.image.translated(vector.negative()) : null) || this.object.translated(vector.negative());
  }
  this.getImage = function() {
    return this.image || (this.preImage ? this.preImage.translated(vector) : null) || this.object;
  }
  this.toString = function() {
    if (settings.detailedConsole) {
      return `${object.nameString()} ${this.getPreImage().detailsString()} has been translated ${vector.detailsString()} to ${this.getImage().detailsString()}.`;
    }
    else {
      return `${object.nameString()} has been translated.`;
    }
  }
  /*this.receivers = [];
  this.addReceiver = function(object) {
    this.receivers.push(object);
  }*/
  this.equals = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.vector.equals(transformation.vector);
  }
  this.similarTo = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name;
  }
  /*this.receivedBy = function(object) {
    return this.receivers.includes(object);
  }*/
}
function Rotation(object, center, radians, args) {
  this.id = 0;
  this.name = 'rotation';
  this.object = object;
  this.center = center;
  this.radians = radians;
  if (args) {
    this.exclude = args.exclude;
    this.preImage = args.preImage;
    this.image = args.image;
  }
  this.getPreImage = function() {
    return this.preImage || (this.image ? this.image.rotated(center, -radians) : null) || this.object.rotated(center, -radians);
  }
  this.getImage = function() {
    return this.image || (this.preImage ? this.preImage.rotated(center, radians) : null) || this.object;
  }
  this.toString = function() {
    if (settings.detailedConsole) {
      return `${object.nameString()} ${this.getPreImage().detailsString()} has been rotated ${radians} radians about ${center.detailsString()} to ${this.getImage().detailsString()}.`;
    }
    else {
      return `${object.nameString()} has been rotated.`
    }
  }
  // this.receivers = [];
  // this.addReceiver = function(object) {
  //   this.receivers.push(object);
  // }
  this.equals = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center) && this.radians === transformation.radians;
  }
  this.similarTo = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center);
  }
  // this.receivedBy = function(object) {
  //   return this.receivers.includes(object);
  // }
}
function Extension(object, endpoint, distance, args) {
  this.id = 0;
  this.name = 'extension';
  this.object = object;
  this.endpoint = endpoint;
  this.distance = distance;
  if (args) {
    this.exclude = args.exclude;
    this.preImage = args.preImage;
    this.image = args.image;
  }
  this.getPreImage = function() {
    return this.preImage || (this.image ? this.image.extended(this.endpoint, -this.distance) : null) || this.object.extended(this.endpoint, -this.distance);
  }
  this.getImage = function() {
    return this.image || (this.preImage ? this.preImage.extended(this.endpoint, this.distance) : null) || this.object;
  }
  this.toString = function() {
    if (settings.detailedConsole) {
      return `${object.nameString()} ${this.getPreImage().detailsString()} has been extended through point ${this.endpoint.detailsString()} to ${this.getImage().detailsString()}.`
    }
    else {
      return `${object.nameString()} has been extended.`
    }
  }
  // this.receivers = [];
  // this.addReceiver = function(object) {
  //   this.receivers.push(object);
  // }
  this.equals = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.endpoint.equals(transformation.endpoint) && this.distance === transformation.distance;
  }
  this.similarTo = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.endpoint.equals(transformation.endpoint);
  }
  // this.receivedBy = function(object) {
  //   return this.receivers.includes(object);
  // }
}
function Dilation(object, center, factor, args) {
  this.id = 0;
  this.name = 'dilation';
  this.object = object;
  this.center = center;
  this.factor = factor;
  if (args) {
    this.exclude = args.exclude;
    this.preImage = args.preImage;
    this.image = args.image;
  }
  this.getPreImage = function() {
    return this.preImage || (this.image ? this.image.dilated(this.center, 1 / this.factor) : null) || this.object.dilated(this.center, 1 / this.factor);
  }
  this.getImage = function() {
    return this.image || (this.preImage ? this.preImage.dilated(this.center, this.factor) : null) || this.object;
  }
  this.toString = function() {
    if (settings.detailedConsole) {
      return `${object.nameString()} ${this.getPreImage().detailsString()} has been dilated ${this.factor}x about ${this.center.detailsString()} to ${this.getImage().detailsString()}.`
    }
    else {
      return `${object.nameString()} has been dilated.`
    }
  }
  // this.receivers = [];
  // this.addReceiver = function(object) {
  //   this.receivers.push(object);
  // }
  this.equals = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center) && this.factor === transformation.factor;
  }
  this.similarTo = function(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center);
  }
  // this.receivedBy = function(object) {
  //   return this.receivers.includes(object);
  // }
}

function Circle(x, y, radius, id) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.draw = function(offset, color, dilation, thickness) {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;

    //                ctx.translate(.5, .5);
    offset = offset || new Vector(0, 0);

    ctx.beginPath();
    ctx.arc(roundFromZero(this.x * dilation + offset.x), roundFromZero(-this.y * dilation + offset.y), this.radius, 0, 2 * Math.PI, true);
    ctx.stroke();
    //ctx.translate(-.5, -.5);
  }
}
function Vector(x, y, id) {
  this.id = id;
  this.x = x;
  this.y = y;

  this.endpointOf = [];

  this.constraints = {
    fixedTo: []
  }
  this.fixTo = function(obj) {
    this.constraints.fixedTo.push(obj);
  }

  this.setAsEndpoint = function(line) {
    this.endpointOf.push(line);
  }
  this.isEndpointOf = function(line) {
    return this.endpointOf.includes(line);
  }

  this.setId = function(id) {
    this.id = id;
  }

  this.draw = function(offset, color, dilation, radius) {
    offset = offset || new Vector(0, 0);
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(roundFromZero(this.x * dilation + offset.x), roundFromZero(-this.y * dilation + offset.y), radius, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.fillText(this.id, roundFromZero(this.x * dilation + offset.x) - settings.pointRadius / 2, roundFromZero(-this.y * dilation + offset.y) - settings.pointRadius / 2 + 14, 20);
    /*ctx.strokeStyle = "#fb0"
    ctx.translate(.5, .5);
    ctx.stroke();
    ctx.translate(-.5, -.5);*/

  }
  this.angle = function(center) {
    var x;
    var y;
    if (center) {
      var relativeVector = this.subtract(center);
      x = relativeVector.x;
      y = relativeVector.y;
    }
    else {
      x = this.x;
      y = this.y;
    }
    var refAngle = Math.abs(Math.atan(y / x));
    var angle = refAngle;
    if (x < 0 && y > 0) {
      angle = Math.PI - refAngle;
    }
    if (y < 0 && x > 0) {
      angle = Math.PI * 2 - refAngle;
    }
    if (x < 0 && y < 0) {
      angle = Math.PI + refAngle;
    }
    return angle;
  }
  this.translate = function(vector, translation) {
    var image = this.add(vector);
    var fixedTo = this.constraints.fixedTo.filter(obj => !obj.constraints.fixedTo.includes(this));
    if (fixedTo.length) {
      // get the closest point of each object to this
      var closestPossiblePoints = fixedTo.map(obj => obj.pointClosestTo(image))
        // keep only the points that are on all objects
        .filter(point => fixedTo.every(obj => obj.onLine(point)));
      image = closestPossiblePoints.length ? this.getClosest(closestPossiblePoints) : this;
    }
    var displacement = image.subtract(this);
    this.setPosition(image);
    if (translation) {
      var exclude = [translation.object];
      if (translation.args && translation.args.exclude) {
        exclude = exclude.concat(translation.args.exclude);
      }
      log.broadcast(new Translation(this, displacement, {exclude: exclude}));
    }
    else {
      log.broadcast(new Translation(this, displacement));
    }
  }
  this.dilate = function(center, factor, dilation) {
    this.setPosition(this.dilated(center, factor));
    if (dilation) {
      var exclude = [dilation.object];
      if (dilation.args && dilation.args.exclude) {
        exclude = exclude.concat(dilation.args.exclude);
      }
      log.broadcast(new Dilation(this, center, factor, {exclude: exclude}));
    }
    else {
      log.broadcast(new Dilation(this, center, factor));
    }
  }
  this.dilated = function(center, factor) {
    return this.subtract(center).multiply(factor).add(center);
  }
  this.receive = function(transformation) {
    var fixedTo = this.constraints.fixedTo;
    if (fixedTo.includes(transformation.object) /*&& !this.received.some(t => t.similarTo(transformation))*/) {
      if (transformation.name === 'translation') {
      }
      if (transformation.name === 'rotation') {
        var rotation = transformation;
        if (!rotation.center.equals(this)) {
          this.rotate(rotation.center, rotation.radians, rotation);
        }
      }
      if (transformation.name === 'extension') {
        var extension = transformation;
        var line = extension.object;
        var fixedTo = line.constraints.fixedTo;
        if (!fixedTo.includes(this)) {
          var endpoint = extension.endpoint;
          var otherEndpoint = line.endpoints.filter(p => p !== endpoint)[0];
          console.log(endpoint.toString());
          console.log(otherEndpoint.toString());
          // if endpoint passed this point, then move this point back to endpoint
          if (endpoint.distanceTo(otherEndpoint) < this.distanceTo(otherEndpoint)) {
            this.translate(endpoint.subtract(this));
          }
        }
      }
      if (transformation.name === 'dilation') {
        var dilation = transformation;
        if (!dilation.center.equals(this)) {
          this.dilate(transformation.center, transformation.factor, dilation);
        }
      }
    }
  }
  this.getClosest = function(vectors) {
    return vectors.reduce((closest, cur) => this.distanceTo(cur) < this.distanceTo(closest) ? cur : closest);
  }
  this.distanceTo = function(vector) {
    return vector.subtract(this).magnitude();
  }
  this.update = function() {
    console.log('yosa');
    if (this.parents.length === 1) {
      var l = this.parents[0];
      if (!l.onLine(this)) {
        this.setPosition(l.pointClosestTo(this));
      }
    }
    // TODO work for more than 2
    if (this.parents.length > 1) {
      var inter = this.parents[0].getIntersection(this.parents[1]);
      // if the lines still intersect but this is not at the intersection
      if (inter && !this.equals(inter)) {
        this.setPosition(inter);
      }
      // if the lines no longer intersect
      if (!inter) {
        var closestLine = this.parents.reduce((closest, l) => l.distanceTo(this) < closest.distanceTo(this) ? l : closest);
        this.setPosition(closestLine.pointClosestTo(this));
      }
      this.parents.filter(p => !p.onLine(this)).forEach(p => p.removePoint(this));
    }
    if (settings.selected === this.id) {
      ui.updateVectorProps(this);
    }
    ui.addObject("Line Segment ", this);
  }
  this.setPosition = function(vector, callers) {
    if (callers) {
      var initial = this.clone();
      this.parents.forEach(p => {
        if (callers.includes(p)) {
          this.x = vector.x;
          this.y = vector.y;
        }
        else {
          this.x = initial.x;
          this.y = initial.y;
          callers.push(this);
          p.shift(vector.subtract(this), callers);
        }
      });
    }
    else {
      this.x = vector.x;
      this.y = vector.y;
    }
  }
  this.rotate = function(center, radians, rotation) {
    this.setPosition(this.rotated(center, radians));
    if (rotation) {
      var exclude = [rotation.object];
      if (rotation.args && rotation.args.exclude) {
        exclude = exclude.concat(rotation.args.exclude);
      }
      log.broadcast(new Rotation(this, center, radians, {exclude: exclude}));
    }
    else {
      log.broadcast(new Rotation(this, center, radians));
    }
  }
  this.rotated = function(center, radians) {
    var relativeVector = this.subtract(center);
    var angleSum = relativeVector.angle() + radians;
    if (!isNaN(angleSum)) {
      return new Vector(Math.cos(angleSum), Math.sin(angleSum)).multiply(relativeVector.magnitude()).add(center);
    }
    return this;
  }
  this.translated = function(vector) {
    return this.add(vector);
  }
  this.add = function(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  this.subtract = function(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }
  this.multiply = function(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  this.divide = function(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }
  this.normalize = function() {
    return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
  }
  this.floorTowardZero = function() {
    return new Vector(floorTowardZero(this.x), floorTowardZero(this.y));
  }
  this.roundFromZero = function(dPlaces) {
    return new Vector(roundFromZero(this.x, dPlaces), roundFromZero(this.y, dPlaces));
  }
  this.negative = function() {
    return new Vector(-this.x, -this.y);
  }
  this.magnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  this.equals = function(vector) {
    return equal(this.x, vector.x) && equal(this.y, vector.y);
  }
  this.clone = function(id) {
    return new Vector(this.x, this.y, id);
  }
  this.nameString = function() {
    if (this.id) {
      return 'Vector ' + this.id;
    }
    else {
      return 'Vector';
    }
  }
  this.detailsString = function() {
    return `\(${roundFromZero(this.x, 2)}, ${roundFromZero(this.y, 2)}\)`
  }
  this.toString = function() {
    return `${this.nameString()} ${this.detailsString()}`;
  }
}
function LineSegment(p1, p2) {
  this.id = undefined;
  this.p1 = p1;
  this.p2 = p2;

  this.endpoints = [];
  this.setEndpoint = function(vector) {
    if (this.id) {
      vector.setAsEndpoint(this);
      vector.fixTo(this);
    }
    this.endpoints.push(vector);
    this.fixTo(vector);
  }
  this.hasEndpoint = function(vector) {
    return this.endpoints.includes(vector);
  }

  this.constraints = {
    fixedTo: []
  };
  this.fixTo = function(obj) {
    this.constraints.fixedTo.push(obj);
  }

  this.setEndpoint(p1);
  this.setEndpoint(p2);

  this.setId = function(id) {
    this.id = id;
  }
  this.yInt = function() {
    return this.extended().getY(0);
  }
  this.midpoint = function() {
    return this.p1.add(this.p2).divide(2);
  }
  this.receive = function(transformation) {
    var fixedTo = this.constraints.fixedTo;
    if (fixedTo.includes(transformation.object)) {
        var translation = transformation;

        // p1 isn't the translated vector; p2 is the translated vector before translation
        var preImagePoint = translation.getPreImage();
        var otherEndpoint = [this.p1, this.p2].filter(p => p !== translation.object)[0].clone();
        var preImageMidpoint = new LineSegment(otherEndpoint, preImagePoint).midpoint();

        // the rotation center will be the reflection of the preimage translated point in the midpoint
        var vectorToMidpoint = preImagePoint.subtract(preImageMidpoint);
        var center = preImageMidpoint.subtract(vectorToMidpoint);

        var oldAngle = preImagePoint.angle(otherEndpoint);
        var newAngle = translation.getImage().angle(otherEndpoint);
        var angle = newAngle - oldAngle;

        var existingExclusions = [];
        if (transformation.args && transformation.args.exclude) {
          existingExclusions = transformation.args.exclude;
        }
        var rotation = new Rotation(this, center, angle, {exclude: [translation.object].concat(existingExclusions), preImage: this});
        var distance = translation.getImage().distanceTo(otherEndpoint) - translation.getPreImage().distanceTo(otherEndpoint);
        var endpoint = translation.getPreImage().rotated(center, angle);
        //var extension = new Extension(this, translation.object, distance, {preImage: rotation.getImage()});
        var dilation = new Dilation(this, center, this.length() / (this.length() - distance), {exclude: [translation.object].concat(existingExclusions), preImage: this});

        log.broadcast(rotation);
        log.broadcast(dilation);
        //log.broadcast(extension);
    }
  }
  this.translated = function(vector) {
    return new LineSegment(this.p1.translated(vector), this.p2.translated(vector));
  }
  this.extended = function(endpoint, distance) {
    if (arguments.length === 0) {
      return new Line(this.p1, this.p2);
    }
    var otherEndpoint = [this.p1, this.p2].filter(p => p !== endpoint)[0];
    var slopeVector = endpoint.subtract(otherEndpoint).normalize();
    var translation = slopeVector.multiply(distance);

    var p1, p2;
    if (this.p1 === endpoint) {
      p1 = endpoint.add(translation);
      p2 = otherEndpoint.clone();
    }
    else {
      p1 = otherEndpoint.clone();
      p2 = endpoint.add(translation);
    }
    return new LineSegment(p1, p2);
  }
  this.rotated = function(center, radians) {
    var endpoints = [this.p1, this.p2].map(p => p.rotated(center, radians));
    return new LineSegment(endpoints[0], endpoints[1]);
  }
  this.dilated = function(center, factor) {
    return new LineSegment(this.p1.dilated(center, factor), this.p2.dilated(center, factor));
  }
  this.addVector = function(vector) {
    this.children.push(vector);
    vector.addParent(this);
    this.update();
  }
  this.removePoint = function(vector) {
    this.children.splice(this.children.indexOf(vector), 1);
    vector.removeParent(this);
  }
  this.onLine = function(vector) {
    return equal(this.getX(vector.y), vector.x) || equal(this.getY(vector.x), vector.y);
  }
  this.update = function() {
    this.children.forEach(c => {
      c.update();
    });
    //plane.updateLine(this);
    if (settings.selected === this.id) {
      ui.updateLineProps(this);
    }
  }
  this.translate = function(vector) {
    var called = [];

    var children = this.children;
    while (children.filter(c => !called.includes(c)).length) {
      children.forEach(c => {
        //p.shift(vector);
        if (!called.includes(c)) {
          var v = c.constraints.fixed ? new Vector(0, 0) : vector;
          console.log("Vector " + c.id + " " + c.toString() + " was translated to " + c.add(v).toString());
          c.shift(v);
          called.push(c);
          console.log(called);
        }
      });

      var parents = children.map(c => c.parents).reduce((flat, row) => flat.concat(row), [])
      parents.forEach(p => {
        if (!called.includes(p)) {
          called.push(p);
        }
      });

      children = parents.map(p => p.children).reduce((flat, row) => flat.concat(row), []);
    }
  }
  this.getX = function(y) {
    if (y >= this.p1.y && y <= this.p2.y || y <= this.p1.y && y >= this.p2.y) {
      return (y - this.p1.y) / this.getSlope() + this.p1.x;
    }
    return undefined;
  }
  this.getY = function(x) {
    if (x >= this.p1.x && x <= this.p2.x || x <= this.p1.x && x >= this.p2.x) {
      return this.getSlope() * (x - this.p1.x) + this.p1.y;
    }
    return undefined;
  }
  this.perpThrough = function(vector) {
    var perp = new Line({slope: -1 / this.getSlope(), p: vector});

    if (this.getIntersection(perp)) {
      return perp;
    }
    return undefined;
  }
  this.distanceTo = function(vector) {
    var perp = this.perpThrough(vector);
    if (perp) {
      return vector.subtract(this.getIntersection(this.perpThrough(vector))).magnitude();
    }
    else {
      return Math.min(vector.subtract(this.p1).magnitude(), vector.subtract(this.p2).magnitude());
    }
  }
  this.pointClosestTo = function(vector) {
    var perp = this.perpThrough(vector);
    if (perp) {
      return this.getIntersection(this.perpThrough(vector));
    }
    else {
      return vector.subtract(this.p2).magnitude() < vector.subtract(this.p1).magnitude() ? this.p2 : this.p1;
    }
  }
  this.draw = function(offset, color, dilation, thickness) {
    ctx.lineWidth = thickness;

    ctx.translate(.5, .5);
    offset = offset || new Vector(0, 0);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(roundFromZero(this.p1.x * dilation + offset.x), roundFromZero(-this.p1.y * dilation + offset.y));
    ctx.lineTo(roundFromZero(this.p2.x * dilation + offset.x), roundFromZero(-this.p2.y * dilation + offset.y));
    ctx.stroke();
    ctx.translate(-.5, -.5);
  }
  this.getSlope = function() {
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }
  this.getIntersection = function(line) {
    /* m(x - x1) + y = n(x - x2) + b
    * mx - mx1 + y = nx - nx2 + b
    * mx - nx = b - nx2 + mx1 - y
    * x = (b - y + mx1 - nx2) / (m - n)
    */
    var vector;

    var x;
    if (this.getSlope() != line.getSlope()) {
      if (Math.abs(this.getSlope()) == Infinity) {
        x = this.p1.x;
        var y = line.getY(x);

        if (y != undefined && (y >= this.p1.y && y <= this.p2.y || y <= this.p1.y && y >= this.p2.y)) {
          vector = new Vector(x, y);
        }
      }
      else if (Math.abs(line.getSlope()) == Infinity) {
        x = line.p1.x;
        var y = this.getY(x);

        if (y != undefined && (y >= this.p1.y && y <= this.p2.y || y <= this.p1.y && y >= this.p2.y)) {
          vector = new Vector(x, y);
        }
      }
      else {
        x = (line.p1.y - this.p1.y + this.getSlope() * this.p1.x - line.getSlope() * line.p1.x) / (this.getSlope() - line.getSlope());
        if (this.getY(x) !== undefined && line.getY(x) !== undefined) {
          vector = new Vector(x, this.getY(x));
        }
      }
    }
    return vector;
  }
  this.length = function() {
    return p2.subtract(p1).magnitude();
  }
  this.nameString = function() {
    if (this.id) {
      return 'Line Segment ' + this.id;
    }
    else {
      return 'Line Segment';
    }
  }
  this.detailsString = function() {
    return `\(\(${roundFromZero(this.p1.x, 2)}, ${roundFromZero(this.p1.y, 2)}\), \(${roundFromZero(this.p2.x, 2)}, ${roundFromZero(this.p2.y, 2)}\)\)`;
  }
  this.toString = function() {
    return `${this.nameString()} ${this.detailsString()}`
  }
}
function Line(p1, p2) {
  this.id = undefined;
  if (arguments.length === 1) {
    var args = p1;
    if (args.slope !== undefined && args.p !== undefined) {
      this.p1 = args.p;
      this.p2 = args.p.add(new Vector(1, args.slope));
    }
  }
  else {
    this.p1 = p1;
    this.p2 = p2;
  }
  this.setId = function(id) {
    this.id = id;
  }
  this.constraints = {
    fixedTo: []
  };
  this.fixTo = function(obj) {
    this.constraints.fixedTo.push(obj);
  }
  this.p1.fixTo(this);
  this.p2.fixTo(this);

  this.receive = function() {

  }
  /*this.dilate = function(factor) {
    this.p1 = this.p1.multiply(factor);
    this.p2 = this.p2.multiply(factor);
  }
  this.translate = function(vector) {
    return new LineSegment(this.p1.add(vector), this.p2.add(vector));
  }*/

  this.midpoint = function() {
    return this.p1.add(this.p2).divide(2);
  }
  this.getX = function(y) {
    if (Math.abs(this.getSlope()) === Infinity) {
      return this.p1.x;
    }
    if (this.getSlope() === 0) {
      return undefined;
    }
    return (y - this.p1.y) / this.getSlope() + this.p1.x;
  }
  this.getY = function(x) {
    if (Math.abs(this.getSlope()) === Infinity) {
      return undefined;
    }
    if (this.getSlope() === 0) {
      return this.p1.y;
    }
    return this.getSlope() * (x - this.p1.x) + this.p1.y;
  }
  this.onLine = function(vector) {
    return equal(this.getX(vector.y), vector.x) || equal(this.getY(vector.x), vector.y);
  }
  this.perpThrough = function(vector) {
    return new Line({slope: -1 / this.getSlope(), p: vector});
  }
  this.distanceTo = function(vector) {
    return vector.subtract(this.getIntersection(this.perpThrough(vector))).magnitude();
  }
  this.pointClosestTo = function(vector) {
    return this.getIntersection(this.perpThrough(vector));
  }

  this.draw = function(offset, color, dilation, thickness) {
    ctx.lineWidth = thickness;

    ctx.translate(.5, .5);
    offset = offset || new Vector(0, 0);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(roundFromZero(this.p1.x * dilation + offset.x), roundFromZero(-this.p1.y * dilation + offset.y));
    ctx.lineTo(roundFromZero(this.p2.x * dilation + offset.x), roundFromZero(-this.p2.y * dilation + offset.y));
    ctx.stroke();
    ctx.translate(-.5, -.5);
  }
  this.getSlope = function() {
    return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
  }
  this.getIntersection = function(line) {
    /* m(x - x1) + y = n(x - x2) + b
    * mx - mx1 + y = nx - nx2 + b
    * mx - nx = b - nx2 + mx1 - y
    * x = (b - y + mx1 - nx2) / (m - n)
    */
    var x;
    // check for intersection
    if (this.getSlope() != line.getSlope()) {
      // handle vertical lines
      if (Math.abs(this.getSlope()) == Infinity) {
        x = this.p1.x;
        var y = line.getY(x);

        if (y != undefined) {
          return new Vector(x, y);
        }
      }
      else if (Math.abs(line.getSlope()) == Infinity) {
        x = line.p1.x;
        var y = this.getY(x);

        if (y >= line.p1.y && y <= line.p2.y || y <= line.p1.y && y >= line.p2.y) {
          return new Vector(x, y);
        }
      }
      else {
        x = (line.p1.y - this.p1.y + this.getSlope() * this.p1.x - line.getSlope() * line.p1.x) / (this.getSlope() - line.getSlope());
        if (this.getY(x) != undefined && line.getY(x) != undefined) {
          return new Vector(x, this.getY(x));
        }
      }
    }
    return undefined;
  }
  this.length = function() {
    return Infinity;
  }
  this.toString = function() {
    return `\(\(${this.p1.x}, ${this.p1.y}\), \(${this.p2.x}, ${this.p2.y}\)\)`
  }
}

function Grid() {
  this.gridGap = 0;
  this.lines = [];
  this.minX = 0;
  this.minY = 0;
  this.maxX = 0;
  this.maxY = 0;

  this.update = function(gridGap, perPixel, minX, minY, maxX, maxY) {
    minX *= perPixel / 100;
    minY *= perPixel / 100;
    maxX *= perPixel / 100;
    maxY *= perPixel / 100;
    var scale = gridGap * perPixel / 100;
    if (this.gridGap !== gridGap) {
      this.gridGap = gridGap;

      this.lines.splice(0);

      // reset boundaries so all lines are redrawn
      var mean = (minX + maxX) / 2;

      this.minX = mean;
      this.maxX = mean;

      if (!(mean % scale)) {
        this.lines.push(new Line(new Vector(mean, minY - scale), new Vector(mean, maxY + scale)));
      }

      mean = (minY + maxY) / 2;

      this.minY = mean;
      this.maxY = mean;

      if (!(mean % scale)) {
        this.lines.push(new Line(new Vector(minX - scale, mean), new Vector(maxX + scale, mean)));
      }
    }
    this.lines = this.lines.filter(l => l.getSlope() == Infinity && (l.p1.x >= minX && l.p1.x <= maxX) || l.getSlope() == 0 && (l.p1.y >= minY && l.p1.y <= maxY));
    // add lines from new minX to old minX
    for (var x = Math.ceil(minX / scale); x < Math.ceil(this.minX / scale); x++) {
      this.lines.push(new Line(new Vector(x * scale, minY - scale), new Vector(x * scale, maxY + scale)));
    }
    // add lines from new maxX to old maxX
    for (var x = Math.floor(maxX / scale); x > Math.floor(this.maxX / scale); x--) {
      this.lines.push(new Line(new Vector(x * scale, minY - scale), new Vector(x * scale, maxY + scale)));
    }

    // add lines from new minY to old minY
    for (var y = Math.ceil(minY / scale); y < Math.ceil(this.minY / scale); y++) {
      this.lines.push(new Line(new Vector(minX - scale, y * scale), new Vector(maxX + scale, y * scale)));
    }
    // add lines from new maxY to old maxY
    for (var y = Math.floor(maxY / scale); y > Math.floor(this.maxY / scale); y--) {
      this.lines.push(new Line(new Vector(minX - scale, y * scale), new Vector(maxX + scale, y * scale)));
    }
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  };
}
function Camera(minX, minY, maxX, maxY, plane) {
  //this.origin = new Vector(-width / 2, -height / 2);

  this.min = new Vector(minX, minY);
  this.max = new Vector(maxX, maxY);

  this.width = this.max.subtract(this.min).x;
  this.height = this.max.subtract(this.min).y;

  this.dilation = 100;
  this.perPixel = 100;
  this.gridGap = 50;

  this.plane = plane;

  this.drawLines = function(lines, gridColors) {
    var color = settings.lineColor;

    var offset = this.min.negative();

    // set the boundaries of the grid
    var boundaryX1 = new LineSegment
    (new Vector(this.plane.grid.minX, this.plane.grid.minY), new Vector(this.plane.grid.maxX, this.plane.grid.minY));
    var boundaryX2 = new LineSegment
    (new Vector(this.plane.grid.minX, this.plane.grid.maxY), new Vector(this.plane.grid.maxX, this.plane.grid.maxY));
    var boundaryY1 = new LineSegment
    (new Vector(this.plane.grid.minX, this.plane.grid.minY), new Vector(this.plane.grid.minX, this.plane.grid.maxY));
    var boundaryY2 = new LineSegment
    (new Vector(this.plane.grid.maxX, this.plane.grid.minY), new Vector(this.plane.grid.maxX, this.plane.grid.maxY));

    lines.forEach(l => {
      if (gridColors) {
        var dPlaces = settings.dPlaces;
        // if y-axis, set to y-axis color
        if (roundFromZero(l.p1.x, dPlaces) === 0 && roundFromZero(l.p2.x, dPlaces) === 0) {
          color = gridColors.x;
        }
        // if x-axis, set to x-axis color
        else if (roundFromZero(l.p1.y, dPlaces) === 0 && roundFromZero(l.p2.y, dPlaces) === 0) {
          color = gridColors.y;
        }
        // else, set to grid line color
        else {
          color = gridColors.grid;
        }
      }
      // store points of new LineSegment that will be drawn
      var points = [];
      // iterate over each endpoint of the line
      [l.p1, l.p2].forEach(p => {
        // if the line extends beyond the camera, use an intersection with the camera instead
        if (!(p.x >= this.plane.grid.minX && p.x <= this.plane.grid.maxX && p.y >= this.plane.grid.minY && p.y <= this.plane.grid.maxY) || l.length() === Infinity) {
          // find intersections of the line and the grid (4 max)
          p = [l.getIntersection(boundaryX1), l.getIntersection(boundaryX2),
            l.getIntersection(boundaryY1), l.getIntersection(boundaryY2)]
            // ensure intersection exists and isn't already a point of the new LineSegment to be drawn
            // TODO
            .filter(i => i && !(points.length && points[0].x === i.x && points[0].y === i.y))
            // choose the intersection closest to the original point
            // TODO
            .reduce((min, cur) => (!min || cur.subtract(p).magnitude() < min.subtract(p).magnitude()) ? cur : min, undefined);
          }
          else {
            p = p.clone();
          }
          // add the point to the list of valid points
          points.push(p);

        });
        if (points[0] && points[1]) {
          var thickness = settings.lineThickness;
          if (gridColors) {
            thickness = settings.gridThickness;
          }
          else if (l.id === settings.selected) {
            thickness = settings.selectedThickness;
          }
          // draw the LineSegment of the line that's in the grid
          new LineSegment(points[0], points[1]).draw(offset, color, 100 / this.perPixel, thickness);
          // if grid line
          if (gridColors) {
            var dPlaces = settings.displayPlaces;
            ctx.fillStyle = '#eee';
            // if horizontal, write y-coordinate along the y-axis
            if (l.getSlope() == 0) {
              ctx.fillText(roundFromZero(l.p1.y, dPlaces), roundFromZero(offset.x), roundFromZero(offset.y - l.p1.y * 100 / this.perPixel), 30);
            }
            // if vertical, write x-coordinate along the x-axis
            else {
              ctx.fillText(roundFromZero(l.p1.x, dPlaces), roundFromZero(l.p1.x * 100 / this.perPixel + offset.x), roundFromZero(offset.y), 30);
            }
          }
          else {
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(l.id, roundFromZero(l.midpoint().x + offset.x), roundFromZero(-l.midpoint().y + offset.y) + 4, 20);
            ctx.textAlign = "start";
            ctx.textBaseline = "alphabetic";
          }
        }
      });
    };

  this.resize = function(deltaMinX, deltaMinY, deltaMaxX, deltaMaxY) {
    this.min = this.min.add(new Vector(deltaMinX, deltaMinY));
    this.max = this.max.add(new Vector(deltaMaxX, deltaMaxY));
  };

  this.dilate = function(factor) {
    this.min = this.min.multiply(factor);
    this.max = this.max.multiply(factor);
  };

  this.scaleContent = function(change, translation) {
    this.dilation *= change;
    this.gridGap *= change;
    this.perPixel /= change;

    if (this.dilation <= 50) {
      this.gridGap *= 2;
      this.dilation = 100;
    }
    if (this.dilation >= 200) {
      this.dilation = 100;
      this.gridGap /= 2;
    }
    if (settings.focusZoom) {
      // dilate about the mouse wheel point
      this.translate(translation);
      this.dilate(1 / change);
      this.translate(translation.negative());
      this.dilate(change);
    }
  };
  this.translate = function(translation) {
    this.min = this.min.add(translation);
    this.max = this.max.add(translation);
  };

  this.update = function() {
    this.plane.grid.update(this.gridGap, this.perPixel, this.min.x, -this.max.y, this.max.x, -this.min.y);

    ctx.fillStyle = settings.gridBackground;
    ctx.fillRect(0, 0, this.max.subtract(this.min).x, this.max.subtract(this.min).y);

    this.drawLines(this.plane.grid.lines, settings.gridLineColors);
    this.drawLines(this.plane.lines);
    this.drawVectors(this.plane.getVectors());
  };
  this.drawVectors = function(vectors) {
    vectors.forEach(v => {
      this.drawVector(v);
    });
  };
  this.drawVector = function(v) {
      if (v.x >= this.plane.grid.minX && v.x <= this.plane.grid.maxX && v.y >= this.plane.grid.minY && v.y <= this.plane.grid.maxY) {
        var radius = settings.pointRadius;
        if (v.id === settings.selected) {
          radius = settings.selectedRadius;
        }
        v.draw(this.min.negative(), settings.vectorColor, 100 / this.perPixel, radius);
      }
  };
}
function Plane(grid) {
  this.vectors = [];
  this.lines = [];
  this.tempVectors = [];
  this.intersections = [];
  this.grid = grid;

  this.getObjects = function() {
    return this.vectors.concat(this.lines);
  }
  this.updateLine = function(line) {
  }

  this.numObjects = function() {
    return this.vectors.length + this.lines.length;
  }
  this.getVectors = function() {
    return this.vectors.concat(this.tempVectors);
  }
  this.getVector = function(id) {
    return this.vectors.filter(v => v.id === id)[0] || null;
  }
  this.addVector = function(vector) {
    if (vector.id === undefined) {
      vector.setId(plane.numObjects());
      this.vectors.push(vector);
    }
  }
  this.removeVector = function(vector) {
    this.vectors.splice(this.vectors.indexOf(vector), 1);
  }
  this.addTempVector = function(vector) {
    this.tempVectors.push(vector);
  }
  this.getLine = function(id) {
    return this.lines.filter(l => l.id === id)[0] || null;
  }
  this.addLine = function(line) {
    line.setId(plane.numObjects());
    this.lines.push(line);
  }
}

mouse.onWheel(mouse => {
  var sensitivity = 10;
  cam.scaleContent((cam.dilation + Math.max(Math.min(mouse.deltaWheel * sensitivity, 200 - cam.dilation), 50 - cam.dilation)) / cam.dilation, new Vector(-mouse.wheelX, -mouse.wheelY).subtract(cam.min));
}, 0);
mouse.onMove(commands.pan, 0);
mouse.onDown(commands.select, 0);
mouse.onMove(commands.move, 0);
mouse.onDown(commands.vector, 1);
mouse.onDown(commands.segment, 1);
mouse.onDown(commands.line, 1);
mouse.onDown(commands.fix, 1);
mouse.onMove(cam.update.bind(cam), 2);
mouse.onDown(cam.update.bind(cam), 2);
mouse.onWheel(cam.update.bind(cam), 2);

function Keyboard() {
  this.keys = {};
  this.downFunctions = {};

  document.addEventListener('keydown', e => {
    this.keys[e.key.toLowerCase()] = true;

    for (var key in this.downFunctions) {
      if (this.downFunctions.hasOwnProperty(key) && key.split(' ').includes(e.key.toLowerCase())) {
        if (key.split(' ').every(key => this.keys[key])) {
          this.downFunctions[key].forEach(f => f());
        }
      }
    }
  });

  document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

  this.onDown = function(key, f) {
    if (!this.downFunctions.hasOwnProperty(key)) {
      this.downFunctions[key] = [];
    }
    this.downFunctions[key].push(f);
  }
}
function Mouse() {
  this.mouse = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    downX: 0,
    downY: 0,
    down: false,
    deltaWheel: 0,
    wheelX: 0,
    wheelY: 0
  };

  this.moveFunctions = [];
  this.downFunctions = [];
  this.wheelFunctions = [];

  document.addEventListener('mousemove', e => {
    var newX = e.clientX - ui.canvasOffsetX();
    var newY = e.clientY;

    this.mouse.deltaX = newX - this.mouse.x;
    this.mouse.deltaY = newY - this.mouse.y;

    this.mouse.x = newX;
    this.mouse.y = newY;

    this.moveFunctions.forEach(list => {
      list.forEach(f => f(this.mouse));
    });
    //cam.update(this.mouse);
  });

  ui.canvas.addEventListener('mousedown', e => {
    this.mouse.down = true;

    this.mouse.downX = e.clientX - ui.canvasOffsetX();
    this.mouse.downY = e.clientY;

    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;

    this.downFunctions.forEach(list => {
      list.forEach(f => f(this.mouse));
    });
  });


  document.addEventListener('mouseup', e => this.mouse.down = false);
  ui.canvas.addEventListener('mousewheel', e => {
    this.mouse.deltaWheel = e.wheelDelta / 300;

    this.mouse.wheelX = e.clientX - ui.canvasOffsetX();
    this.mouse.wheelY = e.clientY;

    this.wheelFunctions.forEach(list => {
      list.forEach(f => f(this.mouse));
    });

    this.mouse.deltaWheel = 0;
  });

  this.onMove = function(f, priority) {
    if (!this.moveFunctions[priority]) {
      this.moveFunctions[priority] = [];
    }
    this.moveFunctions[priority].push(f);
  };

  this.onDown = function(f, priority) {
    if (!this.downFunctions[priority]) {
      this.downFunctions[priority] = [];
    }
    this.downFunctions[priority].push(f);
  };

  this.onWheel = function(f, priority) {
    if (!this.wheelFunctions[priority]) {
      this.wheelFunctions[priority] = [];
    }
    this.wheelFunctions[priority].push(f);
  }
}
function equal(x, y) {
  return Math.abs(x - y) <= settings.tolerance;
}
function getSign(n) {
  return Math.abs(n) / n || 0;
}
function floorTowardZero(n) {
  return (Math.floor(Math.abs(n)) * Math.round(Math.abs(n) / n)) || 0;
}
function roundFromZero(n, dPlaces) {
  dPlaces = dPlaces || 0;
  var factor = Math.pow(10, dPlaces);
  n *= factor;

  return (Math.round(Math.abs(n)) * Math.round(Math.abs(n) / n)) / factor || 0;
}
function canvasToGrid(vector) {
  v = vector.add(cam.min).multiply(cam.perPixel / 100);
  v.y *= -1;
  return v;
}
function flattenArray(arr) {
  return arr.reduce((flat, row) => flat.concat(row), [])
}
