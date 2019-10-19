class LinearObject extends DimensionalObject {
    constructor(p1, p2) {
        super();
        this.endpoints = [];
        this.p1 = p1;
        this.p2 = p2;
        this.setEndpoint(p1);
        this.setEndpoint(p2);
    }
    setEndpoint(vector) {
        this.endpoints.push(vector);
        this.fixTo(vector);
        vector.fixTo(this);
    }
    ;
    hasEndpoint(vector) {
        return this.endpoints.includes(vector);
    }
    ;
    midpoint() {
        return this.p1.add(this.p2).divide(2);
    }
    ;
}
