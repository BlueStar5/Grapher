abstract class GeomObject {
  abstract getIntersection(object: GeomObject): GeomObject;
  id: number;
  constructor() {
    this.id = undefined;
  }
  readonly constraints = {
    fixedTo: <GeomObject[]> []
  };
  fixTo(obj: GeomObject) {
    this.constraints.fixedTo.push(obj);
  };
  fixedTo(obj: GeomObject): boolean {
    return this.constraints.fixedTo.includes(obj);
  }
  setId(id: number) {
    this.id = id;
  }
  abstract translate(vector: Vector): void;
  abstract translated(vector: Vector): GeomObject;
  abstract dilated(center: Vector, factor: number): GeomObject;
  abstract rotated(center: Vector, angle: number): GeomObject;
  abstract distanceTo(vector: Vector): number;
  abstract receive(transformation): void;
  abstract pointClosestTo(vector: Vector): Vector;
  abstract clone(): GeomObject;
  abstract nameString(): string;
  abstract detailsString(): string;
  abstract toString(): string;
  abstract draw(ctx: CanvasRenderingContext2D, offset: Vector, dilation: number, color: string,
    thickness: number): void;
  abstract equals(object: GeomObject): boolean;
}