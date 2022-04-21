<style>

.previewcontainer {
  position: relative;
  display: inline-block;
}

.preview .download {
  position: absolute;
  z-index: 10;
  display: block;
}

</style>

<template>
  <div>

    <b-modal ok-only id="renderdetails" size="xl" scrollable @shown="renderDesignItems()" hide-backdrop ok-title="Close">
      <h1 slot="modal-title">{{ $t('render_details') }}</h1>

      <div slot="default">
        <h2>{{ $t('color_usage') }}</h2>
        <table class="table" table-bordered>
          <tr>
            <th>{{ $t('application') }}</th>
            <th>{{ $t('red') }}</th>
            <th>{{ $t('green') }}</th>
            <th>{{ $t('blue') }}</th>
            <th>{{ $t('RGBA') }}</th>
            <th>{{ $t('HTML') }}</th>
            <th>{{ $t('example') }}</th>
          </tr>
          <color label="Background" :color="background_color" :opacity="setting('triangleOpacity')"></color>
          <color label="Font" :color="font_color" :opacity="1"></color>

          <color v-for="(color, index) in palette" :key="index" :label="`Palette Color ${index}`" :color="color"
                 :opacity="setting('lineOpacity')"/>
        </table>

        <h2>{{ $t('fonts') }}</h2>
        <table class="table" table-bordered>
          <tr>
            <th>{{ $t('application') }}</th>
            <th>{{ $t('font_name') }}</th>
            <th>{{ $t('download_and_license') }}</th>
          </tr>
          <tr>
            <td>
              Design titles
            </td>
            <td>
              SairaCondensed-Medium
            </td>
            <td>
              <a href="https://fonts.google.com/specimen/Saira+Condensed" rel="nofollow"
                     target="_blank">Download</a>, OFL
            </td>
          </tr>
          <tr>
            <td>
              Written text
            </td>
            <td>
              Saira-Regular
            </td>
            <td>
              <a href="https://fonts.google.com/specimen/Saira" rel="nofollow" target="_blank">Download</a>, OFL
            </td>
          </tr>
          <tr>
            <td>
              Stencil
            </td>
            <td>
              Saira Stencil One
            </td>
            <td>
              <a href="https://fonts.google.com/specimen/Saira+Stencil+One" rel="nofollow"
                     target="_blank">Download</a>, OFL
            </td>
          </tr>
        </table>


        <h2>{{ $t('design_elements') }}</h2>

        <h3>{{ $t('triangle') }}</h3>
        <!-- todo: being able to add your custom emoji to a triangle, so you can use this as your twitter avatar. -->
        <table class="table">
          <tr>
            <td>
              <div class="previewcontainer">
                <div class="preview">
                  <download :canvas="this.rtriangle.canvas" :paperScope="this.rtriangle.paperScope"
                            item_name="triangle"></download>
                  <canvas id="trianglecanvas"></canvas>
                </div>
              </div>
            </td>
            <td>
              <div class="previewcontainer">
                <div class="preview">
                  <download :canvas="this.rrtriangle.canvas" :paperScope="this.rrtriangle.paperScope"
                            item_name="rotated_triangle"></download>
                  <canvas id="rotatedtrianglecanvas"></canvas>
                </div>
              </div>
            </td>
          </tr>

        </table>


        <h3>{{ $t('title') }}</h3>
        <div class="previewcontainer">
          <div class="preview">
            <download :canvas="this.titleComplete.canvas" :paperScope="this.titleComplete.paperScope"
                      item_name="titleComplete"></download>
            <canvas id="titleComplete"></canvas>
          </div>
        </div>
        <div class="previewcontainer">
          <div class="preview">
            <download :canvas="this.titleBackdrop.canvas" :paperScope="this.titleBackdrop.paperScope"
                      item_name="titleBackdrop"></download>
            <canvas id="titleBackdrop"></canvas>
          </div>
        </div>
        <div class="previewcontainer">
          <div class="preview">
            <download :canvas="this.titleText.canvas" :paperScope="this.titleText.paperScope"
                      item_name="titleText"></download>
            <canvas id="titleText"></canvas>
          </div>
        </div>

        <h3>{{ $t('wallpaper') }}</h3>
        <div class="previewcontainer">
          <div class="preview">
            <download :canvas="this.tilingWallpaper.canvas" :paperScope="this.tilingWallpaper.paperScope"
                      item_name="tilingWallpaper"></download>
            <canvas id="tilingWallpaper"></canvas>
          </div>
        </div>

      </div>
    </b-modal>
  </div>
</template>

<script>
import color from './color'
import download from './download'

const paper = require('paper');

