class CompoundTransformation extends Transformation {
    transformations: Transformation[];
    constructor(...transformations: Transformation[]) {
        super();
        this.transformations = transformations;
    }
    apply(obj: GeomObject): GeomObject {
        let image: GeomObject = obj;
        this.transformations.forEach(transformation => image = transformation.apply(image));
        return image;
    }
    
}