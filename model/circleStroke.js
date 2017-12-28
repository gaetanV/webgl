class modelCircleStroke {
    constructor(param) {
 
        var ax, ay, bx, by, cx, cy, dx, dy;
        if (!param.radius) {
            throw "ERROR";
        }
        var numFace = param.numFace || 12;
        var radius = param.radius;
        var stroke = param.stroke + radius || 2 + radius;

        var degreePerFace = (2 * Math.PI) / numFace;

        numFace++;
        this.vertices = [];
        //new Float32Array((numFace)*18);

        this.bufferpos = [
            (numFace) * 3,
            (numFace) * 6
        ];

        var j = 0;
        var i = 1;
        var angle = degreePerFace;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        ax = cos * stroke / 90;
        ay = sin * stroke / 90;
        bx = cos * radius / 90;
        by = sin * radius / 90;

        var c = 0;
        var s = (numFace) * 6;

        for (; i < numFace + 1; i++) {

            angle = degreePerFace * i;
            
            cos = Math.cos(angle);
            sin = Math.sin(angle);

            dx = cos * radius / 90;
            dy = sin * radius / 90;

            cx = cos * stroke / 90;
            cy = sin * stroke / 90;

            // STROKE
            this.vertices[s++] = ax;
            this.vertices[s++] = ay;
            this.vertices[s++] = bx;
            this.vertices[s++] = by;
            this.vertices[s++] = cx;
            this.vertices[s++] = cy;

            this.vertices[s++] = cx;
            this.vertices[s++] = cy;
            this.vertices[s++] = dx;
            this.vertices[s++] = dy;
            this.vertices[s++] = ax;
            this.vertices[s++] = ay;

            // CIRCLE
            this.vertices[c++] = ax;
            this.vertices[c++] = ay;
            this.vertices[c++] = dx;
            this.vertices[c++] = dy;
            this.vertices[c++] = 0;
            this.vertices[c++] = 0;

            ax = dx;
            ay = dy;
            bx = cx;
            by = cy;

        }

        this.collision =`return Math.pow(X - x,2) + Math.pow(Y - y ,2) < ${Math.pow(stroke,2)}`;
    }
}


module.exports  = modelCircleStroke;