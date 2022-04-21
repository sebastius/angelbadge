<style lang="scss">
.checkerboard {
  background-image: url("./assets/checkerboard.png");
  background-repeat: repeat;
}

@font-face {
  font-family: 'aliceregular';
  src: url('./assets/fonts/Saira-Regular.ttf') format('woff');
  font-weight: normal;
  font-style: normal;
}


body, #app {
  font-family: aliceregular, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

}


.modal-content {
  /* Sorry for the terrible CSS, once it worked, 10 minutes later it didn't. */
  background-color: rgba(255, 255, 255, 0.98) !important;
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);
  border-radius: 10px !important;
  border: 0 !important;

  @supports ((-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))) {
    background-color: rgba(255, 255, 255, 0.6) !important;
  }
}

</style>
<style scoped>
.kaleidoprism {
  text-align: center;
}

.ui {
  text-align: left;
}

canvas {

}

.controlbox {
  z-index: 5;
  text-align: left;
  width: 330px;
  position: fixed;
  left: 0;
  top: 0;

  margin-left: 1em;
  margin-top: 1em;
  background-color: rgba(255, 255, 255, 0.3);
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);
  padding: 1em;
  border-radius: 10px;
}

.mainbutton {
  text-align: left;
  margin-top: 10px;
  width: 100%;
}

button:first-of-type {
  margin-top: 0px;
}

.col button {
  font-size: 0.9em;
  width: 100%;
}


</style>

<template>
  <div id="app" class="kaleidoprism">

    <div class="ui">
      <settings :formats="formats" :renderers="renderers" :rendering="rendering" @changed="render()"/>
      <story/>

      <div class="controlbox">
        <b-button variant="success" class="mainbutton" v-b-modal.about>
          🌈 {{ $t('story') }}
        </b-button>

        <b-button variant="success" class="mainbutton" v-b-toggle.sidebar-1>
          🦄 &nbsp; {{ $t('configure') }}
        </b-button>

        <b-button variant="success" class="mainbutton" v-b-modal.renderdetails>
          🎄 {{ $t('inspector') }}
        </b-button>

        <b-container class="mainbutton">
          <b-row cols="3">
            <b-col style="padding-left: 0">
              <b-button variant="secondary" class='controlbutton' @click="downloadSvg()">
                ⬇️️ {{ $t('export_button_SVG') }}
              </b-button>
            </b-col>
            <b-col style="padding-left: 0; padding-right: 0">
              <b-button variant="secondary" class='controlbutton' @click="downloadPNG()">
                ⬇️ {{ $t('export_button_PNG') }}
              </b-button>
            </b-col>
            <b-col style="padding-right: 0">
              <b-button variant="secondary" class='controlbutton' @click="downloadJson()">
                ⬇️ {{ $t('export_button_JSON') }}
              </b-button>
            </b-col>
          </b-row>

        </b-container>

      </div>

    </div>

    <concept_3 :rendercanvas="rendercanvas" :paperScope="defaultPaperScope"></concept_3>

    <canvas :width="rendercanvas.width" :height="rendercanvas.height" id="kaleidoprism"></canvas>

  </div>
</template>

<i18n src="./i18n/app.json5" lang="json5"></i18n>

<script>
// may contain hackers
// Keywords before story: nothing is what it seems, kaleidscope, refractions, certain color palette,
// kaleidoscope = chaos vs order.

// https://en.wikipedia.org/wiki/Kaleidoscope#/media/File:Kaleidoscopes.jpg

// todo: hacker shape without laptop
// todo: will paper understand refractions? Probably: it's a mask with a rotated and flipped layer. This can work.

const paper = require('paper');

import story from './components/story'
import settings from './components/settings'

/**
 * Communicate with renderers using a message bus say what to render to what component.
 */
import concept_3 from './components/renderers/concept_3.vue';

