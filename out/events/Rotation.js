class Rotation extends Transformation {
    constructor(object, center, radians, args) {
        super(object, args);
        this.name = "rotation";
        this.center = center;
        this.radians = radians;
        if (this.preImage) {
            this.image = this.preImage.rotated(this.center, this.radians);
        }
        else if (this.image) {
            this.preImage = this.image.rotated(this.center, -this.radians);
        }
        else {
            this.preImage = this.object.rotated(this.center, -this.radians);
            this.image = this.object.clone();
        }
    }
    getPreImage() {
        return this.preImage || (this.image ? this.image.rotated(this.center, -this.radians) : null) || this.object.rotated(this.center, -this.radians);
    }
    getImage() {
        return this.image || (this.preImage ? this.preImage.rotated(this.center, this.radians) : null) || this.object.clone();
    }
    toString() {
        if (settings.detailedConsole) {
            return `${this.object.nameString()} ${this.getPreImage().detailsString()} has been rotated ${this.radians} radians about ${this.center.detailsString()} to ${this.getImage().detailsString()}.`;
        }
        else {
            return `${this.object.nameString()} has been rotated.`;
        }
    }
    // this.receivers = [];
    // this.addReceiver(object) {
    //   this.receivers.push(object);
    // }
    equals(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center) && this.radians === transformation.radians;
    }
    similarTo(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center);
    }
}
