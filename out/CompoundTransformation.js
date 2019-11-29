class CompoundTransformation extends Transformation {
    constructor(...transformations) {
        super();
        this.transformations = transformations;
    }
    apply(obj) {
        let image = obj;
        this.transformations.forEach(transformation => image = transformation.apply(image));
        return image;
    }
}
