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
