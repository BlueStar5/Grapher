class Vector extends GeomObject {
  getIntersection(object: GeomObject): GeomObject {
    throw new Error("Method not implemented.");
  }
  x: number;
  y: number;
  endpointOf: GeomObject[] = [];
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }
  setAsEndpoint(line) {
    this.endpointOf.push(line);
  }
  ;
  isEndpointOf(line) {
    return this.endpointOf.includes(line);
  }
  ;
  draw(offset, color, dilation, radius) {
    offset = offset || new Vector(0, 0);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(roundFromZero(this.x * dilation + offset.x), roundFromZero(-this.y * dilation + offset.y), radius, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.fillText(`${this.id}`, roundFromZero(this.x * dilation + offset.x) - settings.pointRadius / 2, roundFromZero(-this.y * dilation + offset.y) - settings.pointRadius / 2 +
      14, 20);
  }
  ;
  angle(center?) {
    let x;
    let y;
    if (center) {
      let relativeVector = this.subtract(center);
      x = relativeVector.x;
      y = relativeVector.y;
    }
    else {
      x = this.x;
      y = this.y;
    }
    let refAngle = Math.abs(Math.atan(y / x));
    let angle = refAngle;
    if (x < 0 && y > 0) {
      angle = Math.PI - refAngle;
    }
    if (y < 0 && x > 0) {
      angle = Math.PI * 2 - refAngle;
    }
    if (x < 0 && y < 0) {
      angle = Math.PI + refAngle;
    }
    return angle;
  }
  ;
  translate(vector, translation?) {
    let image = this.add(vector);
    let fixedTo = this.constraints.fixedTo.filter(obj => !obj.fixedTo(this));
    // if a parent is trying to translate, let this act as if fixed to its image
    // instead to prevent a conflict
    if (translation) {
      fixedTo = fixedTo.filter(obj => obj !== translation.object);
      if (!translation.object.fixedTo(this)) {
        fixedTo.push(translation.getImage());
      }
    }
    if (fixedTo.length) {
      // try to translate to the closest intersection of all parents
      // if there is no intersection, then this point can't move anywhere
      let intersection = new Locus(fixedTo).getSelfIntersection(); //fixedTo[0].getIntersection(fixedTo.slice(1));
      if (intersection) {
        image = intersection.pointClosestTo(image);
      }
      //image = intersection ? image.getClosest(intersection) : this;
    }
    let displacement = image.subtract(this);
    this.setPosition(image);
    if (translation) {
      let exclude = [translation.object];
      if (translation.args && translation.args.exclude) {
        exclude = exclude.concat(translation.args.exclude);
      }
      log.broadcast(new Translation(this, displacement, { exclude: exclude }));
    }
    else {
      log.broadcast(new Translation(this, displacement));
    }
  }
  dilate(center, factor, dilation) {
    this.setPosition(this.dilated(center, factor));
    if (dilation) {
      let exclude = [dilation.object];
      if (dilation.args && dilation.args.exclude) {
        exclude = exclude.concat(dilation.args.exclude);
      }
      log.broadcast(new Dilation(this, center, factor, { exclude: exclude }));
    }
    else {
      log.broadcast(new Dilation(this, center, factor));
    }
  }
  dilated(center, factor) {
    return this.subtract(center).multiply(factor).add(center);
  }
  receive(transformation) {
    let fixedTo = this.constraints.fixedTo;
    if (fixedTo.includes(transformation.object) /*&& !this.received.some(t => t.similarTo(transformation))*/) {
      if (transformation.name === 'translation') {
        let translation = transformation;
        this.translate(translation.vector, translation);
      }
      if (transformation.name === 'rotation') {
        let rotation = transformation;
        if (!rotation.center.equals(this)) {
          this.rotate(rotation.center, rotation.radians, rotation);
        }
      }
      if (transformation.name === 'dilation') {
        let dilation = transformation;
        if (!dilation.center.equals(this)) {
          this.dilate(transformation.center, transformation.factor, dilation);
        }
      }
    }
  }
  getClosest(locus) {
    // map each object to its point closest to this, then reduce that array of
    // points to the closest one
    return locus.get().map(v => v.pointClosestTo(this)).reduce((closest, cur) => this.distanceTo(cur) < this.distanceTo(closest) ? cur : closest);
  }
  pointClosestTo(vector) {
    return this;
  }
  distanceTo(vector) {
    return vector.subtract(this).magnitude();
  }
  update() {
    if (selections.isSelected(this)) {
      ui.updateVectorProps(this);
    }
    ui.addObject("Line Segment ", this);
  }
  setPosition(vector, callers?) {
    if (callers) {
      /*let initial = this.clone();
      this.parents.forEach(p => {
        if (callers.includes(p)) {
          this.x = vector.x;
          this.y = vector.y;
        }
        else {
          this.x = initial.x;
          this.y = initial.y;
          callers.push(this);
          p.shift(vector.subtract(this), callers);
        }
      });*/
    }
    else {
      this.x = vector.x;
      this.y = vector.y;
    }
  }
  rotate(center, radians, rotation) {
    this.setPosition(this.rotated(center, radians));
    if (rotation) {
      let exclude = [rotation.object];
      if (rotation.args && rotation.args.exclude) {
        exclude = exclude.concat(rotation.args.exclude);
      }
      log.broadcast(new Rotation(this, center, radians, { exclude: exclude }));
    }
    else {
      log.broadcast(new Rotation(this, center, radians));
    }
  }
  rotated(center, radians) {
    let relativeVector = this.subtract(center);
    let angleSum = relativeVector.angle() + radians;
    if (!isNaN(angleSum)) {
      return new Vector(Math.cos(angleSum), Math.sin(angleSum)).multiply(relativeVector.magnitude()).add(center);
    }
    return this;
  }
  translated(vector) {
    return this.add(vector);
  }
  add(vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  subtract(vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }
  normal(CW) {
    if (CW) {
      return new Vector(this.y, -this.x);
    }
    return new Vector(-this.y, this.x);
  }
  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }
  normalize() {
    return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
  }
  floorTowardZero() {
    return new Vector(floorTowardZero(this.x), floorTowardZero(this.y));
  }
  roundFromZero(dPlaces) {
    return new Vector(roundFromZero(this.x, dPlaces), roundFromZero(this.y, dPlaces));
  }
  negative() {
    return new Vector(-this.x, -this.y);
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  equals(vector) {
    return equal(this.x, vector.x) && equal(this.y, vector.y);
  }
  clone(id?: number) {
    let clone = new Vector(this.x, this.y);
    clone.setId(id);
    return clone;
  }
  nameString() {
    if (this.id !== undefined) {
      return 'Vector ' + this.id;
    }
    else {
      return 'Vector';
    }
  }
  detailsString() {
    return `\(${roundFromZero(this.x, 2)}, ${roundFromZero(this.y, 2)}\)`;
  }
  toString() {
    return `${this.nameString()} ${this.detailsString()}`;
  }
}
