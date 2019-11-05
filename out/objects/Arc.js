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
        let d1 = (utils.sqr(d) + utils.sqr(this.getRadius()) - utils.sqr(arc.getRadius())) / (2 * d);
        let intToIntsMP = Math.sqrt(utils.sqr(this.getRadius()) - utils.sqr(d1));
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
        //log.broadcast(new Translation(this, vector, { preImage: this }));
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
                //log.broadcast(new Translation(this, translation.vector, { preImage: this, exclude: existingExclusions.concat([translation.object]) }));
            }
            else {
                let dilation = transformation;
                let prevRadius = dilation.getPreImage().distanceTo(this.center);
                let newRadius = dilation.getImage().distanceTo(this.center);
                //log.broadcast(new Dilation(this, this.center, newRadius / prevRadius, { exclude: existingExclusions.concat([dilation.object]), preImage: this }));
            }
        }
    }
    getLineIntersection(line) {
        let distToCenter = line.distanceTo(this.center);
        if (utils.lessOrEqual(distToCenter, this.getRadius())) {
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
        return this.angle.inside(vector) && utils.equal(vector.distanceTo(this.center), this.getRadius()) ||
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
        grapher.ctx.strokeStyle = color;
        grapher.ctx.lineWidth = thickness;
        // grapher.ctx.translate(.5, .5);
        offset = offset || new Vector(0, 0);
        grapher.ctx.beginPath();
        grapher.ctx.arc(utils.roundFromZero(this.center.x * dilation + offset.x), utils.roundFromZero(-this.center.y * dilation + offset.y), this.getRadius(), 2 * Math.PI - this.angle.getStartAngle(), 2 * Math.PI - this.angle.getEndAngle(), true);
        grapher.ctx.stroke();
        // grapher.ctx.translate(-.5, -.5);
    }
}
