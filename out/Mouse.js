function Mouse() {
    this.mouse = {
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
        downX: 0,
        downY: 0,
        down: false,
        deltaWheel: 0,
        wheelX: 0,
        wheelY: 0
    };
    this.moveFunctions = [];
    this.downFunctions = [];
    this.wheelFunctions = [];
    document.addEventListener('mousemove', e => {
        let newX = e.clientX - ui.canvasOffsetX();
        let newY = e.clientY;
        this.mouse.deltaX = newX - this.mouse.x;
        this.mouse.deltaY = newY - this.mouse.y;
        this.mouse.x = newX;
        this.mouse.y = newY;
        this.moveFunctions.forEach(priority => {
            priority.forEach(funcData => funcData.f(...[this.mouse].concat(funcData.args)));
        });
        //cam.update(this.mouse);
    });
    ui.canvas.addEventListener('mousedown', e => {
        this.mouse.down = true;
        this.mouse.downX = e.clientX - ui.canvasOffsetX();
        this.mouse.downY = e.clientY;
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.downFunctions.forEach(priority => {
            priority.forEach(funcData => funcData.f(...[this.mouse].concat(funcData.args)));
        });
    });
    document.addEventListener('mouseup', e => this.mouse.down = false);
    ui.canvas.addEventListener('mousewheel', (e) => {
        this.mouse.deltaWheel = e.deltaY / 300;
        this.mouse.wheelX = e.clientX - ui.canvasOffsetX();
        this.mouse.wheelY = e.clientY;
        this.wheelFunctions.forEach(priority => {
            priority.forEach(funcData => funcData.f(...[this.mouse].concat(funcData.args)));
        });
        this.mouse.deltaWheel = 0;
    });
    this.onMove = function (f, priority, args) {
        if (!this.moveFunctions[priority]) {
            this.moveFunctions[priority] = [];
        }
        this.moveFunctions[priority].push({ f: f, args: args });
    };
    this.onDown = function (f, priority, args) {
        if (!this.downFunctions[priority]) {
            this.downFunctions[priority] = [];
        }
        this.downFunctions[priority].push({ f: f, args: args });
    };
    this.onWheel = function (f, priority, args) {
        if (!this.wheelFunctions[priority]) {
            this.wheelFunctions[priority] = [];
        }
        this.wheelFunctions[priority].push({ f: f, args: args });
    };
}
