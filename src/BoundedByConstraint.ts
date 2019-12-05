class BoundedByConstraint extends Constraint {
  bound: Vector;
  constructor(bound: Vector) {
    super();
    this.bound = bound;
  }

  apply(line: LineSegment, transManager: typeof transformationManager) {
    console.log(line);
    let newBound: Vector = transManager.getImage(this.bound) as Vector;
    [line.p1, line.p2].forEach((endpoint, i, arr) => {
      if (this.bound.equals(endpoint)) {
        let lineTransformation: Transformation = transManager.getTransformation(line.id);
        let staticEndpointImg: Vector = lineTransformation.apply(arr[1 - i]) as Vector;
        transManager.transform(line.id, new Dilation(staticEndpointImg,
          newBound.subtract(staticEndpointImg).magnitude() / (transManager
            .getImage(line) as LineSegment).length()));
        transManager.transform(line.id, new Rotation(staticEndpointImg,
          newBound.angle(staticEndpointImg) - (lineTransformation
            .apply(this.bound) as Vector).angle(staticEndpointImg)));
      }
    });
  }
}