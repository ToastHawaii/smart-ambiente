export default function render(
  s: HTMLImageElement | HTMLVideoElement,
  c: HTMLCanvasElement
) {}

var Filters = {};

    Filters.getPixels = function() {
        var c = document.getElementById("canvas");
        var ctx = c.getContext('2d');
        return ctx.getImageData(0, 0, c.width, c.height);
    };

    Filters.putPixels = function(imageData) {
        var c = document.getElementById("canvas");
        var ctx = c.getContext('2d');
        return ctx.putImageData(imageData, 0, 0);
    };

    Filters.filterImage = function(filter, image, var_args) {
        var args = [image];
        for (var i=2; i<arguments.length; i++) {
            args.push(arguments[i]);
        }
        return filter.apply(null, args);
    };

    // While the Day for Night effect has its own function, I left this one here unmodified for reference, since 
    // it's the filter in the HTML5 Rocks article on which the Day for Night filter (see next) is based.
    Filters.grayscale = function(pixels, args) {
        var d = pixels.data;
        for (var i=0; i<d.length; i+=4) {
            var r = d[i];
            var g = d[i+1];
            var b = d[i+2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126*r + 0.7152*g + 0.0722*b;
            d[i] = d[i+1] = d[i+2] = v
        }
        return pixels;
    };

    Filters.dayForNight = function(pixels, adjustment) {
      if (typeof adjustment == 'undefined') adjustment = -30;
      var d = pixels.data;
      // These values serve as thresholds for the darkest and brightest possible values when 
      // applying the 'blue-biased' desaturation. In the for loop below, no single RBG value
      // shall be less than `min` or greater than `max`.
      var min = 0;
      var max = 120;
      for (var i=0; i<d.length; i+=4) {
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        var v = 0.2126*r + 0.07152*g + 0.0722*b;
        d[i]   = Math.max(min, v);
        d[i+1] = Math.max(min, v);
        d[i+2] = Math.max(min, ((0.7 * b) + v) / 2);
        d[i]   = Math.min(max, d[i]);
        d[i+1] = Math.min(max, d[i+1]);
        d[i+2] = Math.min(max, d[i+2]);
      }
      return Filters.brightness(pixels, adjustment);
    };

    Filters.brightness = function(pixels, adjustment) {
        var d = pixels.data;
        for (var i=0; i<d.length; i+=4) {
            d[i] += adjustment;
            d[i+1] += adjustment;
            d[i+2] += adjustment;
        }
        return pixels;
    };

    function drawImage (newWidth, newHeight) {
        if (!Modernizr.canvas) {
            return;
        } else {
            $('#canvas, .canvas_container').width(newWidth).height(newHeight);
            var theCanvas = document.getElementById("canvas");
            theCanvas.width = newWidth;
            theCanvas.height = newHeight;
            var context = theCanvas.getContext("2d");
        }

        var house = new Image();
        house.src = houseImageBase64;
        house.addEventListener('load', eventImageLoaded, false);

        function eventImageLoaded () {
            //var fitWidth = Math.max(newWidth,
            context.drawImage(house, 0, 0, newWidth, newWidth * (house.height / house.width));
            $(document).trigger('clights:imageLoaded')
        }

    }

    $(document).ready(function () {
        drawImage($('#width').val(), $('#height').val());

        $('#resize').on('click', function(event) {
            var w = $('#width').val(), h = $('#height').val();
            drawImage(w, h);
        });

        $('#day-for-night').on('click', function (event) {
            $(document).on('clights:imageLoaded', function() {
                var pixels = Filters.getPixels();
                var adjustment = parseInt($('#adjustment').val());
                var newPixels = Filters.dayForNight(pixels, adjustment);
                Filters.putPixels(newPixels);
                $(this).off('clights:imageLoaded');
            });
            var w = $('#width').val(), h = $('#height').val();
            drawImage(w, h);
        });

        $(document).on('submit', 'form', function (event) {
            event.preventDefault();
        });

    });

var houseImageBase64 ="";