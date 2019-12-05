let constraintManager = (function () {
    let constraints = {};
    let updated = [];
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
            updated.push(obj.id);
        });
    }
    return {
        constrain: constrain,
        applyConstraints: applyConstraints
    };
})();
