let settings = {
    mode: "pan",
    selecting: function () {
    },
    focusZoom: true,
    rescaleContent: false,
    selected: [],
    lastSelected: function () {
        return this.selected[this.selected.length - 1];
    },
    selectRadius: 5,
    isSelected: function (object) {
        return this.selected.includes(object);
    },
    pointRadius: 4,
    selectedRadius: 6,
    gridThickness: 1,
    lineThickness: 2,
    selectedThickness: 4,
    rescaleWeightX: .5,
    rescaleWeightY: .5,
    tolerance: 1e-10,
    displayPlaces: 3,
    detailedConsole: true,
    logToConsole: true,
    gridBackground: '#002244',
    gridLineColors: {
        grid: '#ff0',
        x: '#f00',
        y: '#99ff00'
    },
    vectorColor: '#f80',
    lineColor: '#0ac'
};
