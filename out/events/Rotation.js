class Rotation extends Transformation {
    constructor(center, radians) {
        super();
        this.center = center;
        this.radians = radians;
    }
    // this.receivers = [];
    // this.addReceiver(object) {
    //   this.receivers.push(object);
    // }
    apply(obj) {
        return obj.rotated(this.center, this.radians);
    }
}
