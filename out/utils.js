let utils = (function () {
    return {
        equal(x, y) {
            return Math.abs(x - y) <= settings.tolerance;
        },
        lessOrEqual(x, y) {
            return x < y || this.equal(x, y);
        },
        getSign(n) {
            return Math.abs(n) / n || 0;
        },
        floorTowardZero(n) {
            return (Math.floor(Math.abs(n)) * Math.round(Math.abs(n) / n)) || 0;
        },
        roundFromZero(n, dPlaces = 0) {
            let factor = Math.pow(10, dPlaces);
            n *= factor;
            return (Math.round(Math.abs(n)) * Math.round(Math.abs(n) / n)) / factor || 0;
        },
        sqr(x) {
            return x * x;
        },
        canvasToGrid(cam, vector) {
            let v = vector.add(cam.min).multiply(cam.perPixel / 100);
            v.y *= -1;
            return v;
        },
        flattenArray(arr) {
            return arr.reduce((flat, item) => Array.isArray(item) ? flat.concat(item) : flat.concat([item]), []);
        }
    };
})();
