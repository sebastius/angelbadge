<template>
  <div/>
</template>

<script>
const paper = require('paper');
import architecture from './architecture'
import kaleidoscope from './kaleidoscope'

export default {
  name: "concept_1",
  mixins: [architecture, kaleidoscope],

  data: function () {
    return {
      // The name of the renderer is stored here, it should match the renderer name in the renderer options.
      name: 'concept_1',
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

      /*
      * Here a composition is made of all the stuff that needs to be on the final image.
      * This should serve as the location to set fixed-point variables such as position.
      * */

      // These settings are probably moved to the 'poster generation' section, as they are specific to that
      // method only. The data is placed here so it's not forgotten.
      // const data = {
      //   abbreviation: "MCH2021",
      //   title: {
      //     location: {
      //       x: 2100 + 30 / 2,
      //       y: 2970 + 30 / 4
      //     },
      //     text: "May Contain Hackers",
      //   },
      //   date: {
      //     from: "6 august 2021",
      //     to: "10 august 2021"
      //   },
      //   place: {
      //     town: "Zeewolde",
      //     country: "Netherlands"
      //   },
      //   info: {
      //     site: "mch2021.org",
      //     wiki: "wiki.mch2021.org"
      //   },
      //   legacy: {
      //     1989: 'GHP',
      //     1993: 'HEU',
      //     1997: "HIP",
      //     2001: "HAL",
      //     2005: "WTH",
      //     2009: "HAR",
      //     2013: "OHM",
      //     2017: "SHA",
      //     2021: "MCH",
      //   },
      //   // thank you, author :)
      //   easteregg: "0C 64: 7C 00 E5 A1 78 05 A2 8D 18 D4 C8 D0 F7 58 A8 8D 11 D0 D0 EE",
      //   designers: "bleeptrack, stitch, boekenwuurm",
      // }


      this.renderKaleidoScope(this.verbalLocation('top-left'));
      this.renderKaleidoScope(this.verbalLocation('top-right'));
      this.renderKaleidoScope(this.verbalLocation('bottom-left'));
      this.renderKaleidoScope(this.verbalLocation('bottom-right'));

      this.renderTitleBar(this.rendercanvas.width / 2, this.rendercanvas.height / 2);
    },
    createPoster: function () {
      this.prerender();

      this.renderKaleidoScope(this.verbalLocation('top-left'));
      this.renderKaleidoScope(this.verbalLocation('top-right'));
      this.renderKaleidoScope(this.verbalLocation('bottom-left'));
      this.renderKaleidoScope(this.verbalLocation('bottom-right'));

      this.renderTitleBar(this.rendercanvas.width / 2, this.rendercanvas.height / 2);
    },
    randomColor: function () {
      // Use a limited number of generated colors. This prevents tons of extra calls to
      // a randomizer, which is pretty slow. It also limits the amount of colors so to have
      // N-color variants.
      if (this.randomColorBuffer.length >= this.setting("maximumRandomColors")) {
        this.randomColorPointer++;
        return this.randomColorBuffer[this.randomColorPointer % this.randomColorBuffer.length];
      }

      let new_color = new paper.Color(this.randomizerColor.float(), this.randomizerColor.float(), this.randomizerColor.float());
      this.randomColorBuffer.push(new_color);
      // returns a hex color based on the current randomizer state:
      return new_color;
    },
    verbalLocation: function (location) {
      let x = this.rendercanvas.width - 200; // some side padding
      let y = this.rendercanvas.height - 200; // some side padding
      let cx = 0;
      let cy = 0;

      if (location === 'top-left') {
        cx = this.randomGeometry.int(-200, -x / 2);
        cy = this.randomGeometry.int(-200, -y / 2);
      }
      if (location === 'top-right') {
        cx = this.randomGeometry.int(200, x / 2);
        cy = this.randomGeometry.int(-200, -y / 2);
      }
      if (location === 'bottom-left') {
        cx = this.randomGeometry.int(-200, -x / 2);
        cy = this.randomGeometry.int(200, y / 2);
      }
      if (location === 'bottom-right') {
        cx = this.randomGeometry.int(200, x / 2);
        cy = this.randomGeometry.int(200, y / 2);
      }

      return paper.view.bounds.center.add(cx, cy);
    },
    renderTitleBar: function (x, y) {
      for (let i = 0; i < 4; i++) {
        this.renderBar(x, y);
      }
      this.renderTitle(x, y);
    },
    renderBar: function (x, y) {
      let path = new paper.Path();
      path.strokeColor = this.randomColor();
      path.opacity = this.setting("barOpacity");
      let start = new paper.Point(this.randomGeometry.int(-50, 50), this.randomGeometry.int(y + 100, y - 100));
      path.moveTo(start);
      path.strokeWidth = 200;
      path.lineTo(start.add([this.randomGeometry.int(x * 2 - 100, x * 2), this.randomGeometry.int(-50, 50)]));
    },
    renderTitle: function (x, y) {
      // done: is it possible to support multiple lines with \n or so? Docs don't use the word 'line'.
      // -> this is not possible. We can however add two lines of input, but that's just terrible.
      let title = new paper.PointText(new paper.Point(x, y));
      title.justification = 'center'
      title.content = this.setting("seed_input");
      title.fillColor = 'white';
      title.fontFamily = "aliceregular";
      title.fontSize = 120;
      title.rotate(this.randomGeometry.int(-5, 5));
    },
    renderKaleidoScope: function (location) {
      const NR = 3;

      let center = location;
      let segments = NR * 2;
      let angle = 360 / segments;
      let genSize = 400;

      let triangle = new paper.Path();
      let sizeVec = new paper.Point(0, genSize);

      // paper.js overrides mathematical operators so that you can use Point + Point.
      // This of course does not work when using it inside something else. So use the JS methods instead.
      triangle.add(center);
      triangle.add(center.add(sizeVec.rotate(angle / 2)));
      triangle.add(center.add(sizeVec.rotate(-angle / 2)));
      triangle.fillColor = 'black';
      triangle = this.roundCorners(triangle, 40);

      let tBG = triangle.clone();
      tBG.fillColor = this.randomColor();
      tBG.opacity = this.setting("triangleOpacity");

      let shapes = this.genShapes(triangle);

      let grp = new paper.Group({children: [triangle, tBG].concat(shapes)});
      grp.children.forEach(item => item.blendMode = this.setting('currentBlendMode'));

      grp.clipped = true;
      grp.translate([0, 10]);

      this.spread(grp, segments, angle, center);
    },
    genShapes: function (path) {
      // This is more like "DNA" of a thing.

      // todo: add arc (=rainbow!), regularpolygon (triangle, hexagon, octagon)
      let shapes = [];

      for (let i = 0; i < this.setting("kaleidoscope_dna.lines"); i++) {
        shapes.push(this.kaleidoScopeContentLine(path))
      }

      // circles are more expensive in the factory, so they include a little less so they are 'special'
      for (let i = 0; i < this.setting("kaleidoscope_dna.circles"); i++) {
        shapes.push(this.kaleidoScopeContentCircle(path))
      }

      for (let i = 0; i < this.setting("kaleidoscope_dna.hackers"); i++) {
        shapes.push(this.kaleidoScopeContentHacker(path))
      }

      for (let i = 0; i < this.setting("kaleidoscope_dna.custom"); i++) {
        shapes.push(this.kaleidoScopeContentCustomShape(path))
      }

      for (let i = 0; i < this.setting("kaleidoscope_dna.star"); i++) {
        shapes.push(this.kaleidoScopeContentStar(path))
      }

      for (let i = 0; i < this.setting("kaleidoscope_dna.emoji"); i++) {
        shapes.push(this.kaleidoScopeContentEmoji(path))
      }

      return shapes;
    },

    spread: function (grp, segments, angle, center) {
      for (let i = 1; i < segments; i++) {
        let newGrp = grp.clone();
        if (i % 2 === 1) {
          newGrp.scale(-1, 1);
        }
        newGrp.rotate(angle * i, center);
      }
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