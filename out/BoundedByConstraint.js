class BoundedByConstraint extends Constraint {
    constructor(bound) {
        super();
        this.bound = bound;
    }
    apply(line, transManager) {
        console.log(line);
        let newBound = transManager.getImage(this.bound);
        [line.p1, line.p2].forEach((endpoint, i, arr) => {
            if (this.bound.equals(endpoint)) {
                let lineTransformation = transManager.getTransformation(line.id);
                let staticEndpointImg = lineTransformation.apply(arr[1 - i]);
                transManager.transform(line.id, new Dilation(staticEndpointImg, newBound.subtract(staticEndpointImg).magnitude() / transManager
                    .getImage(line).length()));
                transManager.transform(line.id, new Rotation(staticEndpointImg, newBound.angle(staticEndpointImg) - lineTransformation
                    .apply(this.bound).angle(staticEndpointImg)));
            }
        });
    }
}
