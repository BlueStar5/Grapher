class Angle extends GeomObject {
  getIntersection(object: GeomObject): GeomObject {
    throw new Error("Method not implemented.");
  }
  translate(vector: Vector): void {
    throw new Error("Method not implemented.");
  }
  rotated(center: Vector, angle: number): GeomObject {
    throw new Error("Method not implemented.");
  }
  distanceTo(vector: Vector): number {
    throw new Error("Method not implemented.");
  }
  receive(transformation: any): void {
    throw new Error("Method not implemented.");
  }
  pointClosestTo(vector: Vector): Vector {
    throw new Error("Method not implemented.");
  }
  nameString(): string {
    throw new Error("Method not implemented.");
  }
  detailsString(): string {
    throw new Error("Method not implemented.");
  }
  toString(): string {
    throw new Error("Method not implemented.");
  }
  draw(offset: Vector, dilation: number, color: string, thickness: number): void {
    throw new Error("Method not implemented.");
  }
  constructor(public p1: Vector, public vertex: Vector, public p2: Vector) {
    super();
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
  translated(vector: Vector): Angle {
    return new Angle(this.p1.translated(vector), this.vertex.translated(vector), this.p2.translated(vector));
  }
  dilated(center, factor) {
    return new Angle(this.p1.dilated(center, factor), this.vertex.dilated(center, factor), this.p2.dilated(center, factor));
  }
  clone() {
    return new Angle(this.p1.clone(), this.vertex.clone(), this.p2.clone());
  }
  equals(angle: Angle): boolean {
    return utils.equal(this.p1, angle.p1) && utils.equal(this.vertex, angle.vertex) && utils.equal(this.p2, angle.p2);
  }
}
