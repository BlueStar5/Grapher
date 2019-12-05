abstract class Constraint {
    abstract apply(obj: GeomObject, transManager: typeof transformationManager);
}