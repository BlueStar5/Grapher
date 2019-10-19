class ArcCreation extends Creation {
  args: Vector[][] = [[], [], []];
  constructor() {
    super();
  }
  execute() {
    this.args[0].forEach(center => {
      plane.removeTempVector(center);
      plane.addVector(center);
      this.args[1].forEach(p1 => {
        plane.removeTempVector(p1);
        plane.addVector(p1);
        this.args[2].forEach(p2 => {
          plane.removeTempVector(p2);
          // constrain second point to radius
          p2 = p2.subtract(center).normalize().multiply(p1.distanceTo(center)).add(center);
          plane.addVector(p2);
          plane.addArc(new Arc(new Angle(p1, center, p2)));
        });
      });
    });
    super.execute();
  }
}
