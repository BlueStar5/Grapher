class Plane {
  vectors = [];
  lines = [];
  arcs = [];
  tempVectors = [];
  intersections = [];
  grid;
  constructor(grid) {
    this.grid = grid;
  }
  getObjects() {
    return this.vectors.concat(this.lines).concat(this.arcs);
  }
  getObject(id) {
    return this.getObjects().filter(o => o.id === id)[0] || null;
  }
  getParents() {
    return this.getObjects().filter(obj => !this.vectors.includes(obj));
  }
  removeTempVector(vector) {
    this.tempVectors.splice(this.tempVectors.indexOf(vector), 1);
  }
  numObjects() {
    return this.getObjects().length;
  }
  getVectors() {
    return this.vectors.concat(this.tempVectors);
  }
  getVector(id) {
    return this.vectors.filter(v => v.id === id)[0] || null;
  }
  addVector(vector) {
    if (vector.id === undefined) {
      vector.setId(plane.numObjects());
      this.vectors.push(vector);
    }
  }
  removeVector(vector) {
    this.vectors.splice(this.vectors.indexOf(vector), 1);
  }
  addTempVector(vector) {
    this.tempVectors.push(vector);
  }
  getParent(id) {
    return this.getParents().filter(p => p.id === id)[0] || null;
  }
  getLine(id) {
    return this.lines.filter(l => l.id === id)[0] || null;
  }
  getArc(id) {
    return this.arcs.filter(a => a.id === id)[0] || null;
  }
  addLine(line) {
    line.setId(plane.numObjects());
    this.lines.push(line);
  }
  addArc(arc) {
    arc.setId(plane.numObjects());
    this.arcs.push(arc);
  }
}
