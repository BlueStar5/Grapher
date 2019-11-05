class ArcCreation extends Creation {
    constructor() {
        super();
        this.args = [[], [], []];
    }
    execute() {
        this.args[0].forEach(center => {
            grapher.plane.removeTempVector(center);
            grapher.plane.addVector(center);
            this.args[1].forEach(p1 => {
                grapher.plane.removeTempVector(p1);
                grapher.plane.addVector(p1);
                this.args[2].forEach(p2 => {
                    grapher.plane.removeTempVector(p2);
                    // constrain second point to radius
                    p2 = p2.subtract(center).normalize().multiply(p1.distanceTo(center)).add(center);
                    grapher.plane.addVector(p2);
                    grapher.plane.addArc(new Arc(new Angle(p1, center, p2)));
                });
            });
        });
        super.execute();
    }
}
