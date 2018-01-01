class bufferPoint{
    constructor(max){
        
        this.size = new Float32Array(max);
        this.color = new Float32Array(max*4);
        this.point = new Float32Array(max*3);

        this.c = 0;
        this.p = 0;
        this.s = 0;
    }

    addCircle(x,y,size,color){

        this.point[this.p++] = x;
        this.point[this.p++] = y;
        this.point[this.p++] = 1.0;

        this.color[this.c++] = color[0]/255;
        this.color[this.c++] = color[1]/255;
        this.color[this.c++] = color[2]/255;
        this.color[this.c++] = 1.0;

        this.size[this.s++] = size;

    }
}