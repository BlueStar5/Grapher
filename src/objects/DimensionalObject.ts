abstract class DimensionalObject extends GeomObject {
  abstract getLineIntersection(line: GeomObject): GeomObject;
  abstract getArcIntersection(arc: Arc): GeomObject;
  abstract getLocusIntersection(locus: Locus): GeomObject;
  abstract getIntersection(obj: GeomObject): GeomObject;
  abstract containsPoint(point: Vector): boolean;
}
