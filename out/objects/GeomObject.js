class GeomObject {
    constructor() {
        this.constraints = {
            fixedTo: []
        };
        this.id = undefined;
    }
    copy(arg0) {
        throw new Error("Method not implemented.");
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
