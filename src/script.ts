declare let ResizeSensor;
let grapher = (function() {
  let transformationHist = [];
  let transformations = {};
  let constraints = {};
  function translate(obj: GeomObject, vector) {
    transformations[obj.id] = new Translation(vector);
  }
  function constrain(obj: GeomObject, constraint: Constraint) {
    constraints[obj.id] = constraint;
  }
  function applyTransformations() {
    plane.getObjects().forEach(obj => {
      let transformation: Transformation = transformations[obj.id];
      if (transformation) {
        obj.set(transformation.apply(obj));
      }
      transformations[obj.id] = undefined;
    });
  }
  function applyConstraints() {
    plane.getObjects().forEach(obj => {
      let constraint: Constraint = constraints[obj.id];
      if (constraint) {
        constraint.apply(obj, transformations);
      }
    })
  }
  function update() {
    applyConstraints();
    applyTransformations();
  }
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
    cam.update(ctx);
  });

  let controls = new ControlInterface(ui.canvas);
  cam.update(ctx);

  mouse.onWheel(mouse => {
    let sensitivity = 10;
    cam.scaleContent((cam.dilation + Math.max(Math.min(mouse.deltaWheel * sensitivity, 200 - cam.dilation), 50 - cam.dilation)) / cam.dilation, new Vector(-mouse.wheelX, -mouse.wheelY).subtract(cam.min));
  }, 0);
  mouse.onMove(commands.pan, 0, [mouse.mouse]);
  mouse.onDown(commands.select, 0, [mouse.mouse, keyboard.keys, cam]);
  mouse.onMove(commands.move, 0, [mouse.mouse]);
  mouse.onDown(commands.vector, 1, [mouse.mouse, cam]);
  mouse.onDown(commands.segment, 1, [mouse.mouse, keyboard.keys, cam]);
  mouse.onDown(commands.line, 1, [mouse.mouse, keyboard.keys, cam]);
  mouse.onDown(commands.arc, 1, [mouse.mouse, keyboard.keys, cam]);
  mouse.onDown(commands.fix, 1);
  mouse.onMove(cam.update.bind(cam), 2, [ctx]);
  mouse.onDown(cam.update.bind(cam), 2, [ctx]);
  mouse.onWheel(cam.update.bind(cam), 2, [ctx]);

  keyboard.onDown("tab", function(keys) {
    selections.groupNum++;
  });

  let v0 = new Vector(175, 25);
  let v1 = new Vector(100, 50);
  let v2 = new Vector(200, 100);
  let l = new LineSegment(v1.clone(), v2.clone());

  plane.addVector(v0);
  plane.addVector(v1);
  plane.addVector(v2);
  plane.addLine(l)
  //constrain(v1, new OnConstraint(l));
  constrain(v2, new OnConstraint(l));
  constrain(l, new BoundedByConstraint(v1));
  
  //constrain(v0, new OnConstraint(l));

  setInterval(function() {
    translate(v1, new Vector(2, 1));
    update();
  }, 100);
  return {
    ctx: ctx,
    cam: cam,
    plane: plane
  };
})();