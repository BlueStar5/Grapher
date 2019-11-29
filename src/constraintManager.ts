let constraintManager = (function() {
  let constraints: {[id: number]: Constraint[]} = {};
  function constrain(id: number, constraint: Constraint) {
    if (!constraints[id]) {
      constraints[id] = [];
    }
    constraints[id].push(constraint);
  }
  function applyConstraints(objects: GeomObject[]) {
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
  }
})();