class Dilation extends Transformation {
    constructor(center, factor) {
        super();
        this.center = center;
        this.factor = factor;
    }
    apply(obj) {
        return obj.dilated(this.center, this.factor);
    }
}
