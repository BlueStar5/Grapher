class ControlInterface {
    constructor(mouseTarget) {
        this.mouseTarget = mouseTarget;
        mouseTarget.addEventListener("mousedown", function (e) {
            console.log(e.clientX - +mouseTarget.clientLeft);
        });
    }
}
