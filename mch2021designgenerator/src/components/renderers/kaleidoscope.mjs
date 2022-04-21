export default {

  methods: {

    getRndPointInPath: function (path) {
      let line = new this.paperScope.Path.Line(this.getRndPointOnPath(path), this.getRndPointOnPath(path))
      return this.getRndPointOnPath(line)
    },

    getRndPointOnPath: function (path) {
      return path.getPointAt(this.randomDNA.float(0, path.length));
    },

    kaleidoScopeContentHacker: function (path) {
      // let's add a hacker image, because well, the image may contain hackers. This hacker image
      // is not free to use, we need an open licensed one. This one will cost money when making merch.
      return this.kaleidoScopeContentShape(
          path,
          "<path d='M38.4,950.4c-2.4,0-4.8,1.2-7.3,3c-2.5,1.8-4.9,4.4-7.1,7.2c-4.4,5.7-7.8,12.9-7.8,18.8c0,4.5,0.9,7,3.2,9.6c-2.4,1.3-5.4,2.8-7.6,4.3c-2.1,1.5-3.5,3.5-5.6,7.6c-3.8,7.3-5.4,13-5.1,17.4c0.3,4.5,2.6,7.7,6.1,9.8c1.6,1,3.5,1.7,5.6,2.3c-3.9,0-7.9,0-11.9,0c-0.5,0-1,0.6-0.9,1.1c0,0.5,0.6,1,1.1,0.9h12v5c0,0.5,0.5,1,1,1H62c0.5,0,1-0.5,1-1v-5h12c0.5,0,1-0.5,1-1s-0.5-1-1-1h-8.9c1.9-0.6,3.5-1.3,4.8-2.3c2.8-2.1,4.2-5.4,4.1-9.8c-0.1-4.4-1.6-10-4.4-17.2c-1.5-4.1-3-6.2-5.1-7.7c-2.8-1.7-5.7-3.1-7.8-4.3c1-1.1,1.8-2.3,2.2-3.5c0.6-1.7,0.7-3.5,0.7-6.1c0-5.9-3.4-13-7.8-18.8c-2.2-2.9-4.6-5.4-7.1-7.2C43.2,951.5,40.7,950.4,38.4,950.4L38.4,950.4z M38,973.4c6.7,0,13.8,1.5,20.3,3.8c0.1,0.7,0.2,1.5,0.2,2.2c0,2.5-0.1,4.1-0.6,5.4c-0.4,1.2-1.1,2.2-2.2,3.3c-4.8,4.7-10.9,8.2-17.8,8.2c-7,0-13.3-4.8-17.3-8.7c-2.1-2.3-2.6-4-2.6-8.3c0-0.8,0.1-1.6,0.2-2.4C25.2,974.6,30.5,973.4,38,973.4z M38,975.3c-6.6,0-13.1,0.9-15,2.8c0,3.8,0,6.2,3.7,11.2c2.5,2.5,6.2,5,11.2,5c5,0,8.7-2.5,11.2-5c3.7-5,3.7-7.5,3.7-11.2C51.1,976.2,44.6,975.3,38,975.3z M15.1,1003.4H61v27H15.1L15.1,1003.4z M15.1,1032.4H61v4H15.1L15.1,1032.4z'/>")
    },

    kaleidoScopeContentCustomShape: function (path) {
      // this might crash, what happens then?
      return this.kaleidoScopeContentShape(path, this.setting("customDNA.path"));
    },

    kaleidoScopeContentEmoji: function (path) {
      // emojis, aka: text. Press F in the chat! Add your speaker names, or emojis.
      // done: is opacity or blendmode an option? -> no, it does not render at all.
      let emoji = new this.paperScope.PointText(this.getRndPointInPath(path));
      emoji.justification = 'center';
      emoji.content = this.setting("customDNA.emoji");
      emoji.fillColor = this.randomColor();
      emoji.fontFamily = "aliceregular";
      emoji.fontSize = 60;
      emoji.data.notblendable = true;
      emoji.location = this.getRndPointInPath(path);
      emoji.rotate(this.randomDNA.int(0, 359));
      return emoji;
    },

    kaleidoScopeContentShape: function (path, shape_path) {
      let shape = this.paperScope.project.importSVG(shape_path);

      shape.position = this.getRndPointInPath(path);
      shape.fillColor = this.randomColor();
      shape.opacity = this.setting("lineOpacity");
      shape.rotate(this.randomDNA.int(0, 359));

      return shape;
    },

    kaleidoScopeSpecialHacker: function (path) {
      let shape_path = "<path d='M38.4,950.4c-2.4,0-4.8,1.2-7.3,3c-2.5,1.8-4.9,4.4-7.1,7.2c-4.4,5.7-7.8,12.9-7.8,18.8c0,4.5,0.9,7,3.2,9.6c-2.4,1.3-5.4,2.8-7.6,4.3c-2.1,1.5-3.5,3.5-5.6,7.6c-3.8,7.3-5.4,13-5.1,17.4c0.3,4.5,2.6,7.7,6.1,9.8c1.6,1,3.5,1.7,5.6,2.3c-3.9,0-7.9,0-11.9,0c-0.5,0-1,0.6-0.9,1.1c0,0.5,0.6,1,1.1,0.9h12v5c0,0.5,0.5,1,1,1H62c0.5,0,1-0.5,1-1v-5h12c0.5,0,1-0.5,1-1s-0.5-1-1-1h-8.9c1.9-0.6,3.5-1.3,4.8-2.3c2.8-2.1,4.2-5.4,4.1-9.8c-0.1-4.4-1.6-10-4.4-17.2c-1.5-4.1-3-6.2-5.1-7.7c-2.8-1.7-5.7-3.1-7.8-4.3c1-1.1,1.8-2.3,2.2-3.5c0.6-1.7,0.7-3.5,0.7-6.1c0-5.9-3.4-13-7.8-18.8c-2.2-2.9-4.6-5.4-7.1-7.2C43.2,951.5,40.7,950.4,38.4,950.4L38.4,950.4z M38,973.4c6.7,0,13.8,1.5,20.3,3.8c0.1,0.7,0.2,1.5,0.2,2.2c0,2.5-0.1,4.1-0.6,5.4c-0.4,1.2-1.1,2.2-2.2,3.3c-4.8,4.7-10.9,8.2-17.8,8.2c-7,0-13.3-4.8-17.3-8.7c-2.1-2.3-2.6-4-2.6-8.3c0-0.8,0.1-1.6,0.2-2.4C25.2,974.6,30.5,973.4,38,973.4z M38,975.3c-6.6,0-13.1,0.9-15,2.8c0,3.8,0,6.2,3.7,11.2c2.5,2.5,6.2,5,11.2,5c5,0,8.7-2.5,11.2-5c3.7-5,3.7-7.5,3.7-11.2C51.1,976.2,44.6,975.3,38,975.3z M15.1,1003.4H61v27H15.1L15.1,1003.4z M15.1,1032.4H61v4H15.1L15.1,1032.4z'/>";
      let shape = this.paperScope.project.importSVG(shape_path);

      shape.position = this.getRndPointInPath(path);
      shape.fillColor = this.randomColor();

      shape.opacity = this.setting("lineOpacity");
      shape.rotate(this.randomDNA.int(0, 359));

      return shape;
    },

    kaleidoScopeContentLine: function (path) {
      let line = new this.paperScope.Path.Line(this.getRndPointOnPath(path), this.getRndPointOnPath(path));
      line.strokeWidth = this.randomDNA.int(15, 25);
      line.strokeColor = this.randomColor();
      line.opacity = this.setting("lineOpacity");
      return line;
    },

    kaleidoScopeContentCircle: function (path) {
      let line = new this.paperScope.Path.Circle(this.getRndPointInPath(path), this.randomDNA.int(3, 10));
      line.strokeWidth = this.randomDNA.int(20, 40);
      line.strokeColor = this.randomColor();
      line.opacity = this.setting("lineOpacity");

      return line;
    },


    kaleidoScopeContentStar: function (path) {
      // This is what makes me happy :)
      // http://paperjs.org/reference/path/#path-star-center-points-radius1-radius2, radius 2 is the points, radius 1 is the depths.
      let line = new this.paperScope.Path.Star(this.getRndPointInPath(path), this.randomDNA.int(5, 8), this.randomDNA.int(20, 25), this.randomDNA.int(10, 15));
      // some stars are filled, others are not :)
      if (this.randomDNA.int(0, 1)) {
        line.fillColor = this.randomColor();
      } else {
        line.strokeWidth = this.randomDNA.int(5, 10);
        line.strokeColor = this.randomColor();
      }
      line.opacity = this.setting("lineOpacity");

      return line;
    },


  }

}
