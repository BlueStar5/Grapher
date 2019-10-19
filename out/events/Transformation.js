class Transformation {
    constructor(object, args) {
        this.id = 0;
        this.object = object;
        if (args) {
            this.exclude = args.exclude;
            this.preImage = args.preImage;
            this.image = args.image;
        }
    }
}
