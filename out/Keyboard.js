function Keyboard() {
    this.keys = {};
    this.downFunctions = {};
    document.addEventListener('keydown', e => {
        this.keys[e.key.toLowerCase()] = true;
        for (let key in this.downFunctions) {
            if (this.downFunctions.hasOwnProperty(key) && key.split(' ').includes(e.key.toLowerCase())) {
                if (key.split(' ').every(key => this.keys[key])) {
                    this.downFunctions[key].forEach(f => f());
                }
            }
        }
    });
    document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
    this.onDown = function (key, f) {
        if (!this.downFunctions.hasOwnProperty(key)) {
            this.downFunctions[key] = [];
        }
        this.downFunctions[key].push(f);
    };
}
