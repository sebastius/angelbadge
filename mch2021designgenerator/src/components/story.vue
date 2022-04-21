<style scoped lang="scss">

h1, h2, h3, #about, p {
  font-family: aliceregular, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.designstory_modal p, .designstory_modal li {
  text-align: justify;
  text-justify: inter-word;
}
</style>

<template>
  <div>
    <b-modal ok-only id="about" size="xl" scrollable hide-backdrop ok-title="Close">
      <h1 slot="modal-title">{{ $t('title') }}</h1>
      <div slot="default">
        <b-container>
          <b-row  cols="1" cols-md="2">
            <b-col class="designstory_modal">

              <h2>A kaleidoscope of hackers</h2>
              <p>The hacker ethics are defined in multiple places, but here, we wanted to use them as described by Steven
                Levy and <a href="https://www.ccc.de/en/hackerethics" target="_blank" rel="nofollow">use the additions from the CCC</a>.</p>

              <ul>
                <li>Access to computers - and anything which might teach you something about the way the world really
                  works - should be unlimited and total. Always yield to the Hands-On Imperative!
                </li>
                <li>All information should be free.</li>
                <li>Mistrust authority - promote decentralization.</li>
                <li>Hackers should be judged by their acting, not bogus criteria such as degrees, age, race, or
                  position.
                </li>
                <li>You can create art and beauty on a computer.</li>
                <li>Computers can change your life for the better.</li>
                <li>Don't litter other people's data.</li>
                <li>Make public data available, protect private data.</li>
              </ul>

              <p>The definition of those ethics change a bit over time. Some become less important as resources became
                available. There are a bit more computers around than the 5 that were expected by Thomas Watson, IBM
                president, in 1943, and there are way more computers around that Peter Samson and the MIT railroad club
                could have imagined in their wildest dreams in 1958. This makes that 'Access to computers' rings a bit
                different in 2020. And as technology became more available, the range of people who were attracted to
                the hacker scene became wider.</p>

              <p>Although the hacker ethics where written down in another era, with a different state of technology,
                the echo's and reflections of those ethics are still visible by current hackers. We want to fix things
                that are broken or need improvements. We know things get better with a second set of eyeballs on them,
                and that all of us get farther if we can stand on the shoulders of them who were working on this before
                us, and therefore it is almost a sin to not share information. Knowledge is generally shared freely
                between hackers. Authority figures, centralisation and gatekeeping are not considered the best route.
                Hackers should be accepted based on their merits and their potential, not their social background. Some
                of us like to have joke stickers that say 'computers where a mistake', but those stickers are placed on
                devices that help improve their life in ways that weren't imaginable in 1984, when Steven Levy wrote
                them down in his 1984 book Hackers.</p>

              <h2>Create art and beauty on a computer</h2>
              <p>But the best one for the MCH2021 design is, that art and beauty can be made with a computer. Hardly
                anybody needs to be convinced of this statement in the 21th century, especially in the graphics and
                musical department. It is to us to see how we can stretch the limits, and to find the beauty within,
                whether it is in code, electronics, algorithms, digital fabrication, hardware graphics or other
                technological feats.</p>

              <p>The generative kaleidoscopic design, with it's six base colors, electronic traces and mystery hacker,
                show that we can make beauty on a computer.</p>


            </b-col>
            <b-col class="designstory_modal">

              <h2>Surprise hacker</h2>
              <p>
                A camp with a name like "May Contain Hackers 2021" needs a design that reflects that name. But how do
                you display this? It could sound as a warning, with a warning triangle.
                But the 'May' can also mean that there may or may not be a hacker. This can be put in a design by using
                generative art as a base. The generative design is based on the SHA hash of the text input, and there is
                a chance a hacker will appear in the resulting graphic.</p>

              <h2>What is a hacker</h2>
              <p>The hacker in this design is a nice restyled icon from thenounproject. But when can anybody be called a hacker?
                It is not a protected title. There are more definitions of who and what a hacker is than that there are
                hackers. But there are a few things those definitions have in common. (At least, the definitions that
                do not come from Hollywood.) They mirror a core set of ideals and an ethical base.</p>

              <p>~ <cite>"[...] it would be to understood that, to qualify as a hack, the feat must be imbued with
                innovation, style, and technical virtuosity."</cite> - Steven Levy, Hackers, 1984</p>

              <h2>Your variants</h2>
              <p>Because the design is generative, a different kaleidoscope can be made for each team, village, project or
                person. The generator is here, and exports are available to SVG, JSON or PNG. It is fun to play with,
                and we love to see your creativity!</p>

              <h2>Hard facts</h2>
              <ul>
                <li>Triangular kaleidoscope grid, infinitely reflecting grid</li>
                <li>Cleared out area for (custom) text</li>
                <li>Generator available</li>
                <li>May or may not contain a hacker</li>
                <li>Colors: 5 base colors (#fa448c, #fec859, #43b5a0, #491d88, #331a38)</li>
                <li>PCB-like traces in the kaleidoscope</li>
                <li>Font: Saira Condensed 400 regular, same thickness as the traces</li>
                <li>Made with paperjs and bootstrapvue</li>
              </ul>

              <h2>Credits</h2>
              <p>
                Algorithms, Drawings: Bleeptrack<br>
                Drawings: Nekolett<br>
                Application, Tailoring: Stitch<br>
                Organiser: Boekenwuurm<br>
              </p>
            </b-col>
          </b-row>
        </b-container>
      </div>


    </b-modal>
  </div>
</template>

<script>
export default {}

</script>
<i18n src="./i18n/story.json5" lang="json5"></i18n>