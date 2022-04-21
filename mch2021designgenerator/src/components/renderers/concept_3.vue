<template>
  <div>
    <inspector
        :background_color="BG_COLOR"
        :font_color="FONT_COLOR"
        :palette="COLOR_PALETTE"
        :triangle="this.triangle"
        :title="this.title"
        :hexagon="this.hexagon"
    />
  </div>
</template>


<script>
import inspector from '../inspector'
import { default as concept } from './concept_3.mjs';

export default {
  ...concept,

  name: "concept_3",
  components: {inspector},

  props: {
    paperScope: {type: Object}
  },
};

</script>