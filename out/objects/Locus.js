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
    draw(ctx, offsett, dilation, color, thickness) {
        throw new Error("Method not implemented.");
    }
    constructor(sett) {
        super();
        this.set = sett || [];
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
        return utils.flattenArray(this.set.map(obj => obj.constructor.name === Locus.name ? obj.get() : obj));
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
        this.set.forEach(settObj => {
            let intersection;
            if (settObj.constructor.name === Vector.name) {
                if (obj.containsPoint(settObj)) {
                    intersection = settObj.clone();
                }
            }
            if (settObj.constructor.name === LineSegment.name ||
                settObj.constructor.name === Line.name) {
                intersection = obj.getLineIntersection(settObj);
            }
            if (settObj.constructor.name === Arc.name) {
                intersection = obj.getArcIntersection(settObj);
            }
            if (settObj.constructor.name === Locus.name) {
                intersection = settObj.getSingleObjIntersection(obj);
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
        let intsett = [];
        this.set.forEach(obj => {
            intsett.push(locus.getIntersection(obj));
        });
        return new Locus(intsett).flatten();
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
