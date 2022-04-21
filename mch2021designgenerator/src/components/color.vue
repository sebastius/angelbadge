<template>
  <tr>
  <th>
    {{label}}
  </th>
  <td>
    {{color.red.toFixed(5)}}
  </td>
      <td>
    {{color.green.toFixed(5)}}
  </td>
      <td>
    {{color.blue.toFixed(5)}}
  </td>
  <td>
    rgba({{toInt(color.red)}}, {{toInt(color.green)}}, {{toInt(color.blue)}}, {{parseFloat(opacity)}})
  </td>
  <td>
    #{{toHex(color.red)}}{{toHex(color.green)}}{{toHex(color.blue)}}{{toHex(opacity)}}
  </td>
    <td :style="`background-color: rgba(${toInt(color.red)}, ${toInt(color.green)}, ${toInt(color.blue)}, ${parseFloat(opacity)}); width: 40px;`" >
    </td>
  </tr>
</template>

<script>
export default {
name: "color.vue",
  props: {
    color: {type: Object},
    opacity: {type: Number},
    label: {type: String}
  },
  methods: {
    toInt: function(floatValue) {
      return Math.round(255 * floatValue)
    },
    toHex: function(floatValue) {
      return Math.round(255 * floatValue).toString(16);
    }
  }

}
</script>

<style scoped>

</style>