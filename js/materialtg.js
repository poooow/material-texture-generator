/**
 * @author Petr Kratochvila poooow@gmail.com
 */

$(document).ready(function () {

    var numberOfShapes = rand(3,8);
    var shapeSides = 4;

    /**
     *  Handle all actions on page
     */
    $("#random-colors").click(function (event) {
        event.preventDefault();
        randomize();
        cleanInput();
        updateColors();
    });

    $("#random-shapes").click(function (event) {

        event.preventDefault();
        cleanInput();
        updateShapes();
    });

    $('#my-color').on('input', function () {
        myColor($('#my-color').val());
    });

    $("#saturation, #lightness").slider({
        change: updateColors,
        value: 50
    });

    $("#hue").slider({
        change: updateColors,
        range: true,
        values: [0, 360],
        max: 360
    });

    /* Display texture when document loads */
    updateShapes();

    /**
     *  Update color palete only
     */
    function updateColors() {
        var saturation = $("#saturation").slider("value");
        var lightness = $("#lightness").slider("value");
        var hueMin = $("#hue").slider("values", 0);
        var hueMax = $("#hue").slider("values", 1);

        updateValueLabels(saturation, lightness, hueMin, hueMax);
        recolorShapes(saturation, lightness, hueMin, hueMax);
    }

    /**
     * Update shapes only
     */
    function updateShapes() {
        var saturation = $("#saturation").slider("value");
        var lightness = $("#lightness").slider("value");
        var hueMin = $("#hue").slider("values", 0);
        var hueMax = $("#hue").slider("values", 1);
        project.clear();
        generateShapes(saturation, lightness, hueMin, hueMax);
    }

    /**
     *  Update value labels in brackets
     *
     * @param s Saturation
     * @param l Lightness
     * @param hueMin
     * @param hueMax
     */
    function updateValueLabels(s, l, hueMin, hueMax) {
        document.getElementById("saturation-value").innerHTML = "(" + s + ")";
        document.getElementById("lightness-value").innerHTML = "(" + l + ")";
        document.getElementById("hue-value").innerHTML = "(" + hueMin + "," + hueMax + ")";
    }

    function recolorShapes(saturation, lightness, hueMin, hueMax) {
        var children = project.activeLayer.children;
        for (var i = 0; i < children.length; i++) {
            project.activeLayer.children[i].fillColor = getColor(saturation, lightness, hueMin, hueMax);

        }
    }

    /**
     * Generate shapes
     *
     * @param saturation
     * @param lightness
     * @param hueMin Minimal hue value
     * @param hueMax Maximal hue value
     */
    function generateShapes(saturation, lightness, hueMin, hueMax) {
        makeBackground(saturation, lightness, hueMin, hueMax);

        for (var i = 0; i < numberOfShapes; i++) {
            putTriangle(saturation, lightness, hueMin, hueMax);
        }
    }

    /**
     * Background size of canvas with random color from range
     *
     * @param saturation
     * @param lightness
     * @param hueMin
     * @param hueMax
     */
    function makeBackground(saturation, lightness, hueMin, hueMax) {
        var rect = new Path.Rectangle({
            point: [0, 0],
            size: [view.size.width, view.size.height],
            strokeColor: 'white'
        });
        rect.sendToBack();
        rect.fillColor = getColor(saturation, lightness, hueMin, hueMax);
    }

    /**
     * Create new triangle in canvas
     *
     * @param saturation
     * @param lightness
     * @param hueMin
     * @param hueMax
     */
    function putTriangle(saturation, lightness, hueMin, hueMax) {

        // Don't want to put shapes in the center because it would cover to much space
        var paperX = paper.view.size.width;
        var paperY = paper.view.size.height;
        var x = rand(paperX/4,(paperX/4)*3);
        var y = rand(paperY/4,(paperY/4)*3);
        if(x > paperX/2) x = x + paperX/4;
        else x = x - paperX/4;
        if(y > paperY/2) y = y + paperY/4;
        else y = y - paperY/4;

        var shape = new Path.RegularPolygon({
            center: [x, y],
            sides: shapeSides,
            radius: paper.view.size.width/1.8,
            fillColor: getColor(saturation, lightness, hueMin, hueMax),
            shadowColor: new Color(0, 0, 0, 0.7),
            shadowBlur: 10,
            shadowOffset: new Point(rand(-3, 3), rand(-3, 3))
        });
        shape.rotate(rand(0,120));
    }

    /**
     *  Get random integer from min to max
     *
     * @param min
     * @param max
     * @returns {*}
     */
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     *  Get hsl color with given parameters
     *
     * @param saturation
     * @param lightness
     * @param hueMin
     * @param hueMax
     * @returns {string}
     */
    function getColor(saturation, lightness, hueMin, hueMax) {
        return "hsl(" + rand(hueMin, hueMax) + "," + saturation + "%," + lightness + "%)";
    }

    /**
     * Generate random values and set them on sliders
     */
    function randomize() {
        $("#saturation").slider('value', rand(0, 100));
        $("#lightness").slider('value', rand(0, 100));

        var min = rand(0, 360);
        var max = rand(0, 360);

        if (min > max) {
            min = min + max;
            max = min - max;
            min = min - max;
        }

        $("#hue").slider('values', 0, min);
        $("#hue").slider('values', 1, max);
    }

    /**
     *  Clean input array for custom color
     */
    function cleanInput() {
        $("#my-color").val("");
        $("#my-color").removeClass('correct');
    }

    /**
     * Create color palette from given color, maintaining same lightness and saturation
     *
     * @param color  eg. #ddeeff, #def, rgb(255,255,255)
     */
    function myColor(color) {
        var hexPatt = '^#(?:[0-9a-fA-F]{3}){1,2}$';
        var rgbPatt = '^rgb\\(\\s*(0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*,\\s*(0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*,\\s*(0|[1-9]\\d?|1\\d\\d?|2[0-4]\\d|25[0-5])\\s*\\)$';
        var hslColor;

        if (!color.search(hexPatt)) {
            $("#my-color").addClass('correct'); // Mark form input when acceptable format detected
            hslColor = hexToHsl(color);
        } else if (!color.search(rgbPatt)) {
            $("#my-color").addClass('correct'); // Mark form input when acceptable format detected
            var matchColors = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;
            var match = matchColors.exec(color);
            hslColor = rgbToHsl(match[1], match[2], match[3]);
        } else {
            $("#my-color").removeClass('correct');
            return;
        }

        $("#saturation").slider('value', hslColor[1]);
        $("#lightness").slider('value', hslColor[2]);
    }

    /**
     *  Convert hsl color to rgb
     *
     * @param h Hue
     * @param s Saturation
     * @param l Lightness
     * @returns {*[]}  RGB Color values (0-255)
     */
    function hslToRgb(h, s, l) {
        var m1, m2, hue;
        var r, g, b;
        s /= 100;
        l /= 100;
        if (s == 0)
            r = g = b = Math.round(l * 255);
        else {
            if (l <= 0.5)
                m2 = l * (s + 1);
            else
                m2 = l + s - l * s;
            m1 = l * 2 - m2;
            hue = h / 360;
            r = Math.round(HueToRgb(m1, m2, hue + 1 / 3));
            g = Math.round(HueToRgb(m1, m2, hue));
            b = Math.round(HueToRgb(m1, m2, hue - 1 / 3));
        }
        return [r, g, b];
    }

    function HueToRgb(m1, m2, hue) {
        var v;
        if (hue < 0)
            hue += 1;
        else if (hue > 1)
            hue -= 1;

        if (6 * hue < 1)
            v = m1 + (m2 - m1) * hue * 6;
        else if (2 * hue < 1)
            v = m2;
        else if (3 * hue < 2)
            v = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
        else
            v = m1;

        return 255 * v;
    }

    /**
     * Convert hsl color to hex
     *
     * @param h Hue
     * @param s Saturation
     * @param l Lightness
     */

    function hslToHex(h, s, l) {
        var color = hslToRgb(h, s, l);

        color = color.map(function pad(v) {

            v = v.toString(16);
            v.length < 2 ? (v = "0" + v) : v; // Add zero before hex number to keep constant length of hex color string

            return v;
        });

        return color;
    }

    /**
     * returns
     *
     * @param hex string #DDEEFF
     * @returns {Array} of hsl
     */
    function hexToHsl(hex) {
        var r, g, b;

        if (hex.length == 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        } else if (hex.length == 4) {
            r = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
            g = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
            b = parseInt(hex.substring(3, 4) + hex.substring(3, 4), 16);
        }

        return rgbToHsl(r, g, b);
    }

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
    }

});

