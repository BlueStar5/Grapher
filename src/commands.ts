let commands = {
  getVectorFromMouse: function(mouse) {
    let vector = utils.canvasToGrid(new Vector(mouse.downX, mouse.downY));
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
      let pos = utils.canvasToGrid(new Vector(mouse.downX, mouse.downY));

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