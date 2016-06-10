(() => {
    var canvas: HTMLCanvasElement;
    var draft_canvas: HTMLCanvasElement;
    var space: Space;
    var currentbirdindex = -1;
    window.addEventListener("load", () => {
        canvas = <HTMLCanvasElement>document.getElementById("space");
        draft_canvas = <HTMLCanvasElement>document.createElement("canvas");
        if (!canvas || !canvas.getContext) return false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draft_canvas.width = window.innerWidth;
        draft_canvas.height = window.innerHeight;
        if (navigator.pointerEnabled) {
            canvas.addEventListener("pointerdown", function (e) {
                currentbirdindex = getPointingBird(e);
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerDownEvent(e.pageX, e.pageY);
                }
            }, false);
            canvas.addEventListener("pointermove", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerMoveEvent(e.pageX, e.pageY);
                }
            }, false);
            canvas.addEventListener("pointerup", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
            canvas.addEventListener("pointercancel", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
        } else if (navigator.msPointerEnabled) {
            canvas.addEventListener("MSPointerDown", function (e) {
                currentbirdindex = getPointingBird(e);
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerDownEvent(e.pageX, e.pageY);
                }
            }, false);
            canvas.addEventListener("MSPointerMove", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerMoveEvent(e.pageX, e.pageY);
                }
            }, false);
            canvas.addEventListener("MSPointerUp", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
            canvas.addEventListener("MSPointerCancel", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
        } else {
            canvas.addEventListener("mousedown", function (e) {
                currentbirdindex = getPointingBird(e);
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerDownEvent(e.pageX, e.pageY);
                }
            }, false);
            canvas.addEventListener("mousemove", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerMoveEvent(e.pageX, e.pageY);
                }
            }, false);
            canvas.addEventListener("mouseup", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
            canvas.addEventListener("mousecancel", function (e) {
                if (currentbirdindex != -1) {
                    space.birds[currentbirdindex].onPointerUpEvent();
                    currentbirdindex = -1;
                }
            }, false);
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
    });

    window.addEventListener("resize", () => {
        if (!canvas || !canvas.getContext) return false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draft_canvas.width = window.innerWidth;
        draft_canvas.height = window.innerHeight;
        if (space) {
            space.onSizeChanged(window.innerWidth, window.innerHeight);
        }
    });

    function getPointingBird(e) {
        var draft_context = draft_canvas.getContext("2d");
        draft_context.clearRect(0, 0, canvas.width, canvas.height);
        var i;
        for (i = space.birds.length - 1; i >= 0; i--) {
            space.birds[i].draw(draft_context);
            var image = draft_context.getImageData(e.clientX, e.clientY, 1, 1);
            if (image.data[3] > 0x7F) {
                return i;
            }
        }
        return -1;
    }

    function getPointingBirdTouch(e) {
        var draft_context = draft_canvas.getContext("2d");
        draft_context.clearRect(0, 0, canvas.width, canvas.height);
        var i;
        for (i = space.birds.length - 1; i >= 0; i--) {
            space.birds[i].draw(draft_context);
            var image = draft_context.getImageData(e.targetTouches[0].pageX, e.targetTouches[0].pageY, 1, 1);
            if (image.data[3] > 0x7F) {
                return i;
            }
        }
        return -1;
    }

    class Space {

        static lerp(a: number, b: number, f: number): number {
            return (b - a) * f + a;
        }

        static randfrange(a: number, b: number): number {
            return this.lerp(a, b, Math.random());
        }

        static randsign(): number {
            return Math.random() < 0.5 ? 1 : -1;
        }

        static flip(): boolean {
            return Math.random() < 0.5;
        }

        static mag(x: number, y: number): number {
            return Math.sqrt(x * x + y * y);
        }

        static clamp(x: number, a: number, b: number): number {
            return ((x < a) ? a : ((x > b) ? b : x));
        }

        static dot(x1: number, y1: number, x2: number, y2: number): number {
            return x1 * x2 + y1 + y2;
        }

        static pick(array: Array<any>): any {
            if (array.length == 0) return null;
            return array[Math.floor(Math.random() * array.length)];
        }

        static pickString(array: Array<string>): string {
            if (array.length == 0) return null;
            return array[Math.floor(Math.random() * array.length)];
        }

        static NUM_BEANS: number = 40;
        static MIN_SCALE: number = 0.2;
        static MAX_SCALE: number = 1;

        static LUCKY: number = 0.001;

        static MAX_RADIUS: number = Math.floor(576 * Space.MAX_SCALE);

        static TIMEOUT: number = 17;
        static BIRDS: Array<string> = [
            "img/bird1.png"
        ];
        static BACKGROUND: string = "img/background.jpg"

        mAnim: number;
        private lastPrint: number;
        public birds: Array<Bird>;
        private background: HTMLImageElement;
        private context: CanvasRenderingContext2D;
        private grabbing_bird;
        public board: Board;

        public constructor(context: CanvasRenderingContext2D, boardWidth: number, boardHeight: number) {
            this.grabbing_bird = null;
            this.context = context;
            this.board = new Board(boardWidth, boardHeight);
            this.background = new Image();
            this.background.src = Space.BACKGROUND;
            this.background.addEventListener("load", () => {
                this.startAnimation();
            })
        }

        private addView(bird: Bird) {
            if (!this.birds) {
                this.birds = new Array<Bird>();
            }
            this.birds[this.birds.length] = bird;
        }

        private removeAllViews() {
            this.birds = null;
        }

        private reset(): void {
            this.removeAllViews();

            for (var i = 0; i < Space.NUM_BEANS; i++) {
                var nv: Bird = new Bird(this.board);
                this.addView(nv);
                nv.z = i / Space.NUM_BEANS;
                nv.z *= nv.z;
                nv.reset(Space.randfrange(0, this.board.width), Space.randfrange(0, this.board.height));
            }
        }

        public onSizeChanged(w: number, h: number): void {
            this.board.width = w;
            this.board.height = h;
        }

        public stopAnimation(): void {
            if (this.mAnim) {
                window.clearInterval(this.mAnim);
                this.mAnim = 0;
            }
        }

        public startAnimation(): void {
            this.stopAnimation();
            this.reset();
            this.mAnim = window.setInterval(() => {
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                var widthScale = this.board.width / this.background.width;
                var heightScale = this.board.height / this.background.height;
                var sx, sy, sw, sh;
                if (widthScale < heightScale) {
                    sw = this.board.width / heightScale;
                    sh = this.background.height;
                    sx = (this.background.width - sw) / 2;
                    sy = 0;
                } else {
                    sw = this.background.width;
                    sh = this.board.height / widthScale;
                    sx = 0;
                    sy = (this.background.height - sh) / 2;
                }
                this.context.drawImage(this.background, sx, sy, sw, sh, 0, 0, this.board.width, this.board.height);
                for (var i = 0; i < this.birds.length; i++) {

                    var nv: Bird = this.birds[i];
                    nv.update(Space.TIMEOUT / 1000);

                    for (var j = i + 1; j < this.birds.length; j++) {
                        var nv2: Bird = this.birds[j];
                        var overlap: number = nv.overlap(nv2);
                    }

                    nv.draw(this.context);

                    if (nv.x < - Space.MAX_RADIUS
                        || nv.x > this.board.width + Space.MAX_RADIUS
                        || nv.y < - Space.MAX_RADIUS
                        || nv.y > this.board.height + Space.MAX_RADIUS) {
                        nv.reset();
                    }

                }

            }, Space.TIMEOUT);
        }
    }

    class Board {
        constructor(public width: number, public height: number) {
        }
    }

    class Bird {
        public static VMAX = 1000.0;
        public static VMIN = 100.0;

        public x: number;
        public y: number;
        public a: number;

        public pivotx: number;
        public pivoty: number;

        public va: number;
        public vx: number;
        public vy: number;

        public r: number;

        public z: number;

        public h: number;
        public w: number;

        public scale: number;
        public grabbed: boolean;
        public grabx: number;
        public graby: number;
        private grabx_offset: number;
        private graby_offset: number;

        private image: HTMLImageElement;

        constructor(private board: Board) {
        }

        public toString(): String {
            return "<bean (" + Math.round(this.x * 10) / 10 + ", " + Math.round(this.y * 10) / 10 + ") (" + this.w + " x " + this.h + ")>";
        }

        private pickBird(x?: number, y?: number): void {
            var birdURL: string = Space.pickString(Space.BIRDS);
            this.image = new Image();
            this.image.src = birdURL;
            this.image.addEventListener("load", () => {
                this.scale = Space.lerp(Space.MIN_SCALE, Space.MAX_SCALE, this.z);

                this.h = this.image.height;
                this.w = this.image.width;

                this.r = 0.3 * Math.max(this.h, this.w) * this.scale;

                this.a = (Space.randfrange(0, 360));
                this.va = Space.randfrange(-30, 30);

                this.vx = Space.randfrange(-40, 40) * this.z;
                this.vy = Space.randfrange(-40, 40) * this.z;
                var boardh = this.board.height;
                var boardw = this.board.width;
                if (!x) {
                    if (Space.flip()) {
                        this.x = (this.vx < 0 ? boardw + 2 * this.r : -this.r * 4);
                        this.y = (Space.randfrange(0, boardh - 3 * this.r) * 0.5 + ((this.vy < 0) ? boardh * 0.5 : 0));
                    } else {
                        this.y = (this.vy < 0 ? boardh + 2 * this.r : -this.r * 4);
                        this.x = (Space.randfrange(0, boardw - 3 * this.r) * 0.5 + ((this.vx < 0) ? boardw * 0.5 : 0));
                    }
                } else {
                    this.x = x;
                    this.y = y;
                }
            });
        }

        public reset(x?: number, y?: number) {
            this.pickBird(x, y);
        }

        public update(dt: number) {
            if (this.grabbed) {
                this.vx = (this.vx * 0.75) + ((this.grabx - this.x) / dt) * 0.25;
                this.x = this.grabx;
                this.vy = (this.vy * 0.75) + ((this.graby - this.y) / dt) * 0.25;
                this.y = this.graby;
            } else {
                this.x = (this.x + this.vx * dt);
                this.y = (this.y + this.vy * dt);
                this.a = (this.a + this.va * dt);
            }
        }

        public overlap(other: Bird): number {
            var dx: number = (this.x - other.x);
            var dy: number = (this.y - other.y);
            return Space.mag(dx, dy) - this.r - other.r;
        }

        public onPointerDownEvent(x: number, y: number) {
            this.grabbed = true;
            this.grabx_offset = x - this.x;
            this.graby_offset = y - this.y;
            this.grabx = x - this.grabx_offset;
            this.graby = y - this.graby_offset;
            this.va = 0;
        };

        public onPointerMoveEvent(x: number, y: number) {
            this.grabx = x - this.grabx_offset;
            this.graby = y - this.graby_offset;
        };

        public onPointerUpEvent() {
            this.grabbed = false;
            var a = Space.randsign() * Space.clamp(Space.mag(this.vx, this.vy) * 0.33, 0, 1080);
            this.va = Space.randfrange(a * 0.5, a);
        };

        public draw(context: CanvasRenderingContext2D) {
            context.save();
            // Move registration point to the center of the canvas
            context.translate(this.x + this.w * this.scale / 2, this.y + this.h * this.scale / 2);
            // Rotate 1 degree
            context.rotate(Math.PI * this.a / 180);
            // Move registration point back to the top left corner of canvas
            context.translate(-(this.x + this.w * this.scale / 2), -(this.y + this.h * this.scale / 2));
            context.drawImage(this.image, this.x, this.y, this.w * this.scale, this.h * this.scale);
            context.restore();
        }
    }
})()