export default {
  components: {color, download},

  props: {
    background_color: {type: Object},
    font_color: {type: Object},
    palette: {type: Array},
    triangle: {type: Object},
    title: {type: Object},
    hexagon: {type: Object},
  },

  data: function () {
    return {
      rtriangle: {
        canvas: null,
        paperScope: null,
      },
      rrtriangle: {
        canvas: null,
        paperScope: null,
      },
      titleBackdrop: {
        canvas: null,
        paperScope: null,
      },
      titleText: {
        canvas: null,
        paperScope: null,
      },
      titleComplete: {
        canvas: null,
        paperScope: null,
      },
      tilingWallpaper: {
        canvas: null,
        paperScope: null,
      }
    }
  },

  methods: {
    renderDesignItems: function () {
      this.paintTriangle();
      this.paintRotatedTriangle();
      this.titles();
      this.wallpaper();
    },

    activate: function (item, canvas_id) {
      // setup the scope for this local item.
      item.paperScope = new paper.PaperScope();
      item.canvas = document.getElementById(canvas_id)
      item.paperScope.setup(item.canvas);
      item.paperScope.activate();
    },
    resizeToObject: function (item, object) {
      // make sure the canvas is cropped to the actual size of the item:
      item.paperScope.view.viewSize.width = object.bounds.width;
      item.paperScope.view.viewSize.height = object.bounds.height;
      item.canvas.width = object.bounds.width;
      item.canvas.height = object.bounds.height;
    },
    draw: function (item, object) {
      this.resizeToObject(item, object)
      // Import the clone in the current scope.
      item.paperScope.project.activeLayer.addChild(object);
    },

    paintTriangle: function () {
      this.activate(this.rtriangle, 'trianglecanvas');

      // Only work on a clone, don't modify a property
      let tri = this.triangle.clone();

      // Increase the size so the PNG is also good enough for print:
      tri.scale(2);

      tri.visible = true;
      tri.bounds.topLeft.x = 0;
      tri.bounds.topLeft.y = 0;


      this.draw(this.rtriangle, tri)
    },

    paintRotatedTriangle: function () {
      this.activate(this.rrtriangle, 'rotatedtrianglecanvas');

      // Only work on a clone, don't modify a property
      let tri = this.triangle.clone();

      // Increase the size so the PNG is also good enough for print:
      tri.scale(2);
      tri.rotate(90);

      tri.visible = true;
      tri.bounds.topLeft.x = 0;
      tri.bounds.topLeft.y = 0;

      this.draw(this.rrtriangle, tri)
    },
    titles: function () {
      // this.title = {boundingbox: boundingbox, textPath: textPath}
      // make sure this support monochrome (aka: cutouts of the text)

      this.activate(this.titleComplete, 'titleComplete');

      // Only work on a clone, don't modify a property
      let boundingbox = this.title.boundingbox.clone();

      // Increase the size so the PNG is also good enough for print:
      boundingbox.scale(2);

      boundingbox.bounds.topLeft.x = 0;
      boundingbox.bounds.topLeft.y = 0;

      this.draw(this.titleComplete, boundingbox)

      // Only work on a clone, don't modify a property
      let textPath = this.title.textPath.clone();

      // Increase the size so the PNG is also good enough for print:
      textPath.scale(2);
      textPath.bounds.topLeft.x = 0;
      textPath.bounds.topLeft.y = 0;
      textPath.bounds.center = boundingbox.bounds.center;
      if (this.setting('kaleidoscope_dna.monochrome')) {
        let z = boundingbox.subtract(textPath);
        boundingbox.remove();
        textPath.remove();
        this.titleComplete.paperScope.project.activeLayer.addChild(z);
      } else {
        this.titleComplete.paperScope.project.activeLayer.addChild(textPath);
      }

      // i don't know why in monochrome boundingbox and textPath are still available...

      // The two other items:
      // add a separate backdrop
      this.activate(this.titleBackdrop, 'titleBackdrop');
      this.draw(this.titleBackdrop, boundingbox.clone());

      // add a separate text
      this.activate(this.titleText, 'titleText');
      let separatetextPath = textPath.clone()
      separatetextPath.bounds.topLeft.x = 0;
      separatetextPath.bounds.topLeft.y = 0;
      this.draw(this.titleText, separatetextPath);
    },
    wallpaper: function () {
      this.activate(this.tilingWallpaper, 'tilingWallpaper');

      let myhex = this.hexagon.clone();
      myhex.bounds.topLeft.x = 0;
      myhex.bounds.topLeft.y = 0;
      myhex.visible = true;

      // Make sure the canvas is the width and height it needs to be to create a wallpaper:
      this.tilingWallpaper.paperScope.view.viewSize.width = myhex.bounds.width * 1.5 + 41;
      this.tilingWallpaper.canvas.width = myhex.bounds.width * 1.5 + 41;

      this.tilingWallpaper.paperScope.view.viewSize.height = myhex.bounds.height + 10;
      this.tilingWallpaper.canvas.height = myhex.bounds.height + 10;

      this.tilingWallpaper.paperScope.project.activeLayer.addChild(myhex);

      // im terrible at math, so this is the poor persons way to do this...
      // @bleeptrack would this work?

      // right down
      let symbol = new this.tilingWallpaper.paperScope.Symbol(myhex.clone());
      symbol.place([myhex.bounds.width*1.299, myhex.bounds.height + 5])

      // right top
      let symbol2 = new this.tilingWallpaper.paperScope.Symbol(myhex.clone());
      symbol2.place([myhex.bounds.width*1.299, - 5])

      // left bottom
      let symbol3 = new this.tilingWallpaper.paperScope.Symbol(myhex.clone());
      symbol3.place([-myhex.bounds.width*0.299, myhex.bounds.height + 5])
      symbol3.selected = true;

      // left top:
      let symbol4 = new this.tilingWallpaper.paperScope.Symbol(myhex.clone());
      symbol4.place([-myhex.bounds.width*0.299, - 5])
      symbol4.selected = true;

    },

  }


}

</script>
<i18n src="./i18n/inspector.json5" lang="json5"></i18n>