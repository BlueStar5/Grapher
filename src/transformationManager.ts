let transformationManager = (function() {
    let transformations: {[id: number]: Transformation[]} = {};
    function transform(id: number, transformation: Transformation) {
        if (!transformations[id]) {
            transformations[id] = [];
        }
        transformations[id].push(transformation);
    }
    function applyTransformations(objects: GeomObject[]) {
        objects.forEach(obj => {
            let transformationList = transformations[obj.id];
            if (transformationList) {
                transformationList.forEach(transformation => obj.copy(transformation.apply(obj)));
            }
        });
        transformations = {};
    }
    function getImage(obj: GeomObject): GeomObject {
        return getTransformation(obj.id).apply(obj);
    }
    function getTransformation(id: number): Transformation {
        return new CompoundTransformation(...(transformations[id] || []))
    }
    return {
        transform: transform,
        applyTransformations: applyTransformations,
        transformations: transformations,
        getTransformation: getTransformation,
        getImage: getImage
    };
})();