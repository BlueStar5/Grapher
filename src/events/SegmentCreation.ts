class SegmentCreation extends Creation {
  args = [[], []];
  constructor() {
    super();
  }
  execute() {
    this.args[0].forEach(p1 => {
      plane.removeTempVector(p1);
      plane.addVector(p1);
      this.args[1].forEach(p2 => {
        plane.removeTempVector(p2);
        plane.addVector(p2);
        plane.addLine(new LineSegment(p1, p2));
      });
    });
    super.execute();
  }
  ;
}
