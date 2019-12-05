class OnConstraint extends Constraint {
  focus: GeomObject;
  constructor(focus: GeomObject) {
    super();
    this.focus = focus;
  }
  apply(obj: Vector, transManager: typeof transformationManager) {
    console.log(obj);
    let focusTransformation: Transformation = transManager.getTransformation(this.focus.id);
    let focus: GeomObject;
    let image: Vector;
    let imageNew: Vector;
    focus = focusTransformation.apply(this.focus);
    image = transManager.getImage(obj) as Vector;
    imageNew = focusTransformation.apply(image) as Vector;
    transManager.transform(obj.id, new Translation(focus
      .pointClosestTo(imageNew).subtract(image)));
  }
}