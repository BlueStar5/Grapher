let log = {
    transformations: [],
    log: function (transformation) {
        this.transformations.push(transformation);
        if (settings.logToConsole) {
            console.log(transformation.toString());
        }
    },
    plane: null,
    broadcast: function (transformation) {
        transformation.id = this.objectCommands;
        this.log(transformation);
        this.plane.getObjects().filter(obj => !(transformation.exclude && transformation.exclude.includes(obj)))
            .forEach(obj => obj.receive(transformation));
    },
    commands: [],
    logCommand: function (command) {
        this.commands.push(command);
    },
    getLastCommand: function () {
        return this.commands[this.commands.length - 1];
    },
    objectCommands: 0
};
