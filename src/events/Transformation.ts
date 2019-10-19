abstract class Transformation {
  id = 0;
  name: string;
  object: GeomObject;
  preImage: GeomObject;
  image: GeomObject;
  exclude: GeomObject[];
  constructor(object: GeomObject, args?: {
    exclude?: GeomObject[];
    preImage?: GeomObject;
    image?: GeomObject;
  }) {
    this.object = object;
    if (args) {
      this.exclude = args.exclude;
      this.preImage = args.preImage;
      this.image = args.image;
    }
  }
}
