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
        return utils.equal(this.p1, angle.p1) && utils.equal(this.vertex, angle.vertex) && utils.equal(this.p2, angle.p2);
    }
}
