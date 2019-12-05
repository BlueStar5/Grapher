class BindsConstraint extends Constraint {
    constructor(focus) {
        super();
        this.focus = focus;
    }
    apply(obj, transManager) {
        transManager.transform(obj.id, transManager.getTransformation(this.focus.id));
    }
}
