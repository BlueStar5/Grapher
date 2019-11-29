class BoundedByConstraint extends Constraint {
  bound: Vector;
  constructor(bound: Vector) {
    super();
    this.bound = bound;
  }

  apply(line: LineSegment, transformationManager) {
    let newBound: Vector = transformationManager.getImage(this.bound);//transformations[this.bound.id].apply(this.bound);
    [line.p1, line.p2].forEach((endpoint, i, arr) => {
      if (this.bound.equals(endpoint)) {
        let staticEndpoint = arr[1 - i];
        //console.log(newBound.distanceTo(staticEndpoint) / line.length());
        let dilation = new Dilation(staticEndpoint,
          newBound.subtract(staticEndpoint).magnitude() / line.length()/* *
          Math.cos(newBound.angle(staticEndpoint) -
          this.bound.angle(staticEndpoint))*/)
        console.log("COS: " + (Math.cos(newBound.angle(staticEndpoint) - this.bound.angle(staticEndpoint))))
        transformationManager.transform(line.id, dilation);
        //let bound: Vector = dilation.apply(this.bound) as Vector;
        transformationManager.transform(line.id, new Rotation(staticEndpoint, newBound.angle(staticEndpoint) - this.bound.angle(staticEndpoint)));
      }
    });
  }
}