export default {
  name: "App",
  components: {
    story, settings,
    concept_3
  },
  i18n: {},
  data: function () {
    return {
      // This is where the posters and such are rendered too. This scope allows you to create multiple canvasses
      // where you can draw on. Each one is activated in turn, so if you mix and match, paper will draw to the wrong
      // scope. That is why the design element reviewer loads _after_ everything is rendered.
      defaultPaperScope: null,


      rendercanvas: {
        /**
         * This is the current size of the canvas where things are drawn on.
         * Maximum sizes: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
         * */
        width: 1920,
        height: 1080
      },

      /**
       * There are various functions you can call to render something. This way anyone can write their own rendered
       * on the basis of shared settings. We don't support settings-per-renderer. So you'll have to make clear that
       * a specific setting applies to a specific renderer.
       */
      renderers: {
        'concept_1': {
          description: "The first concept rendere with large flowers/kaleidoscopes",
        },
        'concept_2': {
          description: "Second iteration of the renderer"
        },
        'concept_3': {
          description: "Variant with all the content and consistent positions for rendering / consistent colors"
        }
      },

      /**
       * Formats are canvas sizes and a scaling directive. This way the renderer can scale towards the size
       * of what is rendered too. That way a 4K poster will have the same content as a hd-wallpaper or poster.
       */
      formats: {
        '4k-wallpaper': {
          renderfunction: "createWallpaper",
          description: "A 4K version of the wallpaper, full 4K, not the cinema 4k.",
          dimensions: {
            width: 4096,
            height: 2160,
          },
          scale: 0.5,
        },
        'hd-wallpaper': {
          renderfunction: "createWallpaper",
          description: "This is a render for a wallpaper that can be used on a computer (what's a computer)",
          dimensions: {
            width: 1920,
            height: 1080,
          },
          scale: 1,
        },
        'poster': {
          renderfunction: "createPoster",
          description: "The poster will generate an event poster, with current settings. It will have it's own data.",
          dimensions: {
            // Since it's SVG the aspect ratio is the most important bit, set it up as A4 + 3mm bleed.
            width: 2100 + 30,
            height: 2970 + 30,
          },
          scale: 0.7,
        },
        /*
        '404': {
          renderfunction: "404",
          description: "Test for friendly fallback.",
          dimensions: {
            // Since it's SVG the aspect ratio is the most important bit, set it up as A4 + 3mm bleed.
            width: 2100 + 30,
            height: 2970 + 30,
          },
          scale: 0.7,
        }
        */
      },

      // loading state of the UI
      rendering: false,

      canvas: null,
    }
  },
  mounted: function () {
    this.canvas = document.getElementById('kaleidoprism');
    let defaultPaperScope = new paper.PaperScope();
    defaultPaperScope.activate()
    this.defaultPaperScope = defaultPaperScope.setup(this.canvas);
    this.render();
  },
  methods: {
    downloadSvg: function () {
      this.download(
          'data:application/svg;base64,' + btoa(this.defaultPaperScope.project.exportSVG({asString: true})),
          `mch2021_${this.setting('seed')}_${this.canvas.width}x${this.canvas.height}.svg`
      )
    },
    downloadJson: function () {
      this.download(
          'data:application/json;base64,' + btoa(this.defaultPaperScope.project.exportJSON({asString: true})),
          `mch2021_${this.setting('seed')}_${this.canvas.width}x${this.canvas.height}.json`
      )

    },
    downloadPNG: function () {
      this.download(
          this.canvas.toDataURL('image/png'),
          `mch2021_${this.setting('seed')}_${this.canvas.width}x${this.canvas.height}.png`
      )
    },
    download: function (datauri, filename) {
      let aDownloadLink = document.createElement('a');
      aDownloadLink.download = filename
      aDownloadLink.href = datauri;
      aDownloadLink.click();
    },
    cleanCanvas: function () {
      this.defaultPaperScope.project.clear();
    },
    applyFormat: function (format) {
      this.defaultPaperScope.view.viewSize.width = format.dimensions.width;
      this.defaultPaperScope.view.viewSize.height = format.dimensions.height;
      this.rendercanvas.width = format.dimensions.width;
      this.rendercanvas.height = format.dimensions.height;
    },
    render: function () {
      /*
      * Renders the requested format using the desired settings.
      * */
      console.log("Starting rendering")

      /**
       * Known bug: UI updates do not happen when rerendering. Even when everything else is done nextTick
       * and with forceUpdate. This sucks, because the user can now not see the loading state when the
       * image is being rendered. A dirty fix is included below
       */
      this.rendering = true;

      // This is the dirty fix to make sure the ui is updated and you can see something is rendering.
      window.setTimeout(() => {
        this.defaultPaperScope.activate();
        this.cleanCanvas();
        this.applyFormat(this.formats[this.setting("format")]);

        /**
         * Why the nextTick():
         * Resizing the canvas requires a tick. When that has occurred you can actually start drawing in it.
         */
        this.$nextTick(() => {
          let format = this.formats[this.setting("format")]
          this.$root.$emit(
              'rerender',
              {
                'renderer': this.setting('renderer'),
                'renderfunction': format['renderfunction'],
                'format': format,
              }
          )

          this.defaultPaperScope.view.draw();

          // Known bug: there are NO UI updates when rerendering.
          this.rendering = false;
          console.log("Render complete")
        })

      }, 10);


    },
  }
}
</script>
