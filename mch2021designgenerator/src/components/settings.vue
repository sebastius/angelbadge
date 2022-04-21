<style lang="scss">
.b-sidebar-body, .b-sidebar-header {

  /* Sorry for the terrible CSS, once it worked, 10 minutes later it didn't. */
  background-color: rgba(255, 255, 255, 0.98) !important;
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);

  @supports ((-webkit-backdrop-filter: blur(2em)) or (backdrop-filter: blur(2em))) {
    background-color: rgba(255, 255, 255, 0.6) !important;
  }
}


</style>
<style scoped>

h4 {
  margin-top: 8px;
  font-size: 1.1em;
}

.card {
  margin-bottom: 1em;
}

</style>


<template>
  <div>
    <b-sidebar id="sidebar-1" bg-variant="none" class="configuresidebar" :title="$t('title')" shadow>
      <div class="px-3 py-2">
        <p>{{ $t('explanation') }}</p>
        <hr>
        {{ $t('enter_seed_input') }}:<br>
        <b-input-group>
          <b-input-group-prepend>
            <b-input-group-text style="width:42px;">
              <b-spinner small variant="primary" label="Spinning" v-if="rendering"></b-spinner>
            </b-input-group-text>
          </b-input-group-prepend>
          <b-form-input v-model="settings.seed_input" @update="apply()" :placeholder="$t('enter_seed_input')"
                        debounce="700"></b-form-input>
        </b-input-group>

        <hr>


        <b-card>
          <h3>{{ $t('rendering.title') }}</h3>

          <b-form-checkbox v-model="settings.kaleidoscope_dna.monochrome" switch button-variant="success">
            {{ $t('kaleidoscope_dna.monochrome') }}
          </b-form-checkbox>

          <b-form-checkbox v-model="settings.useStandardColorPalette" switch>
            {{ $t('rendering.use_standard_color_palette') }}
          </b-form-checkbox>

          <template v-if="!settings.useStandardColorPalette">
          <h4>{{ $t('rendering.maximumRandomColors') }}</h4>
          <b-form-spinbutton v-model="settings.maximumRandomColors" min="1"
                             max="100"></b-form-spinbutton>
          </template>

          <h4>{{ $t('rendering.currentBlendMode') }}</h4>
          <b-form-select v-model="settings.currentBlendMode" :options="blendmodes"></b-form-select>


          <h4>{{ $t('rendering.triangleOpacity') }}</h4>
          <b-form-spinbutton v-model="settings.triangleOpacity" min="0" max="1"
                             step="0.1"></b-form-spinbutton>

          <h4>{{ $t('rendering.lineOpacity') }}</h4>
          <b-form-spinbutton id="lineOpacity" v-model="settings.lineOpacity" min="0" max="1"
                             step="0.1"></b-form-spinbutton>

          <!--
          Unused in renderer 3
          <h4>{{ $t('rendering.barOpacity') }}</h4>
          <b-form-spinbutton v-model="settings.barOpacity" min="0" max="1"
                             step="0.1"></b-form-spinbutton>
          -->
          <br>
          <b-button @click="apply()" variant="primary">{{ $t('apply') }}</b-button>
          &nbsp; <b-button v-if="rendering" variant="primary" disabled><b-spinner small></b-spinner><span class="sr-only">Loading...</span></b-button>


        </b-card>

        <b-card>
          <h3>{{ $t('kaleidoscope_dna.title') }}</h3>

          <!--
          For visual consistency it's not possible to remove traces from the design (yet).
          <h4>{{ $t('kaleidoscope_dna.traces') }}</h4>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.traces" min="1" max="100"
                             step="1"></b-form-spinbutton>
                             -->

          <h4>{{ $t('kaleidoscope_dna.lines') }}</h4>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.lines" min="0" max="100"
                             step="1"></b-form-spinbutton>

          <h4>{{ $t('kaleidoscope_dna.circles') }}</h4>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.circles" min="0" max="100"
                             step="1"></b-form-spinbutton>

          <h4>{{ $t('kaleidoscope_dna.hackers') }}</h4>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.hackers" min="0" max="100"
                             step="1"></b-form-spinbutton>

          <h4>{{ $t('kaleidoscope_dna.stars') }}</h4>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.star" min="0" max="100"
                             step="1"></b-form-spinbutton>
          <br>
          <b-form-checkbox v-model="settings.kaleidoscope_dna.allow_mystery_hacker" switch>
            {{ $t('kaleidoscope_dna.allow_mystery_hacker') }}
          </b-form-checkbox>

          <br>
          <b-button @click="apply()" variant="primary">{{ $t('apply') }}</b-button>
          &nbsp; <b-button v-if="rendering" variant="primary" disabled><b-spinner small></b-spinner><span class="sr-only">Loading...</span></b-button>
        </b-card>

        <b-card>
          <h3>{{ $t('kaleidoscope_dna.custom') }}</h3>
          <p>{{ $t('kaleidoscope_dna.custom_explanation') }}</p>

          <h4>{{ $t('kaleidoscope_dna.path') }}</h4>
          <b-input-group>
            <b-input-group-prepend>
              <template v-if="!settings.customDNA.path">
                <b-button @click="settings.customDNA.path = customDNA.example">
                  {{ $t('kaleidoscope_dna.use_example') }}
                </b-button>
              </template>
            </b-input-group-prepend>
            <b-form-input v-model="settings.customDNA.path"
                          :placeholder="customDNA.example"></b-form-input>
          </b-input-group>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.custom" min="0" max="100"
                             step="1"></b-form-spinbutton>
          <small><span style="color: gray"><a href="https://thenounproject.com/search/?q=hacker"
                                              target="_blank" rel="nofollow">{{
              $t('kaleidoscope_dna.inspiration')
            }}</a></span></small>


          <h4>{{ $t('kaleidoscope_dna.emoji') }}</h4>
          <b-form-input v-model="settings.customDNA.emoji" placeholder=""></b-form-input>
          <b-form-spinbutton v-model="settings.kaleidoscope_dna.emoji" min="0" max="100"
                             step="1"></b-form-spinbutton>
          <small><span style="color: gray"><a href="https://emojipedia.org/nature/" target="_blank"
                                              rel="nofollow">{{
              $t('kaleidoscope_dna.inspiration')
            }}</a></span></small>
          <br><br>
          <b-button @click="apply()" variant="primary">{{ $t('apply') }}</b-button>
          &nbsp; <b-button v-if="rendering" variant="primary" disabled><b-spinner small></b-spinner><span class="sr-only">Loading...</span></b-button>
        </b-card>

        <b-card>
          <h3>{{ $t('format.title') }}</h3>
          <b-form-select v-model="settings.format" :options="Object.keys(formats)"></b-form-select>

          <br><br>
          <b-button @click="apply()" variant="primary">{{ $t('apply') }}</b-button>
          &nbsp; <b-button v-if="rendering" variant="primary" disabled><b-spinner small></b-spinner><span class="sr-only">Loading...</span></b-button>

        </b-card>


        <b-card>
          <h3>{{ $t('render_presets.title') }}</h3>
          <p>{{ $t('render_presets.will_override') }}</p>
          <b-form-select v-model="presetsSettingSelected" :options="presetsSetting"></b-form-select>
        </b-card>

        <b-card>
          <h3>{{ $t('user_interface.title') }}</h3>
          <h4>{{ $t('user_interface.language') }}</h4>
          <b-form-select @change="$i18n.locale = settings.language" v-model="settings.language"
                         :options="languages"></b-form-select>
        </b-card>

        <!--
        <b-card>
          <h3>Developer</h3>
          <h4>{{ $t('renderer.title') }}</h4>
          <b-form-select v-model="settings.renderer" :options="Object.keys(renderers)"></b-form-select>

          <b-form-checkbox v-model="settings.kaleidoscope_dna.fillBackground" switch>
            {{ $t('kaleidoscope_dna.fillBackground') }}
          </b-form-checkbox>

          <br><br>
          <b-button @click="apply()" variant="primary">{{ $t('apply') }}</b-button>
          &nbsp; <b-button v-if="rendering" variant="primary" disabled><b-spinner small></b-spinner><span class="sr-only">Loading...</span></b-button>

        </b-card>
        -->


        <b-card>
          <h3>{{ $t('debug.title') }}</h3>
          <p>{{ settings.seed }}</p>
          <h4>{{ $t('debug.development_settings_reset') }}</h4>
          <b-button variant="danger" @click="resetSettings()">
            {{ $t('debug.development_settings_reset') }}
          </b-button>
        </b-card>

      </div>
    </b-sidebar>
  </div>
