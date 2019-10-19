abstract class LinearObject extends DimensionalObject {
  p1: Vector;
  p2: Vector;
  endpoints: Vector[] = [];
  constructor(p1, p2) {
    super();
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
  hasEndpoint(vector): boolean {
    return this.endpoints.includes(vector);
  }
  ;
  abstract yInt(): number;
  midpoint(): Vector {
    return this.p1.add(this.p2).divide(2);
  }
  ;
  abstract extended(endpoint: Vector, distance: number): LinearObject;
  abstract onLine(point: Vector): boolean;
  abstract getX(y: number): number;
  abstract getY(x: number): number;
  abstract perpThrough(vector: Vector): LinearObject;
  abstract getSlope(): number;
}
