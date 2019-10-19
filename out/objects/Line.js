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
