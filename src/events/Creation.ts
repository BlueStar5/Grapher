abstract class Creation {
  args: GeomObject[][];
  currentArg: number = 0;
  finished: boolean = false;
  addArg(arg) {
    this.args[this.currentArg].push(arg);
  }
  nextArg() {
    if (this.currentArg === this.args.length - 1) {
      this.currentArg = 0;
    }
    else {
      this.currentArg++;
    }
  }
  argsFilled() {
    return this.args.every(arg => arg.length);
  }
  execute() {
    this.finished = true;
  }
}
