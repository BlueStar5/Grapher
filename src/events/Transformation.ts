abstract class Transformation {
  id: number = 0;
  abstract apply(obj: GeomObject): GeomObject;
}
