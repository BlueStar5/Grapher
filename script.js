let settings = {
    mode: "pan",
    selecting: function () {
    },
    focusZoom: true,
    rescaleContent: false,
    selected: [],
    lastSelected: function () {
        return this.selected[this.selected.length - 1];
    },
    selectRadius: 5,
    isSelected: function (object) {
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
    setNextGroup: function () {
        if (this.selectedGroup === this.groups.length - 1) {
            this.selectedGroup = 0;
        }
        else {
            this.selectedGroup++;
        }
    },
    isSelected: function (object) {
        return this.groups.some(group => group.includes(object));
    },
    getSelected: function () {
        return this.groups[this.groupNum];
    },
    lastSelected: function () {
        let selected = this.getSelected();
        return selected[selected.length - 1];
    },
    getGroup: function () {
        return this.groups[this.groupNum];
    },
    clearSelection: function () {
        this.getGroup().length = 0;
    },
    addToGroup: function (object, groupNum = this.groupNum) {
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
    setCommandGroup: function (command, groupNum) {
        let commandGroups = this.commandSelectGroups[command];
        if (groupNum === undefined) {
            groupNum = this.groupNum;
        }
        if (!commandGroups.includes(groupNum)) {
            commandGroups.push(groupNum);
        }
    },
    getCommandGroups: function (command) {
        return this.commandSelectGroups[command].map(groupNum => this.getGroup(groupNum));
    },
    clearCommandGroups: function (command) {
        this.commandSelectGroups[command] = [];
    },
    commandSelectGroups: {
        segment: []
    }
};
let ui = {
    canvas: document.getElementById('canvas'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    leftSide: document.getElementById('left'),
    canvasOffsetX: function () {
        return parseInt(getComputedStyle(this.leftSide).getPropertyValue('width'));
    },
    buttons: document.getElementsByClassName('mode'),
    checkboxes: document.getElementsByClassName('toggle'),
    objectList: document.getElementById('object-list'),
    objectChildren: document.getElementById('object-children'),
    props: document.getElementsByClassName('properties'),
    clearProps: function () {
        for (let i = 0; i < this.props.length; i++) {
            this.props[i].classList.add('no-display');
        }
        while (this.objectChildren.firstChild) {
            this.objectChildren.removeChild(this.objectChildren.firstChild);
        }
    },
    updateVectorProps: function (vector) {
        let vectorProps = document.getElementsByClassName(vector.id)[0] || document.getElementsByName('vector')[0];
        vectorProps.classList.remove('no-display');
        let inputX = vectorProps.children.namedItem('vector-x').children[0];
        let inputY = vectorProps.children.namedItem('vector-y').children[0];
        [inputX, inputY].forEach(i => i.addEventListener('input', e => {
            vector.setPosition(new Vector(parseFloat(inputX.value), parseFloat(inputY.value)));
            cam.update();
        }));
        inputX.value = vector.x;
        inputY.value = vector.y;
    },
    updateLineProps: function (line) {
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
    getVectorTemplate: function (vector) {
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
        [inputX, inputY].forEach(e => addEventListener('input', function (e) {
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
    canvasCSSWidth: function () {
        return parseInt(getComputedStyle(this.canvas).getPropertyValue('width'));
    },
    canvasCSSHeight: function () {
        return parseInt(getComputedStyle(this.canvas).getPropertyValue('height'));
    },
    addObject: function (prefix, object) {
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
            item.addEventListener("mousedown", function () {
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
    wireUpButtons: function () {
        for (let i = 0; i < ui.buttons.length; i++) {
            let button = ui.buttons[i];
            button.addEventListener('mousedown', e => {
                settings.mode = e.target.getAttribute('value').toLowerCase();
            });
        }
    },
    wireUpCheckboxes: function () {
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
    init: function () {
        this.canvas.width = this.canvasCSSWidth();
        this.canvas.height = this.canvasCSSHeight();
        this.wireUpButtons();
        this.wireUpCheckboxes();
    }
};
let commands = {
    getVectorFromMouse: function (mouse) {
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
    pan: function (mouse) {
        if (mouse.down && settings.mode === 'pan') {
            cam.translate(new Vector(-mouse.deltaX, -mouse.deltaY));
        }
    },
    segment: function (mouse, keys) {
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
    line: function (mouse, keys) {
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
    select: function (mouse, keys) {
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
    vector: function (mouse) {
        if (settings.mode === 'vector') {
            let vector = commands.getVectorFromMouse(mouse);
            plane.addVector(vector);
            ui.addObject("Vector ", vector);
        }
    },
    move: function (mouse) {
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
    arc: function (mouse, keys) {
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
    fix: function (mouse) {
        console.log("HOYA");
        if (settings.mode === 'fix') {
            let v = plane.getVector(settings.selected[0]);
            if (v) {
                v.constraints.fixed = !v.constraints.fixed;
            }
        }
    }
};
let log = {
    transformations: [],
    log: function (transformation) {
        this.transformations.push(transformation);
        if (settings.logToConsole) {
            console.log(transformation.toString());
        }
    },
    plane: null,
    broadcast: function (transformation) {
        transformation.id = this.objectCommands;
        this.log(transformation);
        this.plane.getObjects().filter(obj => !(transformation.exclude && transformation.exclude.includes(obj)))
            .forEach(obj => obj.receive(transformation));
    },
    commands: [],
    logCommand: function (command) {
        this.commands.push(command);
    },
    getLastCommand: function () {
        return this.commands[this.commands.length - 1];
    },
    objectCommands: 0
};
class Grid {
    constructor() {
        this.gridGap = 0;
        this.lines = [];
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }
    update(gridGap, perPixel, minX, minY, maxX, maxY) {
        minX *= perPixel / 100;
        minY *= perPixel / 100;
        maxX *= perPixel / 100;
        maxY *= perPixel / 100;
        let scale = gridGap * perPixel / 100;
        if (this.gridGap !== gridGap) {
            this.gridGap = gridGap;
            this.lines.splice(0);
            // reset boundaries so all lines are redrawn
            let mean = (minX + maxX) / 2;
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
        for (let x = Math.ceil(minX / scale); x < Math.ceil(this.minX / scale); x++) {
            this.lines.push(new Line(new Vector(x * scale, minY - scale), new Vector(x * scale, maxY + scale)));
        }
        // add lines from new maxX to old maxX
        for (let x = Math.floor(maxX / scale); x > Math.floor(this.maxX / scale); x--) {
            this.lines.push(new Line(new Vector(x * scale, minY - scale), new Vector(x * scale, maxY + scale)));
        }
        // add lines from new minY to old minY
        for (let y = Math.ceil(minY / scale); y < Math.ceil(this.minY / scale); y++) {
            this.lines.push(new Line(new Vector(minX - scale, y * scale), new Vector(maxX + scale, y * scale)));
        }
        // add lines from new maxY to old maxY
        for (let y = Math.floor(maxY / scale); y > Math.floor(this.maxY / scale); y--) {
            this.lines.push(new Line(new Vector(minX - scale, y * scale), new Vector(maxX + scale, y * scale)));
        }
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }
    ;
}
class GeomObject {
    constructor() {
        this.constraints = {
            fixedTo: []
        };
        this.id = undefined;
    }
    fixTo(obj) {
        this.constraints.fixedTo.push(obj);
    }
    ;
    fixedTo(obj) {
        return this.constraints.fixedTo.includes(obj);
    }
    setId(id) {
        this.id = id;
    }
}
class DimensionalObject extends GeomObject {
}
class LinearObject extends DimensionalObject {
    constructor(p1, p2) {
        super();
        this.endpoints = [];
        this.p1 = p1;
        this.p2 = p2;
        this.setEndpoint(p1);
        this.setEndpoint(p2);
    }
    setEndpoint(vector) {
        this.endpoints.push(vector);
        this.fixTo(vector);
        vector.fixTo(this);
    }
    ;
    hasEndpoint(vector) {
        return this.endpoints.includes(vector);
    }
    ;
    midpoint() {
        return this.p1.add(this.p2).divide(2);
    }
    ;
}
class Arc extends DimensionalObject {
    equals(object) {
        throw new Error("Method not implemented.");
    }
    rotated(center, angle) {
        throw new Error("Method not implemented.");
    }
    constructor(angle) {
        super();
        this.angle = angle;
        this.center = angle.vertex;
        this.fixTo(this.center);
        this.fixTo(this.angle.p1);
        this.fixTo(this.angle.p2);
        this.center.fixTo(this);
        this.angle.p1.fixTo(this);
        this.angle.p2.fixTo(this);
    }
    translated(vector) {
        return new Arc(this.angle.translated(vector));
    }
    getRadius() {
        return this.angle.p1.distanceTo(this.center);
    }
    distanceTo(vector) {
        if (this.angle.inside(vector)) {
            return Math.abs(vector.distanceTo(this.center) - this.getRadius());
        }
        else {
            return Math.min(vector.distanceTo(this.angle.p1), vector.distanceTo(this.angle.p2));
        }
    }
    getLocusIntersection(locus) {
        return locus.getSingleObjIntersection(this);
    }
    getIntersection(obj) {
        if (obj.constructor.name === LineSegment.name ||
            obj.constructor.name === Line.name) {
            return this.getLineIntersection(obj);
        }
        if (obj.constructor.name === Arc.name) {
            return this.getLineIntersection(obj);
        }
        if (obj.constructor.name === Locus.name) {
            return this.getLocusIntersection(obj);
        }
    }
    ;
    getArcIntersection(arc) {
        /*
          Let d be the distance between centers
          Let P1 and P2 be the centers
          Let P3 be the midpoint of the intersections
          Let segments d1 and d2 be P1P3 and P2P3, respectively
          Let h be the distance from P3 to either intersection
    
          d1^2 + h^2 = r1^2
          d2^2 + h^2 = r2^2
    
          d = d1 + d2
          d2 = d - d1
    
          (d - d1)^2 + h^2 = r2^2
          d^2 - 2d1d + d1^2 + h^2 = r2^2
          d^2 - 2d1d = r2^2 - r1^2
          -2d1d = r2^2 - r1^2 - d^2
          d1 = (d^2 + r1^2 - r2^2) / (2d)
    
          h^2 = r1^2 - d1^2
          h = sqrt(r1^2 - d1^2)
    
          P3 = P1 + d1(P2 - P1) / d
    
          x4 = x3 +- h(y2 - y1) / d
          y4 = y3 +- h(x2 - x1) / d
          */
        let c1 = this.center;
        let c2 = arc.center;
        let d = c2.distanceTo(c1);
        let d1 = (sqr(d) + sqr(this.getRadius()) - sqr(arc.getRadius())) / (2 * d);
        let intToIntsMP = Math.sqrt(sqr(this.getRadius()) - sqr(d1));
        let intsMP = c1.add(c2.subtract(c1).multiply(d1 / d));
        let int1 = intsMP.add(c2.subtract(c1).normal().normalize().multiply(intToIntsMP));
        let int2 = intsMP.subtract(c2.subtract(c1).normal().normalize().multiply(intToIntsMP));
        if (!int1.equals(int2)) {
            return new Locus([int1, int2]);
        }
        else {
            return int1;
        }
    }
    translate(vector) {
        log.broadcast(new Translation(this, vector, { preImage: this }));
    }
    dilated(center, factor) {
        return new Arc(this.angle.dilated(center, factor));
    }
    receive(transformation) {
        let existingExclusions = [];
        if (transformation.args && transformation.args.exclude) {
            existingExclusions = transformation.args.exclude;
        }
        let fixedTo = this.constraints.fixedTo;
        if (fixedTo.includes(transformation.object)) {
            if (transformation.object == this.center) {
                let translation = transformation;
                log.broadcast(new Translation(this, translation.vector, { preImage: this, exclude: existingExclusions.concat([translation.object]) }));
            }
            else {
                let dilation = transformation;
                let prevRadius = dilation.getPreImage().distanceTo(this.center);
                let newRadius = dilation.getImage().distanceTo(this.center);
                log.broadcast(new Dilation(this, this.center, newRadius / prevRadius, { exclude: existingExclusions.concat([dilation.object]), preImage: this }));
            }
        }
    }
    getLineIntersection(line) {
        let distToCenter = line.distanceTo(this.center);
        if (lessOrEqual(distToCenter, this.getRadius())) {
            let chordMidpoint = line.extended().pointClosestTo(this.center);
            let halfChordLength = Math.sqrt(this.getRadius() * this.getRadius() - distToCenter * distToCenter);
            let slopeVector = new Vector(1, line.getSlope()).normalize();
            let int1 = chordMidpoint.add(slopeVector.multiply(halfChordLength));
            let int2 = chordMidpoint.subtract(slopeVector.multiply(halfChordLength));
            let ints = [int1, int2].filter(int => this.containsPoint(int) && line.onLine(int));
            if (ints.length == 1) {
                return ints[0];
            }
            else {
                return new Locus(ints);
            }
        }
        else {
            return undefined;
        }
    }
    containsPoint(vector) {
        return this.angle.inside(vector) && equal(vector.distanceTo(this.center), this.getRadius()) ||
            vector.equals(this.angle.p1) || vector.equals(this.angle.p2);
    }
    pointClosestTo(vector) {
        if (this.angle.inside(vector)) {
            let direction = vector.subtract(this.center).normalize();
            console.log(direction);
            return this.center.add(direction.multiply(this.getRadius()));
        }
        else {
            console.log('outside');
            return vector.getClosest(this.angle.p1, this.angle.p2);
        }
    }
    clone() {
        return new Arc(this.angle.clone());
    }
    nameString() {
        if (this.id !== undefined) {
            return 'Arc ' + this.id;
        }
        else {
            return 'Arc';
        }
    }
    detailsString() {
        return `${this.center.detailsString()} r=${this.getRadius()}`;
    }
    toString() {
        return `${this.nameString()} ${this.detailsString()}`;
    }
    fixedTo(obj) {
        return this.constraints.fixedTo.includes(obj);
    }
    ;
    setId(id) {
        this.id = id;
    }
    ;
    draw(offset, dilation, color, thickness) {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        // ctx.translate(.5, .5);
        offset = offset || new Vector(0, 0);
        ctx.beginPath();
        ctx.arc(roundFromZero(this.center.x * dilation + offset.x), roundFromZero(-this.center.y * dilation + offset.y), this.getRadius(), 2 * Math.PI - this.angle.getStartAngle(), 2 * Math.PI - this.angle.getEndAngle(), true);
        ctx.stroke();
        // ctx.translate(-.5, -.5);
    }
}
class Angle extends GeomObject {
    constructor(p1, vertex, p2) {
        super();
        this.p1 = p1;
        this.vertex = vertex;
        this.p2 = p2;
    }
    getIntersection(object) {
        throw new Error("Method not implemented.");
    }
    translate(vector) {
        throw new Error("Method not implemented.");
    }
    rotated(center, angle) {
        throw new Error("Method not implemented.");
    }
    distanceTo(vector) {
        throw new Error("Method not implemented.");
    }
    receive(transformation) {
        throw new Error("Method not implemented.");
    }
    pointClosestTo(vector) {
        throw new Error("Method not implemented.");
    }
    nameString() {
        throw new Error("Method not implemented.");
    }
    detailsString() {
        throw new Error("Method not implemented.");
    }
    toString() {
        throw new Error("Method not implemented.");
    }
    draw(offset, dilation, color, thickness) {
        throw new Error("Method not implemented.");
    }
    getStartAngle() {
        return this.p1.angle(this.vertex);
    }
    getEndAngle() {
        return this.p2.angle(this.vertex);
    }
    toCCW(angle) {
        return (Math.PI * 2 + angle) % (Math.PI * 2);
    }
    inside(vector) {
        let vectorAngle = vector.rotated(this.vertex, -this.getStartAngle()).angle(this.vertex);
        return vectorAngle > 0 && vectorAngle < this.getMeasure();
    }
    getMeasure() {
        return this.toCCW(this.p2.angle(this.vertex) - this.p1.angle(this.vertex));
    }
    translated(vector) {
        return new Angle(this.p1.translated(vector), this.vertex.translated(vector), this.p2.translated(vector));
    }
    dilated(center, factor) {
        return new Angle(this.p1.dilated(center, factor), this.vertex.dilated(center, factor), this.p2.dilated(center, factor));
    }
    clone() {
        return new Angle(this.p1.clone(), this.vertex.clone(), this.p2.clone());
    }
    equals(angle) {
        return equal(this.p1, angle.p1) && equal(this.vertex, angle.vertex) && equal(this.p2, angle.p2);
    }
}
class Vector extends GeomObject {
    constructor(x, y) {
        super();
        this.endpointOf = [];
        this.x = x;
        this.y = y;
    }
    getIntersection(object) {
        throw new Error("Method not implemented.");
    }
    setAsEndpoint(line) {
        this.endpointOf.push(line);
    }
    ;
    isEndpointOf(line) {
        return this.endpointOf.includes(line);
    }
    ;
    draw(offset, color, dilation, radius) {
        offset = offset || new Vector(0, 0);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(roundFromZero(this.x * dilation + offset.x), roundFromZero(-this.y * dilation + offset.y), radius, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.fillText(`${this.id}`, roundFromZero(this.x * dilation + offset.x) - settings.pointRadius / 2, roundFromZero(-this.y * dilation + offset.y) - settings.pointRadius / 2 +
            14, 20);
    }
    ;
    angle(center) {
        let x;
        let y;
        if (center) {
            let relativeVector = this.subtract(center);
            x = relativeVector.x;
            y = relativeVector.y;
        }
        else {
            x = this.x;
            y = this.y;
        }
        let refAngle = Math.abs(Math.atan(y / x));
        let angle = refAngle;
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
    ;
    translate(vector, translation) {
        let image = this.add(vector);
        let fixedTo = this.constraints.fixedTo.filter(obj => !obj.fixedTo(this));
        // if a parent is trying to translate, let this act as if fixed to its image
        // instead to prevent a conflict
        if (translation) {
            fixedTo = fixedTo.filter(obj => obj !== translation.object);
            if (!translation.object.fixedTo(this)) {
                fixedTo.push(translation.getImage());
            }
        }
        if (fixedTo.length) {
            // try to translate to the closest intersection of all parents
            // if there is no intersection, then this point can't move anywhere
            let intersection = new Locus(fixedTo).getSelfIntersection(); //fixedTo[0].getIntersection(fixedTo.slice(1));
            if (intersection) {
                image = intersection.pointClosestTo(image);
            }
            //image = intersection ? image.getClosest(intersection) : this;
        }
        let displacement = image.subtract(this);
        this.setPosition(image);
        if (translation) {
            let exclude = [translation.object];
            if (translation.args && translation.args.exclude) {
                exclude = exclude.concat(translation.args.exclude);
            }
            log.broadcast(new Translation(this, displacement, { exclude: exclude }));
        }
        else {
            log.broadcast(new Translation(this, displacement));
        }
    }
    dilate(center, factor, dilation) {
        this.setPosition(this.dilated(center, factor));
        if (dilation) {
            let exclude = [dilation.object];
            if (dilation.args && dilation.args.exclude) {
                exclude = exclude.concat(dilation.args.exclude);
            }
            log.broadcast(new Dilation(this, center, factor, { exclude: exclude }));
        }
        else {
            log.broadcast(new Dilation(this, center, factor));
        }
    }
    dilated(center, factor) {
        return this.subtract(center).multiply(factor).add(center);
    }
    receive(transformation) {
        let fixedTo = this.constraints.fixedTo;
        if (fixedTo.includes(transformation.object) /*&& !this.received.some(t => t.similarTo(transformation))*/) {
            if (transformation.name === 'translation') {
                let translation = transformation;
                this.translate(translation.vector, translation);
            }
            if (transformation.name === 'rotation') {
                let rotation = transformation;
                if (!rotation.center.equals(this)) {
                    this.rotate(rotation.center, rotation.radians, rotation);
                }
            }
            if (transformation.name === 'dilation') {
                let dilation = transformation;
                if (!dilation.center.equals(this)) {
                    this.dilate(transformation.center, transformation.factor, dilation);
                }
            }
        }
    }
    getClosest(locus) {
        // map each object to its point closest to this, then reduce that array of
        // points to the closest one
        return locus.get().map(v => v.pointClosestTo(this)).reduce((closest, cur) => this.distanceTo(cur) < this.distanceTo(closest) ? cur : closest);
    }
    pointClosestTo(vector) {
        return this;
    }
    distanceTo(vector) {
        return vector.subtract(this).magnitude();
    }
    update() {
        if (selections.isSelected(this)) {
            ui.updateVectorProps(this);
        }
        ui.addObject("Line Segment ", this);
    }
    setPosition(vector, callers) {
        if (callers) {
            /*let initial = this.clone();
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
            });*/
        }
        else {
            this.x = vector.x;
            this.y = vector.y;
        }
    }
    rotate(center, radians, rotation) {
        this.setPosition(this.rotated(center, radians));
        if (rotation) {
            let exclude = [rotation.object];
            if (rotation.args && rotation.args.exclude) {
                exclude = exclude.concat(rotation.args.exclude);
            }
            log.broadcast(new Rotation(this, center, radians, { exclude: exclude }));
        }
        else {
            log.broadcast(new Rotation(this, center, radians));
        }
    }
    rotated(center, radians) {
        let relativeVector = this.subtract(center);
        let angleSum = relativeVector.angle() + radians;
        if (!isNaN(angleSum)) {
            return new Vector(Math.cos(angleSum), Math.sin(angleSum)).multiply(relativeVector.magnitude()).add(center);
        }
        return this;
    }
    translated(vector) {
        return this.add(vector);
    }
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    normal(CW) {
        if (CW) {
            return new Vector(this.y, -this.x);
        }
        return new Vector(-this.y, this.x);
    }
    divide(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }
    normalize() {
        return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
    }
    floorTowardZero() {
        return new Vector(floorTowardZero(this.x), floorTowardZero(this.y));
    }
    roundFromZero(dPlaces) {
        return new Vector(roundFromZero(this.x, dPlaces), roundFromZero(this.y, dPlaces));
    }
    negative() {
        return new Vector(-this.x, -this.y);
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    equals(vector) {
        return equal(this.x, vector.x) && equal(this.y, vector.y);
    }
    clone(id) {
        let clone = new Vector(this.x, this.y);
        clone.setId(id);
        return clone;
    }
    nameString() {
        if (this.id !== undefined) {
            return 'Vector ' + this.id;
        }
        else {
            return 'Vector';
        }
    }
    detailsString() {
        return `\(${roundFromZero(this.x, 2)}, ${roundFromZero(this.y, 2)}\)`;
    }
    toString() {
        return `${this.nameString()} ${this.detailsString()}`;
    }
}
class LineSegment extends LinearObject {
    constructor(p1, p2) {
        super(p1, p2);
    }
    yInt() {
        return this.extended().getY(0);
    }
    ;
    midpoint() {
        return this.p1.add(this.p2).divide(2);
    }
    ;
    receive(transformation) {
        let fixedTo = this.constraints.fixedTo;
        if (fixedTo.includes(transformation.object)) {
            let translation = transformation;
            // p1 isn't the translated vector; p2 is the translated vector before translation
            let preImagePoint = translation.getPreImage();
            let otherEndpoint = [this.p1, this.p2].filter(p => p !== translation.object)[0].clone();
            let preImageMidpoint = new LineSegment(otherEndpoint, preImagePoint).midpoint();
            // the rotation center will be the reflection of the preimage translated point in the midpoint
            let vectorToMidpoint = preImagePoint.subtract(preImageMidpoint);
            let center = preImageMidpoint.subtract(vectorToMidpoint);
            let oldAngle = preImagePoint.angle(otherEndpoint);
            let newAngle = translation.getImage().angle(otherEndpoint);
            let angle = newAngle - oldAngle;
            let existingExclusions = [];
            if (transformation.args && transformation.args.exclude) {
                existingExclusions = transformation.args.exclude;
            }
            let rotation = new Rotation(this, center, angle, { exclude: [translation.object].concat(existingExclusions), preImage: this });
            let distance = translation.getImage().distanceTo(otherEndpoint) - translation.getPreImage().distanceTo(otherEndpoint);
            let endpoint = translation.getPreImage().rotated(center, angle);
            let dilation = new Dilation(this, center, this.length() / (this.length() - distance), { exclude: [translation.object].concat(existingExclusions), preImage: this });
            log.broadcast(rotation);
            log.broadcast(dilation);
        }
    }
    ;
    translated(vector) {
        return new LineSegment(this.p1.translated(vector), this.p2.translated(vector));
    }
    ;
    extended(endpoint, distance) {
        if (arguments.length === 0) {
            return new Line(this.p1.clone(), this.p2.clone());
        }
        let otherEndpoint = [this.p1, this.p2].filter(p => p !== endpoint)[0];
        let slopeVector = endpoint.subtract(otherEndpoint).normalize();
        let translation = slopeVector.multiply(distance);
        let p1, p2;
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
    ;
    rotated(center, radians) {
        let endpoints = [this.p1, this.p2].map(p => p.rotated(center, radians));
        return new LineSegment(endpoints[0], endpoints[1]);
    }
    ;
    dilated(center, factor) {
        return new LineSegment(this.p1.dilated(center, factor), this.p2.dilated(center, factor));
    }
    ;
    onLine(vector) {
        return equal(this.getX(vector.y), vector.x) || equal(this.getY(vector.x), vector.y);
    }
    ;
    update() {
        /*this.children.forEach(c => {
          c.update();
        });
        if (selections.isSelected(this)) {
          ui.updateLineProps(this);
        }*/
    }
    ;
    translate(vector) {
        log.broadcast(new Translation(this, vector, { preImage: this }));
    }
    ;
    getX(y) {
        if (y >= this.p1.y && y <= this.p2.y || y <= this.p1.y && y >= this.p2.y) {
            return (y - this.p1.y) / this.getSlope() + this.p1.x;
        }
        return undefined;
    }
    ;
    getY(x) {
        if (x >= this.p1.x && x <= this.p2.x || x <= this.p1.x && x >= this.p2.x) {
            return this.getSlope() * (x - this.p1.x) + this.p1.y;
        }
        return undefined;
    }
    ;
    perpThrough(vector) {
        let perp = new Line({ slope: -1 / this.getSlope(), p: vector.clone() });
        if (this.getLineIntersection(perp)) {
            return perp;
        }
        return undefined;
    }
    ;
    distanceTo(vector) {
        let perp = this.perpThrough(vector);
        if (perp) {
            return vector.subtract(this.getLineIntersection(this.perpThrough(vector))).magnitude();
        }
        else {
            return Math.min(vector.subtract(this.p1).magnitude(), vector.subtract(this.p2).magnitude());
        }
    }
    ;
    pointClosestTo(vector) {
        let perp = this.perpThrough(vector);
        if (perp) {
            return this.getLineIntersection(perp);
        }
        else {
            return vector.subtract(this.p2).magnitude() < vector.subtract(this.p1).magnitude() ? this.p2 : this.p1;
        }
    }
    ;
    draw(offset, color, dilation, thickness) {
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
    ;
    getSlope() {
        return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    }
    ;
    containsPoint(vector) {
        return this.onLine(vector);
    }
    getLineIntersection(line) {
        /* m(x - x1) + y = n(x - x2) + b
        * mx - mx1 + y = nx - nx2 + b
        * mx - nx = b - nx2 + mx1 - y
        * x = (b - y + mx1 - nx2) / (m - n)
        */
        if (this.getSlope() !== line.getSlope()) {
            let x;
            if (Math.abs(this.getSlope()) === Infinity) {
                x = this.p1.x;
                let y = line.getY(x);
                if (y != undefined && (y >= this.p1.y && y <= this.p2.y || y <= this.p1.y && y >= this.p2.y)) {
                    return new Vector(x, y);
                }
            }
            else if (Math.abs(line.getSlope()) === Infinity) {
                x = line.p1.x;
                let y = this.getY(x);
                if (y !== undefined && (y >= this.p1.y && y <= this.p2.y || y <= this.p1.y && y >= this.p2.y)) {
                    return new Vector(x, y);
                }
            }
            else {
                x = (line.p1.y - this.p1.y + this.getSlope() * this.p1.x - line.getSlope() * line.p1.x) / (this.getSlope() - line.getSlope());
                if (this.getY(x) !== undefined && line.getY(x) !== undefined) {
                    return new Vector(x, this.getY(x));
                }
            }
        }
        // if the line(segment)s are (on) the same line, their intersection is a line(segment)
        else if (this.equals(line)) {
            return this.clone();
        }
    }
    getIntersection(obj) {
        if (obj.constructor.name === LineSegment.name ||
            obj.constructor.name === Line.name) {
            return this.getLineIntersection(obj);
        }
        if (obj.constructor.name === Arc.name) {
            return this.getLineIntersection(obj);
        }
        if (obj.constructor.name === Locus.name) {
            return this.getLocusIntersection(obj);
        }
    }
    ;
    getArcIntersection(arc) {
        return arc.getLineIntersection(this);
    }
    getLocusIntersection(locus) {
        return locus.getSingleObjIntersection(this);
    }
    equals(line) {
        return this.p1.equals(line.p1) && this.p2.equals(line.p2);
    }
    ;
    clone() {
        return new LineSegment(this.p1.clone(), this.p2.clone());
    }
    ;
    length() {
        return this.p2.subtract(this.p1).magnitude();
    }
    ;
    nameString() {
        if (this.id !== undefined) {
            return 'Line Segment ' + this.id;
        }
        else {
            return 'Line Segment';
        }
    }
    ;
    detailsString() {
        return `\(\(${roundFromZero(this.p1.x, 2)}, ${roundFromZero(this.p1.y, 2)}\), \(${roundFromZero(this.p2.x, 2)}, ${roundFromZero(this.p2.y, 2)}\)\)`;
    }
    ;
    toString() {
        return `${this.nameString()} ${this.detailsString()}`;
    }
    ;
}
class Line extends LinearObject {
    yInt() {
        throw new Error("Method not implemented.");
    }
    getLocusIntersection(locus) {
        throw new Error("Method not implemented.");
    }
    dilated(center, factor) {
        throw new Error("Method not implemented.");
    }
    rotated(center, angle) {
        throw new Error("Method not implemented.");
    }
    constructor(p1, p2) {
        if (!p2) {
            let args = p1;
            if (args.slope !== undefined && args.p !== undefined) {
                p1 = args.p;
                p2 = args.p.add(new Vector(1, args.slope));
            }
        }
        super(p1, p2);
    }
    receive() {
    }
    translate(vector) {
        log.broadcast(new Translation(this, vector, { preImage: this }));
    }
    translated(vector) {
        return new Line(this.p1.translated(vector), this.p2.translated(vector));
    }
    midpoint() {
        return this.p1.add(this.p2).divide(2);
    }
    getX(y) {
        if (Math.abs(this.getSlope()) === Infinity) {
            return this.p1.x;
        }
        if (this.getSlope() === 0) {
            return undefined;
        }
        return (y - this.p1.y) / this.getSlope() + this.p1.x;
    }
    containsPoint(vector) {
        return this.onLine(vector);
    }
    getY(x) {
        if (Math.abs(this.getSlope()) === Infinity) {
            return undefined;
        }
        if (this.getSlope() === 0) {
            return this.p1.y;
        }
        return this.getSlope() * (x - this.p1.x) + this.p1.y;
    }
    onLine(vector) {
        return equal(this.getX(vector.y), vector.x) || equal(this.getY(vector.x), vector.y);
    }
    perpThrough(vector) {
        return new Line({ slope: -1 / this.getSlope(), p: vector.clone() });
    }
    distanceTo(vector) {
        return vector.subtract(this.getLineIntersection(this.perpThrough(vector))).magnitude();
        //return vector.subtract(this.getIntersection(this.perpThrough(vector)).point()).magnitude();
    }
    pointClosestTo(vector) {
        return this.getLineIntersection(this.perpThrough(vector));
        // return this.getIntersection(this.perpThrough(vector)).point();
    }
    draw(offset, color, dilation, thickness) {
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
    getSlope() {
        return (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    }
    getLineIntersection(line) {
        let x;
        if (this.getSlope() != line.getSlope()) {
            // handle vertical lines
            if (Math.abs(this.getSlope()) == Infinity) {
                x = this.p1.x;
                let y = line.getY(x);
                if (y != undefined) {
                    return new Vector(x, y);
                }
            }
            else if (Math.abs(line.getSlope()) == Infinity) {
                x = line.p1.x;
                let y = this.getY(x);
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
        else if (this.equals(line)) {
            return line.clone();
        }
    }
    getIntersection(obj) {
        /* m(x - x1) + y = n(x - x2) + b
        * mx - mx1 + y = nx - nx2 + b
        * mx - nx = b - nx2 + mx1 - y
        * x = (b - y + mx1 - nx2) / (m - n)
        */
        /*let objs = [];
        if (Array.isArray(obj)) {
          objs = obj.concat([this]);
          obj = objs[0];
        }
        let intersection;
    
        if (obj.constructor.name === LineSegment.name ||
          obj.constructor.name === Line.name) {
            intersection = this.getLineIntersection(obj);
            // the intersection is a line if the objects are collinear lines
            if (!intersection) {
              return undefined;
            }
            if (intersection.constructor.name === LineSegment.name ||
              intersection.constructor.name === Line.name) {
                if (objs.length > 1) {
                  objs.shift();
                  return this.getIntersection(objs);
                }
                else {
                  return obj.clone();
                }
            }
        }
        if (obj.constructor.name === Arc.name) {
          intersection = obj.getLineIntersection(this);
          if (!intersection) {
            return undefined;
          }
        }
        if (obj.constructor.name === Locus.name) {
          intersection = obj.getSingleObjIntersection(this).get();
        }
        if (Array.isArray(intersection)) {
          intersection = intersection.filter(int => objs.every(o => o.containsPoint(int)));
          if (!intersection.length) {
            return undefined;
          }
          else {
            intersection = intersection[0];
          }
        }
        if (intersection && objs.some(o => !o.containsPoint(intersection))) {
          return undefined;
        }*/
        if (obj.constructor.name === LineSegment.name ||
            obj.constructor.name === Line.name) {
            return this.getLineIntersection(obj);
        }
        if (obj.constructor.name === Arc.name) {
            return this.getLineIntersection(obj);
        }
        if (obj.constructor.name === Locus.name) {
            return this.getLocusIntersection(obj);
        }
        //return intersection;
    }
    getArcIntersection(arc) {
        return arc.getLineIntersection(this);
    }
    equals(line) {
        return this.p1.equals(line.p1) && this.p2.equals(line.p2) || this.p1.equals(line.p2) && this.p2.equals(line.p1);
    }
    clone() {
        return new Line(this.p1.clone(), this.p2.clone());
    }
    extended() {
        return this.clone();
    }
    length() {
        return Infinity;
    }
    nameString() {
        if (this.id !== undefined) {
            return 'Line ' + this.id;
        }
        else {
            return 'Line ';
        }
    }
    detailsString() {
        return `\(\(${roundFromZero(this.p1.x, 2)}, ${roundFromZero(this.p1.y, 2)}\), \(${roundFromZero(this.p2.x, 2)}, ${roundFromZero(this.p2.y, 2)}\)\)`;
    }
    toString() {
        return `${this.nameString()} ${this.detailsString()}`;
    }
}
class Creation {
    constructor() {
        this.currentArg = 0;
        this.finished = false;
    }
    addArg(arg) {
        this.args[this.currentArg].push(arg);
    }
    nextArg() {
        if (this.currentArg === this.args.length - 1) {
            this.currentArg = 0;
        }
        else {
            this.currentArg++;
        }
    }
    argsFilled() {
        return this.args.every(arg => arg.length);
    }
    execute() {
        this.finished = true;
    }
}
class SegmentCreation extends Creation {
    constructor() {
        super();
        this.args = [[], []];
    }
    execute() {
        this.args[0].forEach(p1 => {
            plane.removeTempVector(p1);
            plane.addVector(p1);
            this.args[1].forEach(p2 => {
                plane.removeTempVector(p2);
                plane.addVector(p2);
                plane.addLine(new LineSegment(p1, p2));
            });
        });
        super.execute();
    }
    ;
}
class LineCreation extends Creation {
    constructor() {
        super();
        this.args = [[], []];
    }
    execute() {
        this.args[0].forEach(p1 => {
            plane.removeTempVector(p1);
            plane.addVector(p1);
            this.args[1].forEach(p2 => {
                plane.removeTempVector(p2);
                plane.addVector(p2);
                plane.addLine(new Line(p1, p2));
            });
        });
        super.execute();
    }
    ;
}
class ArcCreation extends Creation {
    constructor() {
        super();
        this.args = [[], [], []];
    }
    execute() {
        this.args[0].forEach(center => {
            plane.removeTempVector(center);
            plane.addVector(center);
            this.args[1].forEach(p1 => {
                plane.removeTempVector(p1);
                plane.addVector(p1);
                this.args[2].forEach(p2 => {
                    plane.removeTempVector(p2);
                    // constrain second point to radius
                    p2 = p2.subtract(center).normalize().multiply(p1.distanceTo(center)).add(center);
                    plane.addVector(p2);
                    plane.addArc(new Arc(new Angle(p1, center, p2)));
                });
            });
        });
        super.execute();
    }
}
class Camera {
    constructor(minX, minY, maxX, maxY, plane) {
        this.min = new Vector(minX, minY);
        this.max = new Vector(maxX, maxY);
        this.plane = plane;
        this.width = this.max.subtract(this.min).x;
        this.height = this.max.subtract(this.min).y;
        this.dilation = 100;
        this.perPixel = 100;
        this.gridGap = 50;
    }
    drawLines(lines, gridColors) {
        let color = settings.lineColor;
        let offset = this.min.negative();
        // set the boundaries of the grid
        let boundaryX1 = new LineSegment(new Vector(this.plane.grid.minX, this.plane.grid.minY), new Vector(this.plane.grid.maxX, this.plane.grid.minY));
        let boundaryX2 = new LineSegment(new Vector(this.plane.grid.minX, this.plane.grid.maxY), new Vector(this.plane.grid.maxX, this.plane.grid.maxY));
        let boundaryY1 = new LineSegment(new Vector(this.plane.grid.minX, this.plane.grid.minY), new Vector(this.plane.grid.minX, this.plane.grid.maxY));
        let boundaryY2 = new LineSegment(new Vector(this.plane.grid.maxX, this.plane.grid.minY), new Vector(this.plane.grid.maxX, this.plane.grid.maxY));
        lines.forEach(l => {
            if (gridColors) {
                let dPlaces = settings.displayPlaces;
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
            let points = [];
            // iterate over each endpoint of the line
            [l.p1, l.p2].forEach(p => {
                // if the line extends beyond the camera, use an intersection with the camera instead
                if (!(p.x >= this.plane.grid.minX && p.x <= this.plane.grid.maxX && p.y >= this.plane.grid.minY && p.y <= this.plane.grid.maxY) || l.length() === Infinity) {
                    // find intersections of the line and the grid (4 max)
                    p = [l.getLineIntersection(boundaryX1), l.getLineIntersection(boundaryX2),
                        l.getLineIntersection(boundaryY1), l.getLineIntersection(boundaryY2)]
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
                let thickness = settings.lineThickness;
                if (gridColors) {
                    thickness = settings.gridThickness;
                }
                else if (selections.isSelected(l)) {
                    thickness = settings.selectedThickness;
                }
                // draw the LineSegment of the line that's in the grid
                new LineSegment(points[0], points[1]).draw(offset, color, 100 / this.perPixel, thickness);
                // if grid line
                if (gridColors) {
                    let dPlaces = settings.displayPlaces;
                    ctx.fillStyle = '#eee';
                    // if horizontal, write y-coordinate along the y-axis
                    if (l.getSlope() == 0) {
                        ctx.fillText(`${roundFromZero(l.p1.y, dPlaces)}`, roundFromZero(offset.x), roundFromZero(offset.y - l.p1.y * 100 / this.perPixel), 30);
                    }
                    // if vertical, write x-coordinate along the x-axis
                    else {
                        ctx.fillText(`${roundFromZero(l.p1.x, dPlaces)}`, roundFromZero(l.p1.x * 100 / this.perPixel + offset.x), roundFromZero(offset.y), 30);
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
    }
    ;
    drawArcs(arcs) {
        arcs.forEach(a => this.drawArc(a));
    }
    drawArc(arc) {
        let thickness = (selections.isSelected(arc) ? settings.selectedThickness : settings.lineThickness);
        arc.draw(this.min.negative(), 100 / this.perPixel, settings.lineColor, thickness);
    }
    resize(deltaMinX, deltaMinY, deltaMaxX, deltaMaxY) {
        this.min = this.min.add(new Vector(deltaMinX, deltaMinY));
        this.max = this.max.add(new Vector(deltaMaxX, deltaMaxY));
    }
    ;
    dilate(factor) {
        this.min = this.min.multiply(factor);
        this.max = this.max.multiply(factor);
    }
    ;
    scaleContent(change, translation) {
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
    }
    ;
    translate(translation) {
        this.min = this.min.add(translation);
        this.max = this.max.add(translation);
    }
    ;
    update() {
        this.plane.grid.update(this.gridGap, this.perPixel, this.min.x, -this.max.y, this.max.x, -this.min.y);
        ctx.fillStyle = settings.gridBackground;
        ctx.fillRect(0, 0, this.max.subtract(this.min).x, this.max.subtract(this.min).y);
        this.drawArcs(this.plane.arcs);
        this.drawLines(this.plane.grid.lines, settings.gridLineColors);
        this.drawLines(this.plane.lines);
        this.drawVectors(this.plane.getVectors());
    }
    ;
    drawVectors(vectors) {
        vectors.forEach(v => {
            this.drawVector(v);
        });
    }
    ;
    drawVector(v) {
        if (v.x >= this.plane.grid.minX && v.x <= this.plane.grid.maxX && v.y >= this.plane.grid.minY && v.y <= this.plane.grid.maxY) {
            let radius = settings.pointRadius;
            if (selections.isSelected(v)) {
                radius = settings.selectedRadius;
            }
            v.draw(this.min.negative(), settings.vectorColor, 100 / this.perPixel, radius);
        }
    }
    ;
}
class Plane {
    constructor(grid) {
        this.vectors = [];
        this.lines = [];
        this.arcs = [];
        this.tempVectors = [];
        this.intersections = [];
        this.grid = grid;
    }
    getObjects() {
        return this.vectors.concat(this.lines).concat(this.arcs);
    }
    getObject(id) {
        return this.getObjects().filter(o => o.id === id)[0] || null;
    }
    getParents() {
        return this.getObjects().filter(obj => !this.vectors.includes(obj));
    }
    removeTempVector(vector) {
        this.tempVectors.splice(this.tempVectors.indexOf(vector), 1);
    }
    numObjects() {
        return this.getObjects().length;
    }
    getVectors() {
        return this.vectors.concat(this.tempVectors);
    }
    getVector(id) {
        return this.vectors.filter(v => v.id === id)[0] || null;
    }
    addVector(vector) {
        if (vector.id === undefined) {
            vector.setId(plane.numObjects());
            this.vectors.push(vector);
        }
    }
    removeVector(vector) {
        this.vectors.splice(this.vectors.indexOf(vector), 1);
    }
    addTempVector(vector) {
        this.tempVectors.push(vector);
    }
    getParent(id) {
        return this.getParents().filter(p => p.id === id)[0] || null;
    }
    getLine(id) {
        return this.lines.filter(l => l.id === id)[0] || null;
    }
    getArc(id) {
        return this.arcs.filter(a => a.id === id)[0] || null;
    }
    addLine(line) {
        line.setId(plane.numObjects());
        this.lines.push(line);
    }
    addArc(arc) {
        arc.setId(plane.numObjects());
        this.arcs.push(arc);
    }
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
new ResizeSensor(ui.canvasWrapper, function () {
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
class Transformation {
    constructor(object, args) {
        this.id = 0;
        this.object = object;
        if (args) {
            this.exclude = args.exclude;
            this.preImage = args.preImage;
            this.image = args.image;
        }
    }
}
class Translation extends Transformation {
    constructor(object, vector, args) {
        super(object, args);
        this.name = "translation";
        this.vector = vector;
        if (this.preImage) {
            this.image = this.preImage.translated(vector);
        }
        else if (this.image) {
            this.preImage = this.image.translated(vector.negative());
        }
        else {
            this.preImage = this.object.translated(vector.negative());
            this.image = this.object.clone();
        }
    }
    getPreImage() {
        return this.preImage || (this.image ? this.image.translated(this.vector.negative()) : null) || this.object.translated(this.vector.negative());
    }
    getImage() {
        return this.image || (this.preImage ? this.preImage.translated(this.vector) : null) || this.object.clone();
    }
    toString() {
        if (settings.detailedConsole) {
            return `${this.object.nameString()} ${this.getPreImage().detailsString()} has been translated ${this.vector.detailsString()} to ${this.getImage().detailsString()}.`;
        }
        else {
            return `${this.object.nameString()} has been translated.`;
        }
    }
    equals(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.vector.equals(transformation.vector);
    }
    similarTo(transformation) {
        return this.id === transformation.id && this.name === transformation.name;
    }
}
class Rotation extends Transformation {
    constructor(object, center, radians, args) {
        super(object, args);
        this.name = "rotation";
        this.center = center;
        this.radians = radians;
        if (this.preImage) {
            this.image = this.preImage.rotated(this.center, this.radians);
        }
        else if (this.image) {
            this.preImage = this.image.rotated(this.center, -this.radians);
        }
        else {
            this.preImage = this.object.rotated(this.center, -this.radians);
            this.image = this.object.clone();
        }
    }
    getPreImage() {
        return this.preImage || (this.image ? this.image.rotated(this.center, -this.radians) : null) || this.object.rotated(this.center, -this.radians);
    }
    getImage() {
        return this.image || (this.preImage ? this.preImage.rotated(this.center, this.radians) : null) || this.object.clone();
    }
    toString() {
        if (settings.detailedConsole) {
            return `${this.object.nameString()} ${this.getPreImage().detailsString()} has been rotated ${this.radians} radians about ${this.center.detailsString()} to ${this.getImage().detailsString()}.`;
        }
        else {
            return `${this.object.nameString()} has been rotated.`;
        }
    }
    // this.receivers = [];
    // this.addReceiver(object) {
    //   this.receivers.push(object);
    // }
    equals(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center) && this.radians === transformation.radians;
    }
    similarTo(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center);
    }
}
class Dilation extends Transformation {
    constructor(object, center, factor, args) {
        super(object, args);
        this.name = "dilation";
        this.center = center;
        this.factor = factor;
        if (this.preImage) {
            this.image = this.preImage.dilated(this.center, this.factor);
        }
        else if (this.image) {
            this.preImage = this.image.dilated(this.center, 1 / this.factor);
        }
        else {
            this.preImage = this.object.dilated(this.center, 1 / this.factor);
            this.image = this.object.clone();
        }
    }
    getPreImage() {
        return this.preImage || (this.image ? this.image.dilated(this.center, 1 / this.factor) : null) || this.object.dilated(this.center, 1 / this.factor);
    }
    getImage() {
        return this.image || (this.preImage ? this.preImage.dilated(this.center, this.factor) : null) || this.object.clone();
    }
    toString() {
        if (settings.detailedConsole) {
            return `${this.object.nameString()} ${this.getPreImage().detailsString()} has been dilated ${this.factor}x about ${this.center.detailsString()} to ${this.getImage().detailsString()}.`;
        }
        else {
            return `${this.object.nameString()} has been dilated.`;
        }
    }
    equals(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center) && this.factor === transformation.factor;
    }
    similarTo(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center);
    }
}
class Locus extends GeomObject {
    equals(object) {
        throw new Error("Method not implemented.");
    }
    translate(vector) {
        throw new Error("Method not implemented.");
    }
    translated(vector) {
        throw new Error("Method not implemented.");
    }
    dilated(center, factor) {
        throw new Error("Method not implemented.");
    }
    rotated(center, angle) {
        throw new Error("Method not implemented.");
    }
    distanceTo(vector) {
        throw new Error("Method not implemented.");
    }
    receive(transformation) {
        throw new Error("Method not implemented.");
    }
    clone() {
        throw new Error("Method not implemented.");
    }
    nameString() {
        throw new Error("Method not implemented.");
    }
    detailsString() {
        throw new Error("Method not implemented.");
    }
    toString() {
        throw new Error("Method not implemented.");
    }
    draw(offset, dilation, color, thickness) {
        throw new Error("Method not implemented.");
    }
    constructor(set) {
        super();
        this.set = set || [];
        this.removeDupes();
    }
    removeDupes() {
        this.set = this.set.filter((obj, i) => !this.set.slice(i + 1).some(o => o.constructor.name === obj.constructor.name && o.equals(obj)));
    }
    get() {
        return this.set;
    }
    isEmpty() {
        return this.set.length === 0;
    }
    flatten() {
        return flattenArray(this.set.map(obj => obj.constructor.name === Locus.name ? obj.get() : obj));
    }
    union(locus) {
        return new Locus(this.set.concat(locus.get()));
    }
    getIntersection(obj) {
        if (obj.constructor.name === Locus.name) {
            return this.getLocusIntersection(obj);
        }
        else {
            return this.getSingleObjIntersection(obj);
        }
    }
    getSingleObjIntersection(obj) {
        let ints = [];
        this.set.forEach(setObj => {
            let intersection;
            if (setObj.constructor.name === Vector.name) {
                if (obj.containsPoint(setObj)) {
                    intersection = setObj.clone();
                }
            }
            if (setObj.constructor.name === LineSegment.name ||
                setObj.constructor.name === Line.name) {
                intersection = obj.getLineIntersection(setObj);
            }
            if (setObj.constructor.name === Arc.name) {
                intersection = obj.getArcIntersection(setObj);
            }
            if (setObj.constructor.name === Locus.name) {
                intersection = setObj.getSingleObjIntersection(obj);
            }
            if (intersection) {
                ints.push(intersection);
            }
        });
        return new Locus(ints);
    }
    pointClosestTo(vector) {
        return this.set.map(obj => obj.pointClosestTo(vector)).reduce((cur, closest) => cur.distanceTo(vector) < closest.distanceTo(vector) ? cur : closest);
    }
    getLocusIntersection(locus) {
        let intSet = [];
        this.set.forEach(obj => {
            intSet.push(locus.getIntersection(obj));
        });
        return new Locus(intSet).flatten();
    }
    getSelfIntersection() {
        if (this.set.length === 1) {
            return this.set[0];
        }
        let singleObjInts = new Locus(this.set.slice(1)).getSingleObjIntersection(this.set[0]).get();
        let intsSharedByAll = singleObjInts.filter(int => this.set.every(obj => obj.getIntersection(int)));
        if (intsSharedByAll.length) {
            return new Locus(intsSharedByAll);
        }
        return null;
    }
}
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
keyboard.onDown("tab", function (keys) {
    selections.groupNum++;
});
function Keyboard() {
    this.keys = {};
    this.downFunctions = {};
    document.addEventListener('keydown', e => {
        this.keys[e.key.toLowerCase()] = true;
        for (let key in this.downFunctions) {
            if (this.downFunctions.hasOwnProperty(key) && key.split(' ').includes(e.key.toLowerCase())) {
                if (key.split(' ').every(key => this.keys[key])) {
                    this.downFunctions[key].forEach(f => f());
                }
            }
        }
    });
    document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
    this.onDown = function (key, f) {
        if (!this.downFunctions.hasOwnProperty(key)) {
            this.downFunctions[key] = [];
        }
        this.downFunctions[key].push(f);
    };
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
        let newX = e.clientX - ui.canvasOffsetX();
        let newY = e.clientY;
        this.mouse.deltaX = newX - this.mouse.x;
        this.mouse.deltaY = newY - this.mouse.y;
        this.mouse.x = newX;
        this.mouse.y = newY;
        this.moveFunctions.forEach(priority => {
            priority.forEach(funcData => funcData.f(...[this.mouse].concat(funcData.args)));
        });
        //cam.update(this.mouse);
    });
    ui.canvas.addEventListener('mousedown', e => {
        this.mouse.down = true;
        this.mouse.downX = e.clientX - ui.canvasOffsetX();
        this.mouse.downY = e.clientY;
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.downFunctions.forEach(priority => {
            priority.forEach(funcData => funcData.f(...[this.mouse].concat(funcData.args)));
        });
    });
    document.addEventListener('mouseup', e => this.mouse.down = false);
    ui.canvas.addEventListener('mousewheel', (e) => {
        this.mouse.deltaWheel = e.deltaY / 300;
        this.mouse.wheelX = e.clientX - ui.canvasOffsetX();
        this.mouse.wheelY = e.clientY;
        this.wheelFunctions.forEach(priority => {
            priority.forEach(funcData => funcData.f(...[this.mouse].concat(funcData.args)));
        });
        this.mouse.deltaWheel = 0;
    });
    this.onMove = function (f, priority, args) {
        if (!this.moveFunctions[priority]) {
            this.moveFunctions[priority] = [];
        }
        this.moveFunctions[priority].push({ f: f, args: args });
    };
    this.onDown = function (f, priority, args) {
        if (!this.downFunctions[priority]) {
            this.downFunctions[priority] = [];
        }
        this.downFunctions[priority].push({ f: f, args: args });
    };
    this.onWheel = function (f, priority, args) {
        if (!this.wheelFunctions[priority]) {
            this.wheelFunctions[priority] = [];
        }
        this.wheelFunctions[priority].push({ f: f, args: args });
    };
}
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
    return arr.reduce((flat, item) => Array.isArray(item) ? flat.concat(item) : flat.concat([item]), []);
}
