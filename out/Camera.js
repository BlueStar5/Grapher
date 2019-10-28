class Camera {
    constructor(minX, minY, maxX, maxY, plane) {
        this.min = new Vector(minX, minY);
        this.max = new Vector(maxX, maxY);
        this.plane = plane;
        this.width = this.max.subtract(this.min).x;
        this.height = this.max.subtract(this.min).y;
        this.dilation = 100;
        this.perPixel = 100;
        this.gridGap = 50;
    }
    drawLines(lines, gridColors) {
        let color = settings.lineColor;
        let offset = this.min.negative();
        // set the boundaries of the grid
        let boundaryX1 = new LineSegment(new Vector(this.plane.grid.minX, this.plane.grid.minY), new Vector(this.plane.grid.maxX, this.plane.grid.minY));
        let boundaryX2 = new LineSegment(new Vector(this.plane.grid.minX, this.plane.grid.maxY), new Vector(this.plane.grid.maxX, this.plane.grid.maxY));
        let boundaryY1 = new LineSegment(new Vector(this.plane.grid.minX, this.plane.grid.minY), new Vector(this.plane.grid.minX, this.plane.grid.maxY));
        let boundaryY2 = new LineSegment(new Vector(this.plane.grid.maxX, this.plane.grid.minY), new Vector(this.plane.grid.maxX, this.plane.grid.maxY));
        lines.forEach(l => {
            if (gridColors) {
                let dPlaces = settings.displayPlaces;
                // if y-axis, set to y-axis color
                if (utils.roundFromZero(l.p1.x, dPlaces) === 0 && utils.roundFromZero(l.p2.x, dPlaces) === 0) {
                    color = gridColors.x;
                }
                // if x-axis, set to x-axis color
                else if (utils.roundFromZero(l.p1.y, dPlaces) === 0 && utils.roundFromZero(l.p2.y, dPlaces) === 0) {
                    color = gridColors.y;
                }
                // else, set to grid line color
                else {
                    color = gridColors.grid;
                }
            }
            // store points of new LineSegment that will be drawn
            let points = [];
            // iterate over each endpoint of the line
            [l.p1, l.p2].forEach(p => {
                // if the line extends beyond the camera, use an intersection with the camera instead
                if (!(p.x >= this.plane.grid.minX && p.x <= this.plane.grid.maxX && p.y >= this.plane.grid.minY && p.y <= this.plane.grid.maxY) || l.length() === Infinity) {
                    // find intersections of the line and the grid (4 max)
                    p = [l.getLineIntersection(boundaryX1), l.getLineIntersection(boundaryX2),
                        l.getLineIntersection(boundaryY1), l.getLineIntersection(boundaryY2)]
                        // ensure intersection exists and isn't already a point of the new LineSegment to be drawn
                        // TODO
                        .filter(i => i && !(points.length && points[0].x === i.x && points[0].y === i.y))
                        // choose the intersection closest to the original point
                        // TODO
                        .reduce((min, cur) => (!min || cur.subtract(p).magnitude() < min.subtract(p).magnitude()) ? cur : min, undefined);
                }
                else {
                    p = p.clone();
                }
                // add the point to the list of valid points
                points.push(p);
            });
            if (points[0] && points[1]) {
                let thickness = settings.lineThickness;
                if (gridColors) {
                    thickness = settings.gridThickness;
                }
                else if (selections.isSelected(l)) {
                    thickness = settings.selectedThickness;
                }
                // draw the LineSegment of the line that's in the grid
                new LineSegment(points[0], points[1]).draw(offset, color, 100 / this.perPixel, thickness);
                // if grid line
                if (gridColors) {
                    let dPlaces = settings.displayPlaces;
                    ctx.fillStyle = '#eee';
                    // if horizontal, write y-coordinate along the y-axis
                    if (l.getSlope() == 0) {
                        ctx.fillText(`${utils.roundFromZero(l.p1.y, dPlaces)}`, utils.roundFromZero(offset.x), utils.roundFromZero(offset.y - l.p1.y * 100 / this.perPixel), 30);
                    }
                    // if vertical, write x-coordinate along the x-axis
                    else {
                        ctx.fillText(`${utils.roundFromZero(l.p1.x, dPlaces)}`, utils.roundFromZero(l.p1.x * 100 / this.perPixel + offset.x), utils.roundFromZero(offset.y), 30);
                    }
                }
                else {
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.fillText(l.id, utils.roundFromZero(l.midpoint().x + offset.x), utils.roundFromZero(-l.midpoint().y + offset.y) + 4, 20);
                    ctx.textAlign = "start";
                    ctx.textBaseline = "alphabetic";
                }
            }
        });
    }
    ;
    drawArcs(arcs) {
        arcs.forEach(a => this.drawArc(a));
    }
    drawArc(arc) {
        let thickness = (selections.isSelected(arc) ? settings.selectedThickness : settings.lineThickness);
        arc.draw(this.min.negative(), 100 / this.perPixel, settings.lineColor, thickness);
    }
    resize(deltaMinX, deltaMinY, deltaMaxX, deltaMaxY) {
        this.min = this.min.add(new Vector(deltaMinX, deltaMinY));
        this.max = this.max.add(new Vector(deltaMaxX, deltaMaxY));
    }
    ;
    dilate(factor) {
        this.min = this.min.multiply(factor);
        this.max = this.max.multiply(factor);
    }
    ;
    scaleContent(change, translation) {
        this.dilation *= change;
        this.gridGap *= change;
        this.perPixel /= change;
        if (this.dilation <= 50) {
            this.gridGap *= 2;
            this.dilation = 100;
        }
        if (this.dilation >= 200) {
            this.dilation = 100;
            this.gridGap /= 2;
        }
        if (settings.focusZoom) {
            // dilate about the mouse wheel point
            this.translate(translation);
            this.dilate(1 / change);
            this.translate(translation.negative());
            this.dilate(change);
        }
    }
    ;
    translate(translation) {
        this.min = this.min.add(translation);
        this.max = this.max.add(translation);
    }
    ;
    update() {
        this.plane.grid.update(this.gridGap, this.perPixel, this.min.x, -this.max.y, this.max.x, -this.min.y);
        ctx.fillStyle = settings.gridBackground;
        ctx.fillRect(0, 0, this.max.subtract(this.min).x, this.max.subtract(this.min).y);
        this.drawArcs(this.plane.arcs);
        this.drawLines(this.plane.grid.lines, settings.gridLineColors);
        this.drawLines(this.plane.lines);
        this.drawVectors(this.plane.getVectors());
    }
    ;
    drawVectors(vectors) {
        vectors.forEach(v => {
            this.drawVector(v);
        });
    }
    ;
    drawVector(v) {
        if (v.x >= this.plane.grid.minX && v.x <= this.plane.grid.maxX && v.y >= this.plane.grid.minY && v.y <= this.plane.grid.maxY) {
            let radius = settings.pointRadius;
            if (selections.isSelected(v)) {
                radius = settings.selectedRadius;
            }
            v.draw(this.min.negative(), settings.vectorColor, 100 / this.perPixel, radius);
        }
    }
    ;
}
