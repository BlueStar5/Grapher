class ControlInterface {
    mouseTarget: HTMLCanvasElement;
    constructor(mouseTarget: HTMLCanvasElement) {
        this.mouseTarget = mouseTarget;
        mouseTarget.addEventListener("mousedown", function(e: MouseEvent) {
            

            console.log(e.clientX - + mouseTarget.clientLeft);
        });
    }
}