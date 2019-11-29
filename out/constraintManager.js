let constraintManager = (function () {
    let constraints = {};
    function constrain(id, constraint) {
        if (!constraints[id]) {
            constraints[id] = [];
        }
        constraints[id].push(constraint);
    }
    function applyConstraints(objects) {
        objects.forEach(obj => {
            let constraintList = constraints[obj.id];
            if (constraintList) {
                constraintList.forEach(constraint => constraint.apply(obj, transformationManager));
            }
        });
    }
    return {
        constrain: constrain,
        applyConstraints: applyConstraints
    };
})();
