const programShader = [

    `            
        #extension GL_OES_standard_derivatives : enable
        precision lowp float;
        varying  float pointSize;
        varying  vec4 color;
        varying  vec4 colorExt;
        void main(){
            float r = 0.0, delta = 0.0, alpha = 1.0, mixColor = 1.0;
            float border = 0.65;
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            r = dot(cxy, cxy);
            gl_FragColor =  color;
            if (r>(border)) {
                delta = fwidth(r);
                alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta,r);
                gl_FragColor = colorExt * alpha;
            }
            else {
                cxy = cxy/border;
                r = dot(cxy, cxy);
                delta = fwidth(r);
                mixColor = 1.0 - smoothstep(1.0 - delta, 1.0 + delta,r);
                gl_FragColor =  mix( colorExt,color,mixColor);
            }    
        }
    `,
    `            
        #extension GL_OES_standard_derivatives : enable
        precision lowp float;
        varying  float pointSize;
        varying  vec4 color;
        varying  vec4 colorExt;
        void main(){
            float a = 0.0;
            float r = 0.0, delta = 0.0, alpha = 1.0;
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            r = dot(cxy, cxy);
            delta = fwidth(r);
            alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta,r);
            gl_FragColor = color * alpha;
            
        }
    `
];

class pointCircle {
    
    constructor(canvas,index){
        this.nbPoint = 0;

        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        this.gl.canvas.addEventListener('click',this.click.bind(this));

        this.gl.getExtension('GL_OES_standard_derivatives');
        this.gl.getExtension('OES_standard_derivatives');

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); 
        this.gl.enable(this.gl.BLEND);

        this.point_buffer = this.gl.createBuffer();
        this.color_buffer = this.gl.createBuffer();
        this.size_buffer = this.gl.createBuffer();

        this.mixModelProgram =[
            `
                attribute vec3 vPosition;
                attribute vec4 vRgbaColor;
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
                    color = vRgbaColor;
                    colorExt = vec4(1.0,1.0,1.0,1.0);
                }
            `,
            programShader[index]
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

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.color_buffer);
        var vRgbaColor = this.gl.getAttribLocation(this.modelProgram, "vRgbaColor");
        this.gl.enableVertexAttribArray(vRgbaColor);
        this.gl.vertexAttribPointer(
            vRgbaColor,
            4, 
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

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.color_buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, 
            color, 
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

        this.gl.uniform1i(
            this.gl.getUniformLocation(this.modelProgram, "texture")
           , 0
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
  
}