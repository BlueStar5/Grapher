class OnConstraint extends Constraint {
    constructor(focus) {
        super();
        this.focus = focus;
    }
    apply(obj, transManager) {
        console.log(obj);
        let focusTransformation = transManager.getTransformation(this.focus.id);
        let focus;
        let image;
        let imageNew;
        focus = focusTransformation.apply(this.focus);
        image = transManager.getImage(obj);
        imageNew = focusTransformation.apply(image);
        transManager.transform(obj.id, new Translation(focus
            .pointClosestTo(imageNew).subtract(image)));
    }
}
