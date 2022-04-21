<style scoped>
button {
  margin-right: 10px;
}
.download {
  margin-bottom: 20px;
}
</style>

<template>
  <div class="download">
    <b-button variant="secondary" class='controlbutton' @click="downloadSvg()">
      ⬇️ SVG
    </b-button>

    <b-button variant="secondary" class='controlbutton' @click="downloadPNG()">
      ⬇️ PNG
    </b-button>

    <b-button variant="secondary" class='controlbutton' @click="downloadJson()">
      ⬇️ JSON
    </b-button>
  </div>
</template>

<script>
export default {
  props: {
    paperScope: {type: Object},
    canvas: {type: HTMLCanvasElement},
    item_name: {type: String},
  },

  methods: {
    downloadSvg: function () {
      this.download(
          'data:application/svg;base64,' + btoa(this.paperScope.project.exportSVG({asString: true})),
          `mch2021_${this.setting('seed')}_${this.item_name}_${this.canvas.width}x${this.canvas.height}.svg`
      )
    },
    downloadJson: function () {
      this.download(
          'data:application/json;base64,' + btoa(this.paperScope.project.exportJSON({asString: true})),
          `mch2021_${this.setting('seed')}_${this.item_name}_${this.canvas.width}x${this.canvas.height}.json`
      )

    },
    downloadPNG: function () {
      this.download(
          this.canvas.toDataURL('image/png'),
          `mch2021_${this.setting('seed')}_${this.item_name}_${this.canvas.width}x${this.canvas.height}.png`
      )
    },
    download: function (datauri, filename) {
      let aDownloadLink = document.createElement('a');
      aDownloadLink.download = filename
      aDownloadLink.href = datauri;
      aDownloadLink.click();
    },
  }

}
</script>