</template>

<script>

let shajs = require('sha.js');

export default {

  data: function () {
    return {

      // As with other settings for print and such, applying them should not override the input.
      defaultSettings: {
        seed_input: "May Contain Hackers",
        format: "hd-wallpaper",
        renderer: "concept_3",
        seed: "",
        useStandardColorPalette: true,
        maximumRandomColors: 4,
        currentBlendMode: 'normal',
        triangleOpacity: 1,
        lineOpacity: 1,
        barOpacity: 1,
        kaleidoscope_dna: {
          lines: 0, circles: 0, hackers: 0, star: 0, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
        },
        customDNA: {
          // emoji DNA support, so deFEEST can have million poop emojis. And since stages have emoji names...
          emoji: "❤️",
          path: "<path d='M38.4,950.4c-2.4,0-4.8,1.2-7.3,3c-2.5,1.8-4.9,4.4-7.1,7.2c-4.4,5.7-7.8,12.9-7.8,18.8c0,4.5,0.9,7,3.2,9.6c-2.4,1.3-5.4,2.8-7.6,4.3c-2.1,1.5-3.5,3.5-5.6,7.6c-3.8,7.3-5.4,13-5.1,17.4c0.3,4.5,2.6,7.7,6.1,9.8c1.6,1,3.5,1.7,5.6,2.3c-3.9,0-7.9,0-11.9,0c-0.5,0-1,0.6-0.9,1.1c0,0.5,0.6,1,1.1,0.9h12v5c0,0.5,0.5,1,1,1H62c0.5,0,1-0.5,1-1v-5h12c0.5,0,1-0.5,1-1s-0.5-1-1-1h-8.9c1.9-0.6,3.5-1.3,4.8-2.3c2.8-2.1,4.2-5.4,4.1-9.8c-0.1-4.4-1.6-10-4.4-17.2c-1.5-4.1-3-6.2-5.1-7.7c-2.8-1.7-5.7-3.1-7.8-4.3c1-1.1,1.8-2.3,2.2-3.5c0.6-1.7,0.7-3.5,0.7-6.1c0-5.9-3.4-13-7.8-18.8c-2.2-2.9-4.6-5.4-7.1-7.2C43.2,951.5,40.7,950.4,38.4,950.4L38.4,950.4z M38,973.4c6.7,0,13.8,1.5,20.3,3.8c0.1,0.7,0.2,1.5,0.2,2.2c0,2.5-0.1,4.1-0.6,5.4c-0.4,1.2-1.1,2.2-2.2,3.3c-4.8,4.7-10.9,8.2-17.8,8.2c-7,0-13.3-4.8-17.3-8.7c-2.1-2.3-2.6-4-2.6-8.3c0-0.8,0.1-1.6,0.2-2.4C25.2,974.6,30.5,973.4,38,973.4z M38,975.3c-6.6,0-13.1,0.9-15,2.8c0,3.8,0,6.2,3.7,11.2c2.5,2.5,6.2,5,11.2,5c5,0,8.7-2.5,11.2-5c3.7-5,3.7-7.5,3.7-11.2C51.1,976.2,44.6,975.3,38,975.3z M15.1,1003.4H61v27H15.1L15.1,1003.4z M15.1,1032.4H61v4H15.1L15.1,1032.4z'/>",
        },
        animate: true,
      },

      languages: [
        {text: "English", value: "en"},
        {text: "Nederlands", value: "nl"}
      ],

      presetsSettingSelected: this.defaultSettings,
      presetsSetting: [
        {text: 'Standard Settings', value: this.defaultSettings},

        {
          text: 'Monochrome', value: {
            maximumRandomColors: 1,
            currentBlendMode: 'normal',
            useStandardColorPalette: true,
            triangleOpacity: 1,
            kaleidoscope_dna: {
              lines: 0, circles: 0, hackers: 0, star: 0, custom: 0, emoji: 0, monochrome: true, fillBackground: true, allow_mystery_hacker: true
            }
          }
        },

        {
          text: 'Custom Coherent Colors', value: {
            maximumRandomColors: 4,
            currentBlendMode: 'multiply',
            useStandardColorPalette: false,
            triangleOpacity: 1,
            lineOpacity: 0.8,
            barOpacity: 0.8,
            kaleidoscope_dna: {
              lines: 0, circles: 0, hackers: 0, star: 0, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
            }
          }
        },

        {
          text: 'Stars', value: {
            maximumRandomColors: 4,
            currentBlendMode: 'normal',
            useStandardColorPalette: true,
            triangleOpacity: 1,
            lineOpacity: 0.8,
            barOpacity: 0.8,
            kaleidoscope_dna: {
              lines: 0, circles: 0, hackers: 0, star: 20, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
            }
          }
        },

          {
          text: 'Lines', value: {
            maximumRandomColors: 4,
            currentBlendMode: 'normal',
            useStandardColorPalette: true,
            triangleOpacity: 1,
            lineOpacity: 0.8,
            barOpacity: 0.8,
            kaleidoscope_dna: {
              lines: 20, circles: 0, hackers: 0, star: 0, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
            }
          }
        },

        {
          text: 'Usage Benchmark', value: {
            maximumRandomColors: 20,
            currentBlendMode: 'source-over',
            triangleOpacity: 0.1,
            lineOpacity: 0.1,
            barOpacity: 0.1,
            kaleidoscope_dna: {
              lines: 30, circles: 30, hackers: 30, star: 30, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
            }
          }
        },

        {
          text: 'hacker laptop', value: {
            maximumRandomColors: 80,
            currentBlendMode: 'source-over',
            triangleOpacity: 0.8,
            lineOpacity: 0.8,
            barOpacity: 0.8,
            kaleidoscope_dna: {
              lines: 60, circles: 60, hackers: 60, star: 60, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
            }
          }
        },

        // for printing, has a reduced number of colors, no color blending, no transparency
        {
          text: 'print', value: {
            maximumRandomColors: 3,
            currentBlendMode: 'pin-light',
            triangleOpacity: 1,
            lineOpacity: 1,
            barOpacity: 1,
            // DNA has been omitted on purpose, so those settings remain the same,
            // which might be slower, but also easier to revert.
          }
        }
      ],

      // because it is a text input, autogenerate, can only ebe done easily on a direct prop.
      seed_input: "May Contain Hackers",
      settings: {
        seed_input: "May Contain Hackers",
        seed: "",
        useStandardColorPalette: true,
        format: "hd-wallpaper",
        renderer: "concept_3",
        language: 'en',
        maximumRandomColors: 4,
        currentBlendMode: 'normal',
        triangleOpacity: 1,
        lineOpacity: 1,
        barOpacity: 1,
        kaleidoscope_dna: {
          lines: 0, circles: 0, hackers: 0, star: 0, custom: 0, emoji: 0, monochrome: false, fillBackground: true, allow_mystery_hacker: true
        },
        customDNA: {
          // emoji DNA support, so deFEEST can have million poop emojis. And since stages have emoji names...
          emoji: "❤️",
          path: "<path d='M38.4,950.4c-2.4,0-4.8,1.2-7.3,3c-2.5,1.8-4.9,4.4-7.1,7.2c-4.4,5.7-7.8,12.9-7.8,18.8c0,4.5,0.9,7,3.2,9.6c-2.4,1.3-5.4,2.8-7.6,4.3c-2.1,1.5-3.5,3.5-5.6,7.6c-3.8,7.3-5.4,13-5.1,17.4c0.3,4.5,2.6,7.7,6.1,9.8c1.6,1,3.5,1.7,5.6,2.3c-3.9,0-7.9,0-11.9,0c-0.5,0-1,0.6-0.9,1.1c0,0.5,0.6,1,1.1,0.9h12v5c0,0.5,0.5,1,1,1H62c0.5,0,1-0.5,1-1v-5h12c0.5,0,1-0.5,1-1s-0.5-1-1-1h-8.9c1.9-0.6,3.5-1.3,4.8-2.3c2.8-2.1,4.2-5.4,4.1-9.8c-0.1-4.4-1.6-10-4.4-17.2c-1.5-4.1-3-6.2-5.1-7.7c-2.8-1.7-5.7-3.1-7.8-4.3c1-1.1,1.8-2.3,2.2-3.5c0.6-1.7,0.7-3.5,0.7-6.1c0-5.9-3.4-13-7.8-18.8c-2.2-2.9-4.6-5.4-7.1-7.2C43.2,951.5,40.7,950.4,38.4,950.4L38.4,950.4z M38,973.4c6.7,0,13.8,1.5,20.3,3.8c0.1,0.7,0.2,1.5,0.2,2.2c0,2.5-0.1,4.1-0.6,5.4c-0.4,1.2-1.1,2.2-2.2,3.3c-4.8,4.7-10.9,8.2-17.8,8.2c-7,0-13.3-4.8-17.3-8.7c-2.1-2.3-2.6-4-2.6-8.3c0-0.8,0.1-1.6,0.2-2.4C25.2,974.6,30.5,973.4,38,973.4z M38,975.3c-6.6,0-13.1,0.9-15,2.8c0,3.8,0,6.2,3.7,11.2c2.5,2.5,6.2,5,11.2,5c5,0,8.7-2.5,11.2-5c3.7-5,3.7-7.5,3.7-11.2C51.1,976.2,44.6,975.3,38,975.3z M15.1,1003.4H61v27H15.1L15.1,1003.4z M15.1,1032.4H61v4H15.1L15.1,1032.4z'/>",
        }
      },

      // random colors:
      randomColorBuffer: [],
      randomColorPointer: 0,

      blendmodes: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source-over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor'],

      // custom DNA support:
      // this is a fallback / example value
      customDNA: {
        example: "<path d='M38.4,950.4c-2.4,0-4.8,1.2-7.3,3c-2.5,1.8-4.9,4.4-7.1,7.2c-4.4,5.7-7.8,12.9-7.8,18.8c0,4.5,0.9,7,3.2,9.6c-2.4,1.3-5.4,2.8-7.6,4.3c-2.1,1.5-3.5,3.5-5.6,7.6c-3.8,7.3-5.4,13-5.1,17.4c0.3,4.5,2.6,7.7,6.1,9.8c1.6,1,3.5,1.7,5.6,2.3c-3.9,0-7.9,0-11.9,0c-0.5,0-1,0.6-0.9,1.1c0,0.5,0.6,1,1.1,0.9h12v5c0,0.5,0.5,1,1,1H62c0.5,0,1-0.5,1-1v-5h12c0.5,0,1-0.5,1-1s-0.5-1-1-1h-8.9c1.9-0.6,3.5-1.3,4.8-2.3c2.8-2.1,4.2-5.4,4.1-9.8c-0.1-4.4-1.6-10-4.4-17.2c-1.5-4.1-3-6.2-5.1-7.7c-2.8-1.7-5.7-3.1-7.8-4.3c1-1.1,1.8-2.3,2.2-3.5c0.6-1.7,0.7-3.5,0.7-6.1c0-5.9-3.4-13-7.8-18.8c-2.2-2.9-4.6-5.4-7.1-7.2C43.2,951.5,40.7,950.4,38.4,950.4L38.4,950.4z M38,973.4c6.7,0,13.8,1.5,20.3,3.8c0.1,0.7,0.2,1.5,0.2,2.2c0,2.5-0.1,4.1-0.6,5.4c-0.4,1.2-1.1,2.2-2.2,3.3c-4.8,4.7-10.9,8.2-17.8,8.2c-7,0-13.3-4.8-17.3-8.7c-2.1-2.3-2.6-4-2.6-8.3c0-0.8,0.1-1.6,0.2-2.4C25.2,974.6,30.5,973.4,38,973.4z M38,975.3c-6.6,0-13.1,0.9-15,2.8c0,3.8,0,6.2,3.7,11.2c2.5,2.5,6.2,5,11.2,5c5,0,8.7-2.5,11.2-5c3.7-5,3.7-7.5,3.7-11.2C51.1,976.2,44.6,975.3,38,975.3z M15.1,1003.4H61v27H15.1L15.1,1003.4z M15.1,1032.4H61v4H15.1L15.1,1032.4z'/>",
      },
    }
  },
  props: {
    formats: {
      type: Object, required: true
    },
    renderers: {
      type: Object, required: true
    },
    rendering: {
      type: Boolean, required: false, default: false
    }
  },
  watch: {
    presetsSettingSelected: function () {
      this.applySettings(this.presetsSettingSelected);
      this.apply();
    },
  },
  created: function () {
     // The first time the app loads defaultsettings are written
      console.log(this.$store.state.settings.renderer);
      if (this.$store.state.settings === undefined
          || this.$store.state.settings === null || this.$store.state.settings.renderer === undefined){
        console.log('Initializing settings')
        this.resetSettings()
      }

    this.settings = this.$store.state.settings;
    this.$i18n.locale = this.settings.language;
  },
  methods: {
    sha1: function (text) {
      return shajs('sha1').update(text).digest('hex');
    },
    apply: function () {
      this.applySettings(this.settings);
      this.$emit('changed');
    },
    resetSettings: function () {
      this.applySettings({});
    },
    applySettings: function (new_settings) {
      // settings can change over time, and a stored setting object might be incomplete.
      // This method tries to take this incompleteness into account by trying to set things.
      // It will reset the current settings to the default set, and then overwrites them per item.
      let my_settings = {...this.defaultSettings, ...new_settings};
      this.settings = my_settings;
      this.settings.seed = this.sha1(this.settings.seed_input);
      this.$store.commit('set_settings', my_settings);
    },
  }
}

</script>
<i18n src="./i18n/settings.json5" lang="json5"></i18n>