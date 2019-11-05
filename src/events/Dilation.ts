class Dilation extends Transformation {
  center: Vector;
  factor: number;
  constructor(center: Vector, factor: number) {
    super();
    this.center = center;
    this.factor = factor;
  }
  apply(obj: GeomObject): GeomObject {
    return obj.dilated(this.center, this.factor);
  }
}
