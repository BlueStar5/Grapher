declare let ResizeSensor;

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

plane.addVector(new Vector(50, 0));
plane.addVector(new Vector(0, 0));
plane.addVector(new Vector(0, 50));