class Grid {
    gridGap: number = 0;
    lines: LinearObject[] = [];
    minX: number = 0;
    minY: number = 0;
    maxX: number = 0;
    maxY: number = 0;
  
    update(gridGap, perPixel, minX, minY, maxX, maxY) {
      minX *= perPixel / 100;
      minY *= perPixel / 100;
      maxX *= perPixel / 100;
      maxY *= perPixel / 100;
      let scale = gridGap * perPixel / 100;
      if (this.gridGap !== gridGap) {
        this.gridGap = gridGap;
  
        this.lines.splice(0);
  
        // reset boundaries so all lines are redrawn
        let mean = (minX + maxX) / 2;
  
        this.minX = mean;
        this.maxX = mean;
  
        if (!(mean % scale)) {
          this.lines.push(new Line(new Vector(mean, minY - scale), new Vector(mean, maxY + scale)));
        }
  
        mean = (minY + maxY) / 2;
  
        this.minY = mean;
        this.maxY = mean;
  
        if (!(mean % scale)) {
          this.lines.push(new Line(new Vector(minX - scale, mean), new Vector(maxX + scale, mean)));
        }
      }
      this.lines = this.lines.filter(l => l.getSlope() == Infinity && (l.p1.x >= minX && l.p1.x <= maxX) || l.getSlope() == 0 && (l.p1.y >= minY && l.p1.y <= maxY));
      // add lines from new minX to old minX
      for (let x = Math.ceil(minX / scale); x < Math.ceil(this.minX / scale); x++) {
        this.lines.push(new Line(new Vector(x * scale, minY - scale), new Vector(x * scale, maxY + scale)));
      }
      // add lines from new maxX to old maxX
      for (let x = Math.floor(maxX / scale); x > Math.floor(this.maxX / scale); x--) {
        this.lines.push(new Line(new Vector(x * scale, minY - scale), new Vector(x * scale, maxY + scale)));
      }
  
      // add lines from new minY to old minY
      for (let y = Math.ceil(minY / scale); y < Math.ceil(this.minY / scale); y++) {
        this.lines.push(new Line(new Vector(minX - scale, y * scale), new Vector(maxX + scale, y * scale)));
      }
      // add lines from new maxY to old maxY
      for (let y = Math.floor(maxY / scale); y > Math.floor(this.maxY / scale); y--) {
        this.lines.push(new Line(new Vector(minX - scale, y * scale), new Vector(maxX + scale, y * scale)));
      }
      this.minX = minX;
      this.minY = minY;
      this.maxX = maxX;
      this.maxY = maxY;
    };
  }