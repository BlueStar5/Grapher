class Translation extends Transformation {
  vector: Vector;
  constructor(vector: Vector) {
    super();
    this.vector = vector;
  }
  apply(obj: GeomObject): GeomObject {
    return obj.translated(this.vector);
  }
}
