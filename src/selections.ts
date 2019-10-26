let selections = {
  groups: [[], []],
  groupNum: 0,
  setNextGroup: function() {
    if (this.selectedGroup === this.groups.length - 1) {
      this.selectedGroup = 0;
    }
    else {
      this.selectedGroup++;
    }
  },
  isSelected: function(object) {
    return this.groups.some(group => group.includes(object));
  },
  getSelected: function() {
    return this.groups[this.groupNum];
  },
  lastSelected: function() {
    let selected = this.getSelected();
    return selected[selected.length - 1];
  },
  getGroup: function() {
    return this.groups[this.groupNum];
  },
  clearSelection: function() {
    this.getGroup().length = 0;
  },
  addToGroup: function(object, groupNum = this.groupNum) {
    let group;
    if (groupNum !== undefined) {
      group = this.groups[groupNum];
    }
    else {
      group = this.getGroup();
    }
    if (!group.includes(object)) {
      group.push(object);
    }
  },
  setCommandGroup: function(command, groupNum) {
    let commandGroups = this.commandSelectGroups[command];
    if (groupNum === undefined) {
      groupNum = this.groupNum;
    }
    if (!commandGroups.includes(groupNum)) {
      commandGroups.push(groupNum);
    }
  },
  getCommandGroups: function(command) {
    return this.commandSelectGroups[command].map(groupNum => this.getGroup(groupNum));
  },
  clearCommandGroups: function(command) {
    this.commandSelectGroups[command] = [];
  },
  commandSelectGroups: {
    segment: []
  }
}