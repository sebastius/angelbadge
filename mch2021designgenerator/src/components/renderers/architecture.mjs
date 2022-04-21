import paper from 'paper';
import seedrandom from 'seedrandom';
import random from 'random';

export default {

  data: function () {
    return {
      // randomizers, https://www.npmjs.com/package/random
      seedrandom: null,


      randomGeometry: null, // for geometry
      randomizerColor: null, // for color
      randomDNA: null, // for contents of the kaleidoscopes

    }
  },

  props: {
    // The canvas all output is written to. It has the size of the current format.
    rendercanvas: {
      type: Object
    }
  },

  mounted: function () {
    // https://www.npmjs.com/package/random

    this.seedrandom = seedrandom;
    this.randomGeometry = random;
    let seed = this.setting("seed");
    this.randomGeometry.use(this.seedrandom(seed));
    this.randomizerColor = this.randomGeometry.clone(this.seedrandom(seed));
    this.randomDNA = this.randomGeometry.clone(this.seedrandom(seed));
    this.randomContainsHacker = this.randomGeometry.clone(this.seedrandom(seed));

    // this should be done generically to save on code per renderer
    this.$root.$on('rerender', (data) => {
      if (data.renderer === this.name) {
        console.log("rerendering...");

        if (Object.keys(this).includes(data.renderfunction)) {
          this[data.renderfunction]()
        } else {

          this._404(data);

        }
      }
    })
  },

  methods: {
    _404: function (data) {
      // Display a 404 message instead of crashing :)
      let title = new paper.PointText(new paper.Point(this.rendercanvas.width / 2, 60));
      title.justification = 'center'
      title.content = `Method ${data.renderfunction} not found in renderer ${data.renderer}.`;
      title.fillColor = 'red';
      title.fontFamily = "aliceregular";
      title.fontSize = 40;
    },

    reset_randomizers: function () {
      let seed = this.setting("seed");
      this.randomGeometry.use(this.seedrandom(seed));
      this.randomizerColor.use(this.seedrandom(seed));
      this.randomDNA.use(this.seedrandom(seed));
      this.randomContainsHacker.use(this.seedrandom(seed));
    },

    resetColors: function () {
      this.randomColorBuffer = [];
      this.randomColorPointer = 0;
    },

    drawBackground: function () {
      var rect = new paper.Path.Rectangle({
        point: [0, 0],
        size: [this.rendercanvas.width, this.rendercanvas.height],
        selected: false
      });
      // a color picker is possible, so you can see how it looks if you print it on different paper.
      // not yet implemented as this is not a requirement.
      rect.fillColor = 'white';
      rect.sendToBack();
      return rect;
    },
  }

}
