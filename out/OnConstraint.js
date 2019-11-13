class OnConstraint extends Constraint {
    constructor(targetObj) {
        super();
        this.targetObj = targetObj;
    }
    apply(obj, transformations) {
        let targetObjTransformation = transformations[this.targetObj.id];
        let target;
        let object;
        if (targetObjTransformation) {
            target = targetObjTransformation.apply(this.targetObj);
            object = targetObjTransformation.apply(obj);
        }
        else {
            target = this.targetObj;
            object = obj;
        }
        transformations[obj.id] = new Translation(target.pointClosestTo(object).subtract(obj));
    }
}
