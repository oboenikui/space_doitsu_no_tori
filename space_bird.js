(function () {
    var canvas;
    var draft_context;
    var space;
    var currentbirdindex = -1;
    var load = function () {
        canvas = document.getElementById("space");
        var draft_canvas = document.createElement("canvas");
        if (!canvas || !canvas.getContext)
            return false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draft_canvas.width = 1;
        draft_canvas.height = 1;
        draft_context = draft_canvas.getContext("2d");
        var _a = navigator.pointerEnabled ? ["pointerdown", "pointermove", "pointerup", "pointercancel"] :
            (navigator.msPointerEnabled ? ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"] :
                ["mousedown", "mousemove", "mouseup", "mousecancel"]), down = _a[0], move = _a[1], up = _a[2], cancel = _a[3];
        canvas.addEventListener(down, function (e) {
            currentbirdindex = getPointingBird(e);
            if (currentbirdindex != -1) {
                space.birds[currentbirdindex].onPointerDownEvent(e.pageX, e.pageY);
            }
        }, false);
        canvas.addEventListener(move, function (e) {
            if (currentbirdindex != -1) {
                space.birds[currentbirdindex].onPointerMoveEvent(e.pageX, e.pageY);
            }
        }, false);
        canvas.addEventListener(up, function (e) {
            if (currentbirdindex != -1) {
                space.birds[currentbirdindex].onPointerUpEvent();
                currentbirdindex = -1;
            }
        }, false);
        canvas.addEventListener(cancel, function (e) {
            if (currentbirdindex != -1) {
                space.birds[currentbirdindex].onPointerUpEvent();
                currentbirdindex = -1;
            }
        }, false);
        if (!navigator.pointerEnabled && !navigator.msPointerEnabled) {
            canvas.addEventListener("touchstart", function (e) {
                currentbirdindex = getPointingBirdTouch(e);
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerDownEvent(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
                }
            }, false);
            canvas.addEventListener("touchmove", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerMoveEvent(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
                }
            }, false);
            canvas.addEventListener("touchend", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
            canvas.addEventListener("touchcancel", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
        }
        space = new Space(canvas.getContext("2d"), window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", function () {
        if (!canvas || !canvas.getContext)
            return false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (space) {
            space.onSizeChanged(window.innerWidth, window.innerHeight);
        }
    });
    function getPointingBird(e) {
        draft_context.clearRect(0, 0, 1, 1);
        for (var i = space.birds.length - 1; i >= 0; i--) {
            if (!space.birds[i].parhapsInside(e.clientX, e.clientY))
                continue;
            space.birds[i].draw(draft_context, e.clientX, e.clientY);
            var image = draft_context.getImageData(0, 0, 1, 1);
            if (image.data[3] > 0x7F) {
                return i;
            }
        }
        return -1;
    }
    function getPointingBirdTouch(e) {
        draft_context.clearRect(0, 0, 1, 1);
        for (var i = space.birds.length - 1; i >= 0; i--) {
            if (!space.birds[i].parhapsInside(e.targetTouches[0].pageX, e.targetTouches[0].pageY))
                continue;
            space.birds[i].draw(draft_context, e.targetTouches[0].pageX, e.targetTouches[0].pageY);
            var image = draft_context.getImageData(0, 0, 1, 1);
            if (image.data[3] > 0x7F) {
                return i;
            }
        }
        return -1;
    }
    var Space = (function () {
        function Space(context, boardWidth, boardHeight) {
            var _this = this;
            this.move = function () {
                _this.context.setTransform(1, 0, 0, 1, 0, 0);
                var widthScale = _this.board.width / _this.background.width;
                var heightScale = _this.board.height / _this.background.height;
                var sx, sy, sw, sh;
                if (widthScale < heightScale) {
                    sw = _this.board.width / heightScale;
                    sh = _this.background.height;
                    sx = (_this.background.width - sw) / 2;
                    sy = 0;
                }
                else {
                    sw = _this.background.width;
                    sh = _this.board.height / widthScale;
                    sx = 0;
                    sy = (_this.background.height - sh) / 2;
                }
                _this.context.drawImage(_this.background, sx, sy, sw, sh, 0, 0, _this.board.width, _this.board.height);
                for (var i = 0; i < _this.birds.length; i++) {
                    var nv = _this.birds[i];
                    nv.update(Space.TIMEOUT / 1000);
                    for (var j = i + 1; j < _this.birds.length; j++) {
                        var nv2 = _this.birds[j];
                        var overlap = nv.overlap(nv2);
                    }
                    nv.draw(_this.context);
                    if (nv.x < -Space.MAX_RADIUS
                        || nv.x > _this.board.width + Space.MAX_RADIUS
                        || nv.y < -Space.MAX_RADIUS
                        || nv.y > _this.board.height + Space.MAX_RADIUS) {
                        nv.reset();
                    }
                }
                requestAnimationFrame(_this.move);
            };
            this.grabbing_bird = null;
            this.context = context;
            this.board = new Board(boardWidth, boardHeight);
            this.background = new Image();
            this.background.src = Space.BACKGROUND;
            this.background.addEventListener("load", function () {
                _this.startAnimation();
            });
        }
        Space.lerp = function (a, b, f) {
            return (b - a) * f + a;
        };
        Space.randfrange = function (a, b) {
            return this.lerp(a, b, Math.random());
        };
        Space.randsign = function () {
            return Math.random() < 0.5 ? 1 : -1;
        };
        Space.flip = function () {
            return Math.random() < 0.5;
        };
        Space.mag = function (x, y) {
            return Math.sqrt(x * x + y * y);
        };
        Space.clamp = function (x, a, b) {
            return ((x < a) ? a : ((x > b) ? b : x));
        };
        Space.dot = function (x1, y1, x2, y2) {
            return x1 * x2 + y1 + y2;
        };
        Space.pick = function (array) {
            if (array.length == 0)
                return null;
            return array[Math.floor(Math.random() * array.length)];
        };
        Space.pickString = function (array) {
            if (array.length == 0)
                return null;
            return array[Math.floor(Math.random() * array.length)];
        };
        Space.prototype.addView = function (bird) {
            if (!this.birds) {
                this.birds = new Array();
            }
            this.birds[this.birds.length] = bird;
        };
        Space.prototype.removeAllViews = function () {
            this.birds = null;
        };
        Space.prototype.reset = function () {
            this.removeAllViews();
            for (var i = 0; i < Space.NUM_BEANS; i++) {
                var nv = new Bird(this.board);
                this.addView(nv);
                nv.z = i / Space.NUM_BEANS;
                nv.z *= nv.z;
                nv.reset(Space.randfrange(0, this.board.width), Space.randfrange(0, this.board.height));
            }
        };
        Space.prototype.onSizeChanged = function (w, h) {
            this.board.width = w;
            this.board.height = h;
        };
        Space.prototype.stopAnimation = function () {
            if (this.mAnim) {
                window.clearInterval(this.mAnim);
                this.mAnim = 0;
            }
        };
        Space.prototype.startAnimation = function () {
            this.stopAnimation();
            this.reset();
            this.move();
        };
        return Space;
    }());
    Space.NUM_BEANS = 40;
    Space.MIN_SCALE = 0.2;
    Space.MAX_SCALE = 1;
    Space.LUCKY = 0.001;
    Space.MAX_RADIUS = Math.floor(576 * Space.MAX_SCALE);
    Space.TIMEOUT = 17;
    Space.BIRDS = [
        "img/bird1.png"
    ];
    Space.BACKGROUND = "img/background.jpg";
    var Board = (function () {
        function Board(width, height) {
            this.width = width;
            this.height = height;
        }
        return Board;
    }());
    var Bird = (function () {
        function Bird(board) {
            this.board = board;
        }
        Bird.prototype.toString = function () {
            return "<bean (" + Math.round(this.x * 10) / 10 + ", " + Math.round(this.y * 10) / 10 + ") (" + this.w + " x " + this.h + ")>";
        };
        Bird.prototype.pickBird = function (x, y) {
            var _this = this;
            var birdURL = Space.pickString(Space.BIRDS);
            this.image = new Image();
            this.image.src = birdURL;
            this.image.addEventListener("load", function () {
                _this.scale = Space.lerp(Space.MIN_SCALE, Space.MAX_SCALE, _this.z);
                _this.h = _this.image.height;
                _this.w = _this.image.width;
                _this.r = 0.3 * Math.max(_this.h, _this.w) * _this.scale;
                _this.a = (Space.randfrange(0, 360));
                _this.va = Space.randfrange(-30, 30);
                _this.vx = Space.randfrange(-40, 40) * _this.z;
                _this.vy = Space.randfrange(-40, 40) * _this.z;
                var boardh = _this.board.height;
                var boardw = _this.board.width;
                if (!x) {
                    if (Space.flip()) {
                        _this.x = (_this.vx < 0 ? boardw + 2 * _this.r : -_this.r * 4);
                        _this.y = (Space.randfrange(0, boardh - 3 * _this.r) * 0.5 + ((_this.vy < 0) ? boardh * 0.5 : 0));
                    }
                    else {
                        _this.y = (_this.vy < 0 ? boardh + 2 * _this.r : -_this.r * 4);
                        _this.x = (Space.randfrange(0, boardw - 3 * _this.r) * 0.5 + ((_this.vx < 0) ? boardw * 0.5 : 0));
                    }
                }
                else {
                    _this.x = x;
                    _this.y = y;
                }
                _this.radius = Math.sqrt(Math.pow(_this.w * _this.scale, 2) + Math.pow(_this.h * _this.scale, 2)) / 2;
            });
        };
        Bird.prototype.reset = function (x, y) {
            this.pickBird(x, y);
        };
        Bird.prototype.update = function (dt) {
            if (this.grabbed) {
                this.vx = (this.vx * 0.75) + ((this.grabx - this.x) / dt) * 0.25;
                this.x = this.grabx;
                this.vy = (this.vy * 0.75) + ((this.graby - this.y) / dt) * 0.25;
                this.y = this.graby;
            }
            else {
                this.x = (this.x + this.vx * dt);
                this.y = (this.y + this.vy * dt);
                this.a = (this.a + this.va * dt);
            }
            this.radius = Math.sqrt(Math.pow(this.w * this.scale, 2) + Math.pow(this.h * this.scale, 2)) / 2;
        };
        Bird.prototype.overlap = function (other) {
            var dx = (this.x - other.x);
            var dy = (this.y - other.y);
            return Space.mag(dx, dy) - this.r - other.r;
        };
        Bird.prototype.onPointerDownEvent = function (x, y) {
            this.grabbed = true;
            this.grabx_offset = x - this.x;
            this.graby_offset = y - this.y;
            this.grabx = x - this.grabx_offset;
            this.graby = y - this.graby_offset;
            this.va = 0;
        };
        ;
        Bird.prototype.onPointerMoveEvent = function (x, y) {
            this.grabx = x - this.grabx_offset;
            this.graby = y - this.graby_offset;
        };
        ;
        Bird.prototype.onPointerUpEvent = function () {
            this.grabbed = false;
            var a = Space.randsign() * Space.clamp(Space.mag(this.vx, this.vy) * 0.33, 0, 1080);
            this.va = Space.randfrange(a * 0.5, a);
        };
        ;
        Bird.prototype.parhapsInside = function (x, y) {
            return Math.sqrt(Math.pow(x - (this.x + this.w * this.scale / 2), 2) + Math.pow(y - (this.y + this.h * this.scale / 2), 2)) <= this.radius;
        };
        Bird.prototype.draw = function (context, preX, preY) {
            if (preX === void 0) { preX = 0; }
            if (preY === void 0) { preY = 0; }
            context.save();
            // Move registration point to the center of the canvas
            context.translate(this.x + this.w * this.scale / 2 - preX, this.y + this.h * this.scale / 2 - preY);
            // Rotate 1 degree
            context.rotate(Math.PI * this.a / 180);
            // Move registration point back to the top left corner of canvas
            context.translate(-(this.x + this.w * this.scale / 2 - preX), -(this.y + this.h * this.scale / 2 - preY));
            context.drawImage(this.image, this.x - preX, this.y - preY, this.w * this.scale, this.h * this.scale);
            context.restore();
        };
        return Bird;
    }());
    Bird.VMAX = 1000.0;
    Bird.VMIN = 100.0;
    load();
})();
