class Locus extends GeomObject {
  equals(object: GeomObject): boolean {
    throw new Error("Method not implemented.");
  }
  translate(vector: Vector): void {
    throw new Error("Method not implemented.");
  }
  translated(vector: Vector): GeomObject {
    throw new Error("Method not implemented.");
  }
  dilated(center: Vector, factor: number): GeomObject {
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
  clone(): GeomObject {
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
  draw(ctx: CanvasRenderingContext2D, offset: Vector, dilation: number, color: string, thickness: number): void {
    throw new Error("Method not implemented.");
  }
  set: GeomObject[];
  constructor(set: GeomObject[]) {
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
    return utils.flattenArray(this.set.map(obj => obj.constructor.name === Locus.name ? (obj as Locus).get() : obj));
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
    let ints: GeomObject[] = [];
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
        intersection = (setObj as Locus).getSingleObjIntersection(obj);
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
