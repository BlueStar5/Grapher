class GeomObject {
    constructor() {
        this.constraints = {
            fixedTo: []
        };
        this.id = undefined;
    }
    fixTo(obj) {
        this.constraints.fixedTo.push(obj);
    }
    ;
    fixedTo(obj) {
        return this.constraints.fixedTo.includes(obj);
    }
    setId(id) {
        this.id = id;
    }
}
