class BindsConstraint extends Constraint {
    focus: GeomObject;
    constructor(focus: GeomObject) {
      super();
      this.focus = focus;
    }
    apply(obj: Vector, transManager: typeof transformationManager) {
        transManager.transform(obj.id, transManager.getTransformation(this.focus.id));
    }

}