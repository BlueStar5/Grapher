class Translation extends Transformation {
    constructor(vector) {
        super();
        this.vector = vector;
    }
    apply(obj) {
        return obj.translated(this.vector);
    }
}
