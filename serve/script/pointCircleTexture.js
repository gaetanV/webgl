class pointCircleTexture {
    
    constructor(canvas,index){
        this.nbPoint = 0;
        this.texture = [];
        this.gl = canvas.getContext('webgl',{alpha:true,antialias: true}) || canvas.getContext('experimental-webgl',{alpha:true,antialias: true});
        this.gl.canvas.addEventListener('click',this.click.bind(this));

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); 
        this.gl.enable(this.gl.BLEND);

        this.point_buffer = this.gl.createBuffer();
        this.color_buffer = this.gl.createBuffer();
        this.size_buffer = this.gl.createBuffer();

        this.mixModelProgram =[
            `
                attribute vec3 vPosition;
                attribute float vPointSize;

                varying  float pointSize;
                varying  vec4 color;
                varying  vec4 colorExt;
                uniform vec2 u_trans;
                void main(){
                    gl_Position =  vec4(
                        (vPosition.x * u_trans.x) - 1.0,
                        -((vPosition.y * u_trans.y) - 1.0),
                         1.0, 
                         1.0
                    );
                    gl_PointSize = vPointSize;
                }
            `,
            `            
                precision lowp float;
                varying  float pointSize;
        
                uniform sampler2D texture0;
                void main(){
                    gl_FragColor = texture2D(texture0, gl_PointCoord) ;
                }
            `
        ]


        this.modelProgram = this.gl.createProgram();

        var v1 = this.gl.createShader(this.gl.VERTEX_SHADER)
        this.gl.shaderSource(v1, this.mixModelProgram[0]);
        this.gl.compileShader(v1);
        this.gl.attachShader(this.modelProgram, v1);

        var f1 = this.gl.createShader(this.gl.FRAGMENT_SHADER)
        this.gl.shaderSource(f1, this.mixModelProgram[1]);
        this.gl.compileShader(f1);
        this.gl.attachShader(this.modelProgram, f1);
       
        this.gl.linkProgram(this.modelProgram);
     
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.point_buffer);
        var vPosition = this.gl.getAttribLocation(this.modelProgram, "vPosition");
        this.gl.enableVertexAttribArray(vPosition);
        this.gl.vertexAttribPointer(
            vPosition,
            3, 
            this.gl.FLOAT, 
            false,
            0,
            0
        );

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.size_buffer);
        var vPointSize = this.gl.getAttribLocation(this.modelProgram, "vPointSize");
        this.gl.enableVertexAttribArray(vPointSize);
        this.gl.vertexAttribPointer(
            vPointSize,
            1, 
            this.gl.FLOAT, 
            false,
            0,
            0
        );

        this.gl.useProgram(null);

        this.resize();

        window.addEventListener("resize", ()=>{
            this.resize.call(this);
            this.clear();
            this.draw();
        });
        
    }

    drawBuffer(
        point,
        color,
        size
    ){

        this.nbPoint = size.length;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.point_buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, 
            point, 
            this.gl.STATIC_DRAW
        );

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.size_buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, 
            size, 
            this.gl.STATIC_DRAW
        );
        this.draw();
    }

    draw() {
        this.gl.useProgram(this.modelProgram);

        var i=0;

        this.gl.activeTexture(this.gl.TEXTURE0 + i);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture[i]);
        this.gl.uniform1i(
            this.gl.getUniformLocation(this.modelProgram, 'texture' + i)
            , i
        );
        
        this.gl.uniform2fv(
            this.gl.getUniformLocation(this.modelProgram, "u_trans"),
            [
                2/this.gl.canvas.width, 
                2/this.gl.canvas.height
            ]
        );

        this.gl.drawArrays(this.gl.GL_POINTS, 0, this.nbPoint);
    }

    resize() {
        this.gl.canvas.width = this.gl.canvas.offsetWidth;
        this.gl.canvas.height = this.gl.canvas.offsetHeight;
        this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height);
    }

    click(e) {
        console.log("CLICK");
    }

    clear(){
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    }

    destroy() {
        this.gl.clear(this.color_buffer);
        this.gl.clear(this.point_buffer);
        this.gl.clear(this.size_buffer);
        this.gl.useProgram(null);
        this.gl.deleteProgram(this.modelProgram);
    }

    preload(url) {
        return new Promise(resolve => {
            this.loadTexture(this.gl, url).then((t) => {
                this.texture[0] = t;
                resolve();
            });
        });
    }
    
    loadTexture(gl, url) {

        function isPowerOf2(value) {
            return (value & (value - 1)) === 0;
        }

        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => {

                const texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }

                resolve(texture);
            };
            image.src = url;
        });

}
  
}