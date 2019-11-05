class Rotation extends Transformation {
  center: Vector;
  radians: number;
  constructor(center: Vector, radians: number) {
    super();
    this.center = center;
    this.radians = radians;
  }
  // this.receivers = [];
  // this.addReceiver(object) {
  //   this.receivers.push(object);
  // }
  apply(obj: GeomObject): GeomObject {
    return obj.rotated(this.center, this.radians);
  }
}
