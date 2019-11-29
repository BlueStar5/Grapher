let transformationManager = (function () {
    let transformations = {};
    function transform(id, transformation) {
        if (!transformations[id]) {
            transformations[id] = [];
        }
        transformations[id].push(transformation);
    }
    function applyTransformations(objects) {
        objects.forEach(obj => {
            let transformationList = transformations[obj.id];
            if (transformationList) {
                transformationList.forEach(transformation => obj.set(transformation.apply(obj)));
            }
        });
        transformations = {};
    }
    function getImage(obj) {
        return getTransformation(obj.id).apply(obj);
    }
    function getTransformation(id) {
        return new CompoundTransformation(...(transformations[id] || []));
    }
    return {
        transform: transform,
        applyTransformations: applyTransformations,
        transformations: transformations,
        getTransformation: getTransformation,
        getImage: getImage
    };
})();
