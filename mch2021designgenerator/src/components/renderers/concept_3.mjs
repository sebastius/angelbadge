import opentype from 'opentype.js';
import architecture from './architecture.mjs';
import kaleidoscope from './kaleidoscope.mjs';

export default {
    mixins: [architecture, kaleidoscope],

    data: function () {
        return {
            /**
             * The name of the renderer is stored here, it should match the renderer name in the renderer options.
             */
            name: 'concept_3',

            //could be exposed but maybe we should set them
            genSize: 200,
            space: 10,
            roundingRadius: 10,
            roundTriangles: true,
            backgroundOpacity: 1,

            //do not expose these
            COLOR_PALETTE: null,
            BG_COLOR: null,
            FONT_COLOR: null,
            SEGMENTS: 6,
            ANGLE: 360 / 6,
            CENTER: null,
            symbols: [],
            hexaCopy: null,

            // stuff to send to the inspector:
            triangle: null,
            title: null,
            hexagon: null,

            // matching the design story:
            containshacker: false,
            hacker_occurence_percentage: 70,

            font: "SairaCondensed-Medium.ttf",
        }
    },

    methods: {
        createWallpaper: function () {
            this.generateHexagon();
        },
        createPoster: function () {
            this.generateHexagon();
        },

        shuffle: function (a) {
            for (let i = a.length - 1; i > 0; i--) {
                // Fixed off by one: i was set to i + 1, which can result to out of bound value 5.
                const j = this.randomizerColor.int(0, i);
                [a[i], a[j]] = [a[j], a[i]];
                // console.log({'i': i, 'j': j});
            }
            return a;
        },

        initColors: function () {

            this.reset_randomizers();
            // On multiple lines so the IDE shows them all in the sidebar (and not just 4).
            let my_palette = []
            if (this.setting('useStandardColorPalette')) {
                my_palette = [
                    new this.paperScope.Color('#fa448c'),
                    new this.paperScope.Color('#fec859'),
                    new this.paperScope.Color('#43b5a0'),
                    new this.paperScope.Color('#491d88'),
                    new this.paperScope.Color('#331a38')
                ];

                // Create seeded random version
                this.COLOR_PALETTE = this.shuffle(my_palette);
            } else {
                while (this.randomColorBuffer.length < this.setting("maximumRandomColors")) {
                    let randomcolor = this.generateRandomColor()
                    my_palette.push(randomcolor)
                }
                // the colors are already in random order, as they depend on the randomizer
                this.COLOR_PALETTE = my_palette;
            }

            // Use the last item of the palette as the background color.
            // the rest of the palette can not be the background color:
            // this.COLOR_PALETTE = this.COLOR_PALETTE.slice(0, -1);
            this.BG_COLOR = this.COLOR_PALETTE.pop();
            this.BG_COLOR = '#ffffff';
	    this.FONT_COLOR = this.setting('kaleidoscope_dna.monochrome') ? this.BG_COLOR : this.randomColor();
            // console.log(`Using palette: ${this.COLOR_PALETTE}.`)
            // console.log(`Using background color: ${this.BG_COLOR}.`)
        },
        generateRandomColor: function () {
            // Use a limited number of generated colors. This prevents tons of extra calls to
            // a randomizer, which is pretty slow. It also limits the amount of colors so to have
            // N-color variants.
            if (this.randomColorBuffer.length >= this.setting("maximumRandomColors")) {
                this.randomColorPointer++;
                return this.randomColorBuffer[this.randomColorPointer % this.randomColorBuffer.length];
            }
            let new_color = new this.paperScope.Color(this.randomizerColor.float(), this.randomizerColor.float(), this.randomizerColor.float());
            this.randomColorBuffer.push(new_color);
            // returns a hex color based on the current randomizer state:
            return new_color;
        },
        randomColor: function () {
            // returns a random color from the palette, that is not the background color as that is popped before calling this.
            return this.COLOR_PALETTE[this.randomizerColor.int(0, this.COLOR_PALETTE.length - 1)]
        },
        clearCanvas: function () {
            this.initColors();
            // if there is no H/h then add a hacker, because that's a 82% chance that there will be a hacker. 18.38% of english words use an H/h
            this.containshacker = this.randomContainsHacker.int(1, 100) > this.hacker_occurence_percentage;
            this.symbols = [];
            this.hexaCopy = null;
        },
        generateHexagon: function () {
            this.reset_randomizers();
            this.resetColors();
            this.CENTER = this.paperScope.view.bounds.center;
            this.clearCanvas();

            let triangle = new this.paperScope.Path();
            let sizeVec = new this.paperScope.Point(0, this.genSize);

            triangle.addSegment(this.CENTER);
            triangle.addSegment(this.CENTER.add(sizeVec.rotate(this.ANGLE / 2)));
            triangle.addSegment(this.CENTER.add(sizeVec.rotate(-this.ANGLE / 2)));

            if (this.roundTriangles)
                triangle = this.roundCorners(triangle, this.roundingRadius);

            let triangleCenter = triangle.position;

            let shapes1 = this.genTraces(triangle);

            let grp;
            if (this.setting('kaleidoscope_dna.monochrome')) {

                // they mystery hacker is a very non-rewarding shape in monochrome, it makes the result very chaotic
                // therefore it has not been added to the render.
                // if (this.containshacker && this.setting("kaleidoscope_dna.allow_mystery_hacker")) {
                //    shapes1.push(this.kaleidoScopeSpecialHacker(triangle));
                // }

                grp = new this.paperScope.Group();

                shapes1.forEach(shape => {
                    let tmp = triangle.subtract(shape);
                    triangle.remove();
                    shape.remove();
                    triangle = tmp;
                });
                triangle.fillColor = this.BG_COLOR;
                grp.addChild(triangle);
            } else {
                let tBG = triangle.clone();
                tBG.fillColor = this.BG_COLOR;
                // tBG.strokeColor = "black";
                // tBG.strokeWidth = 2;
                tBG.opacity = this.setting("triangleOpacity");

                let shapes2 = this.genTraces(triangle);

                let additions = this.createBlendableAdditions(triangle);
                grp = new this.paperScope.Group({children: [triangle, tBG].concat(shapes1).concat(shapes2).concat(additions)});
                grp.children.forEach(item => {
                    // done: text removes emojis around the text -> no, that's a rendering bug which does not happen at Normal mode
                    // done: emojis and text is not rendered completely... -> no, same rendering bug, it's not blendable.
                    if (!item.data.notblendable) {
                        item.blendMode = this.setting('currentBlendMode');
                    }
                });

                grp.clipped = true;
            }
            grp.translate([0, this.space]);

            // Create design element for the inspector. If that even works...
            this.triangle = grp.clone();
            this.triangle.visible = false;

            let mainHexagon = this.spread(grp, triangleCenter);
            this.hexaCopy = mainHexagon.clone();
            // to export to the inspector:
            this.hexagon = mainHexagon.clone();
            this.hexagon.visible = false;
            this.hexaCopy.position = [-this.genSize * 3, -this.genSize * 3];
            if (this.setting('kaleidoscope_dna.fillBackground')) {
                mainHexagon = this.fillView(mainHexagon);
                this.setText(mainHexagon, this.setting('seed_input'));
            }

        },

        createBlendableAdditions: function (triangle) {
            let additions = [];

            // First in the order, so the randomizer is first used for the hacker, and then for the rest

            if (this.containshacker) {
                if (this.setting("kaleidoscope_dna.allow_mystery_hacker")) {
                    additions.push(this.kaleidoScopeSpecialHacker(triangle));
                }
            }

            for (let i = 0; i < this.setting("kaleidoscope_dna.traces"); i++) {
                // additions.push(this.genTraces(triangle))
            }

            for (let i = 0; i < this.setting("kaleidoscope_dna.lines"); i++) {
                additions.push(this.kaleidoScopeContentLine(triangle))
            }

            for (let i = 0; i < this.setting('kaleidoscope_dna.custom'); i++) {
                additions.push(this.kaleidoScopeContentCustomShape(triangle));
            }

            for (let i = 0; i < this.setting("kaleidoscope_dna.circles"); i++) {
                additions.push(this.kaleidoScopeContentCircle(triangle))
            }

            for (let i = 0; i < this.setting("kaleidoscope_dna.hackers"); i++) {
                additions.push(this.kaleidoScopeContentHacker(triangle))
            }

            for (let i = 0; i < this.setting("kaleidoscope_dna.star"); i++) {
                additions.push(this.kaleidoScopeContentStar(triangle))
            }

            for (let i = 0; i < this.setting('kaleidoscope_dna.emoji'); i++) {
                additions.push(this.kaleidoScopeContentEmoji(triangle));
            }

            return additions
        },

        setText: function (mainHexagon, text) {
            text = "";
            // do not try to render an empty bounding box.
            if (text === undefined || text === "")
                return

            let cb = (err, font) => {
                let removeLater = [];

                // center text in the collision, so it's always nice and centered. (X driehoekjes is zo breed)
                let fontPath = font.getPath(text, 0, 0, this.genSize * 0.7);
                let textPath = this.paperScope.project.importSVG(fontPath.toSVG());
                textPath.fillColor = this.FONT_COLOR;
                textPath.blendMode = this.setting('currentBlendMode');
                textPath.position.y = mainHexagon.position.y - (this.genSize - this.space) / 2;
                textPath.bounds.topLeft.x = this.randomDNA.int(50, Math.floor(this.paperScope.project.view.bounds.width - textPath.bounds.width - 100));

                // Some part of the text will not intersect with the symbol, because the symbols are large squares.
                // But there is a way to do this: we add an invisible line in the textpath, like a clipping box.
                // that way it intersects very well :)
                // textPath.bounds.topLeft.x
                // make a boundingbox shape based on the bounds of the text:
                let boundingbox = new this.paperScope.Path.Rectangle(textPath.bounds.topLeft, textPath.bounds.bottomRight);
                // Not all triangles get selected, even with the boundingbox approach, which is weird.
                // there also is an isinside, which is happening often
                this.symbols.forEach(symbol => {
                    // symbol.selected = true;
                    if (symbol.intersects(boundingbox) || boundingbox.isInside(symbol.bounds)) {
                        let newCopy = this.hexaCopy.clone();
                        newCopy.position = symbol.position;
                        newCopy.children.forEach(tri => {
                            // tri.children[0].selected = true;
                            if (tri.children[0].intersects(boundingbox) || boundingbox.isInside(tri.bounds)) {
                                removeLater.push(tri);
                            }
                        })
                        symbol.remove();
                    }
                });

                // monochrome does not have a backdrop yet, otherwise the text has to be punched out of the backgdrop.
                this.createBackDrop(removeLater, textPath);


                let animate = this.setting('animate');
                if (animate) {
                    removeLater.forEach(tri => tri.tweenTo({
                        opacity: 0,
                        position: [tri.position.x, 1000],
                        rotation: this.randomDNA.int(-10, 10)
                    }, {duration: this.randomDNA.int(500, 1000)}));
                } else {
                    removeLater.forEach(tri => tri.remove());
                }
                this.hexaCopy.remove();

                //textPath.scale(1.2);
                // Rotate afterwards to make sure only one line of triangles if falling out.
                // textPath.rotate(this.randomDNA.int(-5, 5));
                // textPath.sendToBack();

            };

            if (this.setting('font_sync')) {
                cb(null, opentype.loadSync(`./${this.font}`));
            } else {
                opentype.load(`./${this.font}`, cb);
            }
        },
        createBackDrop: function (items, textPath) {
            // create a single box from all items that are going to be deleted. This
            // will be the backdrop label for the rendered text
            // It seems to be impossible to get the top left of a shape, only the bounding box.??

            let mostLeft = {bounds: {topLeft: {x: 100000000}}}
            let mostRight = {bounds: {topRight: {x: -100000000}}}
            let top = 100000000
            let bottom = -100000000

            // figure out what triangle is the mostleft and mostright
            items.forEach(item => {
                if (item.bounds.topLeft.x < mostLeft.bounds.topLeft.x) {
                    mostLeft = item
                }
                if (item.bounds.topRight.x > mostRight.bounds.topRight.x) {
                    mostRight = item
                }

                // figure out maximum top and bottom positions.
                if (top > item.bounds.topRight.y) {
                    top = item.bounds.topRight.y
                }
                if (bottom < item.bounds.bottomRight.y) {
                    bottom = item.bounds.bottomRight.y
                }
            })

            let leftHalfBottom = 0
            let leftHalfTop = 0
            let rightHalfBottom = 0
            let rightHalfTop = 0
            let half_length = Math.ceil((mostLeft.bounds.topRight.x - mostLeft.bounds.topLeft.x) / 2)

            // figure out the orientation of the most left and right. That's always in relation to its center.
            if (mostLeft.data.direction === "up") {
                leftHalfTop = half_length + 3
                leftHalfBottom = - 3
            } else {
                leftHalfBottom = half_length + 3
                leftHalfTop = - 3
            }

            if (mostRight.data.direction === "up") {
                rightHalfTop = half_length + 3
                rightHalfBottom = -3
            } else {
                rightHalfBottom = half_length + 3
                rightHalfTop = - 3
            }

            let boundingbox = new this.paperScope.Path([
                    new this.paperScope.Point(mostLeft.bounds.left + leftHalfTop, top),
                    new this.paperScope.Point(mostRight.bounds.right - rightHalfTop, top),
                    new this.paperScope.Point(mostRight.bounds.right - rightHalfBottom, bottom),
                    new this.paperScope.Point(mostLeft.bounds.left + leftHalfBottom, bottom)
                ]
            )

            // because it's _impossible_ to get the fillColor of an item, use this.BG_COLOR
            boundingbox.fillColor = this.BG_COLOR;
            // boundingbox.sendToBack();
            textPath.bringToFront();
            // place the text in the center of the boundingbox
            textPath.bounds.center = boundingbox.bounds.center;

            this.roundCorners(boundingbox, this.roundingRadius);

            if (this.setting('kaleidoscope_dna.monochrome')) {
                boundingbox.subtract(textPath);
                boundingbox.remove();
                textPath.remove();
            } else {
                boundingbox.opacity = this.setting("triangleOpacity");
                boundingbox.blendMode = this.setting('currentBlendMode');
            }

            // Export to design element review
            this.title = {boundingbox: boundingbox, textPath: textPath};
        },
        randomPoint: function () {
            // generates a random point on the canvas, with a steady randomizer instead of paper.Point.random.
            // let random = paper.Point.random() // is a random x,y float.
            return new this.paperScope.Point(50,100)
            return new this.paperScope.Point(this.randomGeometry.float(), this.randomGeometry.float())
        },
        fillView: function (hexagon) {
            let offset = this.randomPoint().multiply([-this.genSize, -this.genSize]);
            let symbol = new this.paperScope.Symbol(hexagon);
            let hexaWidthDist = this.genSize * 3 + this.space * 5
            let hexaHeightDist = (hexagon.bounds.height + this.space) / 2
            let lineCount = 0;

            for (let y = offset.y; y < this.paperScope.project.view.bounds.height + hexaHeightDist; y += hexaHeightDist) {
                for (let x = offset.x; x < this.paperScope.project.view.bounds.width + hexaWidthDist; x += hexaWidthDist) {
                    if (lineCount % 2 === 0) {
                        this.symbols.push(symbol.place([x, y]));
                    } else {
                        this.symbols.push(symbol.place([x + hexaWidthDist / 2, y]));
                    }
                }
                lineCount++;
            }
            this.symbols.forEach(sym => sym.opacity = this.backgroundOpacity);
            let mainSymbol = this.symbols[this.randomDNA.int(0, this.symbols.length - 1)];
            while (!this.paperScope.project.view.bounds.contains(mainSymbol.bounds)) {
                mainSymbol = this.symbols[this.randomDNA.int(0, this.symbols.length - 1)];
            }
            mainSymbol.opacity = 1;
            return mainSymbol;
        },
        genTraces: function (path) {
            let shapes = [];
            let timeout = 5;
            let counter = 0
            while (counter < timeout) {
                let newLine = this.setTrace(path);

                while (this.checkIntersection(shapes, newLine) && counter < timeout) {
                    newLine.remove();
                    newLine = this.setTrace(path);
                    counter++;
                }
                if (counter < timeout) {
                    counter = 0;
                    shapes.push(newLine);
                } else {
                    newLine.remove();
                }
            }
            return shapes;
        },
        checkIntersection: function (arr, path) {
            return arr.filter(item => item.intersects(path)).length > 0
        },

        setTrace: function (path) {
            let trace = new this.paperScope.Path.Rectangle([0, 0], [this.genSize / 20, 40]);

            let pL = trace.bounds.topLeft;
            let pR = trace.bounds.topRight;
            trace = this.placeVia(trace, trace.bounds.bottomCenter);

            for (let i = 0; i < this.randomDNA.int(1, 4); i++) {
                [trace, pL, pR] = this.addLineSegment(trace, pL, pR);
            }
            trace = this.placeVia(trace, pL.add(pR.subtract(pL).divide(2)));

            trace.position = this.getRndPointOnPath(path);
            trace.rotate(this.randomDNA.int(0, 4) * 90);
            trace.fillColor = this.randomColor();
            trace.opacity = this.setting("lineOpacity");
            return trace;
        },
        addLineSegment: function (path, posLeft, posRight) {
            let dir = this.randomDNA.int(0, 4);
            let trace = new this.paperScope.Path.Rectangle([0, 0], [this.genSize / 20, 40]);

            trace.bounds.bottomLeft = posLeft;
            let pL = trace.bounds.topLeft;
            let pR = trace.bounds.topRight;

            switch (dir) {
                case 0:
                    path.rotate(45, posRight);
                    break;
                case 1:
                    path.translate([0, -10]);
                    break;
                case 2:
                    path.translate([0, -10]);
                    break;
                case 3:
                    path.rotate(-45, posLeft);
                    break;
            }
            let tmp = trace.unite(path);
            trace.remove();
            path.remove();
            return [tmp, pL, pR];
        },
        placeVia: function (path, pos) {
            let type = this.randomDNA.float(0, 1);
            if (type < 0.3) {
                let via = new this.paperScope.Path.Circle(pos, this.genSize / 20);
                let tmp = path.unite(via);
                via.remove();
                path.remove();
                return tmp;
            } else {
                let via = new this.paperScope.Path.Circle(pos, this.genSize / 20 * 1.5);
                let tmp = path.unite(via);
                via.remove();
                path.remove();
                path = tmp;
                via = new this.paperScope.Path.Circle(pos, this.genSize / 20 * 0.5);
                tmp = path.subtract(via);
                via.remove();
                path.remove();
                return tmp;
            }
        },
        spread: function (grp, triangleCenter) {
            let hexagon = new this.paperScope.Group();
            grp.data = {angle: 0, center: this.CENTER, direction: 'up'}
            hexagon.addChild(grp);
            for (let i = 1; i < this.SEGMENTS; i++) {
                let newGrp = grp.clone();
                if (i % 2 === 1) {
                    newGrp.scale(-1, 1, triangleCenter);
                }
                newGrp.rotate(this.ANGLE * i, this.CENTER);
                newGrp.data = {angle: this.ANGLE * i, center: this.CENTER, direction: i % 2 === 1 ? 'down' : 'up'}
                hexagon.addChild(newGrp);
            }
            // console.log(hexagon.children[1].data['angle']);
            return hexagon;
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
                    new this.paperScope.Segment(
                        curPoint.subtract(prevDelta), null, prevDelta.divide(2)
                    )
                );

                path.add(
                    new this.paperScope.Segment(
                        curPoint.subtract(nextDelta), nextDelta.divide(2), null
                    )
                );
            }
            path.closed = true;
            return path;
        }
    }
}
