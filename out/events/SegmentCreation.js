class SegmentCreation extends Creation {
    constructor() {
        super();
        this.args = [[], []];
    }
    execute() {
        this.args[0].forEach(p1 => {
            grapher.plane.removeTempVector(p1);
            grapher.plane.addVector(p1);
            this.args[1].forEach(p2 => {
                grapher.plane.removeTempVector(p2);
                grapher.plane.addVector(p2);
                grapher.plane.addLine(new LineSegment(p1, p2));
            });
        });
        super.execute();
    }
    ;
}
