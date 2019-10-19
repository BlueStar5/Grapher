class Translation extends Transformation {
    constructor(object, vector, args) {
        super(object, args);
        this.name = "translation";
        this.vector = vector;
        if (this.preImage) {
            this.image = this.preImage.translated(vector);
        }
        else if (this.image) {
            this.preImage = this.image.translated(vector.negative());
        }
        else {
            this.preImage = this.object.translated(vector.negative());
            this.image = this.object.clone();
        }
    }
    getPreImage() {
        return this.preImage || (this.image ? this.image.translated(this.vector.negative()) : null) || this.object.translated(this.vector.negative());
    }
    getImage() {
        return this.image || (this.preImage ? this.preImage.translated(this.vector) : null) || this.object.clone();
    }
    toString() {
        if (settings.detailedConsole) {
            return `${this.object.nameString()} ${this.getPreImage().detailsString()} has been translated ${this.vector.detailsString()} to ${this.getImage().detailsString()}.`;
        }
        else {
            return `${this.object.nameString()} has been translated.`;
        }
    }
    equals(transformation) {
        return this.id === transformation.id && this.name === transformation.name && this.vector.equals(transformation.vector);
    }
    similarTo(transformation) {
        return this.id === transformation.id && this.name === transformation.name;
    }
}
