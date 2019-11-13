class BoundedByConstraint extends Constraint {
    constructor(bound) {
        super();
        this.bound = bound;
    }
    apply(line, transformations) {
        let newBound = transformations[this.bound.id].apply(this.bound);
        [line.p1, line.p2].forEach((endpoint, i, arr) => {
            if (this.bound.equals(endpoint)) {
                let staticEndpoint = arr[1 - i];
                console.log(newBound.distanceTo(staticEndpoint) / line.length());
                transformations[line.id] = new Dilation(staticEndpoint, newBound.distanceTo(staticEndpoint) / line.length());
            }
        });
    }
}
