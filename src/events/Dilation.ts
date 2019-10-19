class Dilation extends Transformation {
  center: Vector;
  factor: number;
  constructor(object, center, factor, args?) {
    super(object, args);
    this.name = "dilation";
    this.center = center;
    this.factor = factor;
    if (this.preImage) {
      this.image = this.preImage.dilated(this.center, this.factor);
    }
    else if (this.image) {
      this.preImage = this.image.dilated(this.center, 1 / this.factor);
    }
    else {
      this.preImage = this.object.dilated(this.center, 1 / this.factor);
      this.image = this.object.clone();
    }
  }
  getPreImage() {
    return this.preImage || (this.image ? this.image.dilated(this.center, 1 / this.factor) : null) || this.object.dilated(this.center, 1 / this.factor);
  }
  getImage() {
    return this.image || (this.preImage ? this.preImage.dilated(this.center, this.factor) : null) || this.object.clone();
  }
  toString() {
    if (settings.detailedConsole) {
      return `${this.object.nameString()} ${this.getPreImage().detailsString()} has been dilated ${this.factor}x about ${this.center.detailsString()} to ${this.getImage().detailsString()}.`;
    }
    else {
      return `${this.object.nameString()} has been dilated.`;
    }
  }
  equals(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center) && this.factor === transformation.factor;
  }
  similarTo(transformation) {
    return this.id === transformation.id && this.name === transformation.name && this.center.equals(transformation.center);
  }
}
