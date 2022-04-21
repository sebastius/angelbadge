<template>
  <div/>
</template>

<script>
const paper = require('paper');
const opentype = require('opentype.js');

import architecture from './architecture'
import kaleidoscope from './kaleidoscope'

export default {
  name: "concept_2",
  mixins: [architecture, kaleidoscope],

  data: function () {
    return {
      /**
       * The name of the renderer is stored here, it should match the renderer name in the renderer options.
       */
      name: 'concept_2',

      //could be exposed but maybe we should set them
      genSize: 200,
      space: 10,
      backgroundOpacity: 1,

      //do not expose these
      COLOR_PALETTE: null,
      BG_COLOR: null,
      SEGMENTS: 6,
      ANGLE: 360 / 6,
      CENTER: null,
      symbols: [],
      hexaCopy: null,
    }
  },

  methods: {

    prerender: function () {
      // prepare rendering:
      this.reset_randomizers();
      this.resetColors();
    },
    createWallpaper: function () {
      this.prerender();
      this.generateHexagon();
    },
    createPoster: function () {
      this.prerender();
      this.generateHexagon();
    },

    shuffle: function (a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = this.randomizerColor.int(0, i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    initColors: function () {
      this.randomizerColor.use(this.seedrandom(this.seed));
      this.COLOR_PALETTE = this.shuffle(['#fa448c', '#fec859', '#43b5a0', '#491d88', '#331a38']);
      this.BG_COLOR = this.COLOR_PALETTE.slice(-1)[0];
    },
    randomColor: function () {
      // returns a random color from the palette, that is not the background color.
      return this.COLOR_PALETTE[this.randomContainsHacker.int(0, this.COLOR_PALETTE.length - 1)]
    },
    clearCanvas: function () {
      paper.project.activeLayer.removeChildren();
      this.initColors();
      this.symbols = [];
      this.hexaCopy = null;
    },
    generateHexagon: function () {
      this.CENTER = paper.view.bounds.center;

      this.clearCanvas();
      let triangle = new paper.Path();
      let sizeVec = new paper.Point(0, this.genSize);

      triangle.addSegment(this.CENTER);
      triangle.addSegment(this.CENTER.add(sizeVec.rotate(this.ANGLE / 2)));
      triangle.addSegment(this.CENTER.add(sizeVec.rotate(-this.ANGLE / 2)));
      triangle = this.roundCorners(triangle, 40);
      let triangleCenter = triangle.position;

      let shapes1 = this.genShapes(triangle);

      let grp;
      if (this.setting('kaleidoscope_dna.monochrome')) {
        grp = new paper.Group();

        shapes1.forEach(shape => {
          let tmp = triangle.subtract(shape);
          triangle.remove();
          shape.remove();
          triangle = tmp;
        });
        triangle.fillColor = this.BG_COLOR;
        grp.addChild(triangle);
      } else {
        let tBG = triangle.clone();
        tBG.fillColor = this.BG_COLOR;
        this.COLOR_PALETTE.shift();
        let shapes2 = this.genShapes(triangle);

        let additions = [];
        for (let i = 0; i < this.setting('kaleidoscope_dna.emoji'); i++) {
          additions.push(this.kaleidoScopeContentEmoji(triangle));
        }
        for (let i = 0; i < this.setting('kaleidoscope_dna.custom'); i++) {
          additions.push(this.kaleidoScopeContentCustomShape(triangle));
        }


        grp = new paper.Group({children: [triangle, tBG].concat(shapes1).concat(shapes2).concat(additions)});
        grp.children.forEach(item => item.blendMode = this.setting('currentBlendMode'));

        grp.clipped = true;
        this.COLOR_PALETTE.shift();
      }
      grp.translate([0, this.space]);

      let mainHexagon = this.spread(grp, triangleCenter);
      this.hexaCopy = mainHexagon.clone();
      this.hexaCopy.position = [-this.genSize * 3, -this.genSize * 3];
      if (this.setting('kaleidoscope_dna.fillBackground')) {
        mainHexagon = this.fillView(mainHexagon);
        this.setText(mainHexagon, this.setting('seed_input'));
      }

    },
    setText: function (mainHexagon, text) {
      let removeLater = [];

      let z = async () => {
        const font = await opentype.load('./Alice-Regular-webfont.woff');

        let fontPath = font.getPath(text, 0, 0, this.genSize * 0.8);
        let textPath = paper.project.importSVG(fontPath.toSVG());
        textPath.fillColor = this.monochrome === true ? this.BG_COLOR : this.COLOR_PALETTE[0];
        textPath.position.y = mainHexagon.position.y - (this.genSize - this.space) / 2;
        textPath.bounds.topLeft.x = this.randomDNA.int(50, Math.floor(paper.project.view.bounds.width - textPath.bounds.width - 100));
        this.symbols.forEach(symbol => {
          if (symbol.intersects(textPath)) {
            let newCopy = this.hexaCopy.clone();
            newCopy.position = symbol.position;
            newCopy.children.forEach(tri => {
              if (tri.children[0].intersects(textPath)) {
                removeLater.push(tri);
              }
            })
            symbol.remove();
          }
        });
        removeLater.forEach(tri => tri.tweenTo({
          opacity: 0,
          position: [tri.position.x, 1000],
          rotation: this.randomDNA.int(-10, 10)
        }, {duration: this.randomDNA.int(500, 1000)}));
        this.hexaCopy.remove();
        //textPath.scale(1.2);
        textPath.rotate(this.randomDNA.int(-5, 5));
        textPath.sendToBack();
      }
      z()

    },
    fillView: function (hexagon) {
      let offset = paper.Point.random().multiply([-this.genSize, -this.genSize]);
      let symbol = new paper.Symbol(hexagon);
      let hexaWidthDist = this.genSize * 3 + this.space * 5
      let hexaHeightDist = (hexagon.bounds.height + this.space) / 2
      let lineCount = 0;

      for (let y = offset.y; y < paper.project.view.bounds.height + hexaHeightDist; y += hexaHeightDist) {
        for (let x = offset.x; x < paper.project.view.bounds.width + hexaWidthDist; x += hexaWidthDist) {
          if (lineCount % 2 === 0) {
            this.symbols.push(symbol.place([x, y]));
          } else {
            this.symbols.push(symbol.place([x + hexaWidthDist / 2, y]));
          }
        }
        lineCount++;
      }
      this.symbols.forEach(sym => sym.opacity = this.backgroundOpacity);
      let mainSymbol = this.symbols[this.randomDNA.int(0, this.symbols.length)];
      while (!paper.project.view.bounds.contains(mainSymbol.bounds)) {
        mainSymbol = this.symbols[this.randomDNA.int(0, this.symbols.length)];
      }
      mainSymbol.opacity = 1;
      return mainSymbol;
    },
    genShapes: function (path) {
      let shapes = [];
      let timeout = 5;
      let counter = 0
      while (counter < timeout) {
        let newLine = this.setTrace(path);

        while (this.checkIntersection(shapes, newLine) && counter < timeout) {
          newLine.remove();
          newLine = this.setTrace(path);
          counter++;
        }
        if (counter < timeout) {
          counter = 0;
          shapes.push(newLine);
        } else {
          newLine.remove();
        }
      }
      return shapes;
    },
    checkIntersection: function (arr, path) {
      return arr.filter(item => item.intersects(path)).length > 0
    },

    setTrace: function (path) {
      let trace = new paper.Path.Rectangle([0, 0], [this.genSize / 15, 40]);

      let pL = trace.bounds.topLeft;
      let pR = trace.bounds.topRight;
      trace = this.placeVia(trace, trace.bounds.bottomCenter);

      for (let i = 0; i < this.randomDNA.int(1, 4); i++) {
        [trace, pL, pR] = this.addLineSegment(trace, pL, pR);
      }
      trace = this.placeVia(trace, pL.add(pR.subtract(pL).divide(2)));

      trace.position = this.getRndPointOnPath(path);
      trace.rotate(this.randomDNA.int(0, 4) * 90);
      trace.fillColor = this.COLOR_PALETTE[0];
      return trace;
    },
    addLineSegment: function (path, posLeft, posRight) {
      let dir = this.randomDNA.int(0, 4);
      let trace = new paper.Path.Rectangle([0, 0], [this.genSize / 15, 40]);

      trace.bounds.bottomLeft = posLeft;
      let pL = trace.bounds.topLeft;
      let pR = trace.bounds.topRight;

      switch (dir) {
        case 0:
          path.rotate(45, posRight);
          break;
        case 1:
          path.translate([0, -10]);
          break;
        case 2:
          path.translate([0, -10]);
          break;
        case 3:
          path.rotate(-45, posLeft);
          break;
      }
      let tmp = trace.unite(path);
      trace.remove();
      path.remove();
      return [tmp, pL, pR];
    },
    placeVia: function (path, pos) {
      let type = this.randomDNA.float(0, 1);
      if (type < 0.3) {
        let via = new paper.Path.Circle(pos, this.genSize / 15);
        let tmp = path.unite(via);
        via.remove();
        path.remove();
        return tmp;
      } else {
        let via = new paper.Path.Circle(pos, this.genSize / 15 * 1.5);
        let tmp = path.unite(via);
        via.remove();
        path.remove();
        path = tmp;
        via = new paper.Path.Circle(pos, this.genSize / 15 * 0.5);
        tmp = path.subtract(via);
        via.remove();
        path.remove();
        return tmp;
      }
    },
    spread: function (grp, triangleCenter) {
      let hexagon = new paper.Group();
      hexagon.addChild(grp);
      for (let i = 1; i < this.SEGMENTS; i++) {
        let newGrp = grp.clone();
        if (i % 2 === 1) {
          newGrp.scale(-1, 1, triangleCenter);
        }
        newGrp.rotate(this.ANGLE * i, this.CENTER);
        hexagon.addChild(newGrp);
      }
      return hexagon;
    },

    roundCorners: function (path, radius) {
      let segments = path.segments.slice(0);
      path.removeSegments();

      for (let i = 0, l = segments.length; i < l; i++) {
        let curPoint = segments[i].point;
        let nextPoint = segments[i + 1 === l ? 0 : i + 1].point;
        let prevPoint = segments[i - 1 < 0 ? segments.length - 1 : i - 1].point;
        let nextDelta = curPoint.subtract(nextPoint);
        let prevDelta = curPoint.subtract(prevPoint);

        nextDelta.length = radius;
        prevDelta.length = radius;

        path.add(
            new paper.Segment(
                curPoint.subtract(prevDelta), null, prevDelta.divide(2)
            )
        );

        path.add(
            new paper.Segment(
                curPoint.subtract(nextDelta), nextDelta.divide(2), null
            )
        );
      }
      path.closed = true;
      return path;
    }
  }
}
</script>

<style scoped>

</style>