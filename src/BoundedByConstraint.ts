class BoundedByConstraint extends Constraint {
  bound: Vector;
  constructor(bound: Vector) {
    super();
    this.bound = bound;
  }

  apply(line: LineSegment, transformations: {}) {
    let newBound = transformations[this.bound.id].apply(this.bound);
    [line.p1, line.p2].forEach((endpoint, i, arr) => {
      if (this.bound.equals(endpoint)) {
        let staticEndpoint = arr[1 - i];
        console.log(newBound.distanceTo(staticEndpoint) / line.length());
        transformations[line.id] = new Dilation(staticEndpoint, newBound.distanceTo(staticEndpoint) / line.length());
      }
    });
  }
}