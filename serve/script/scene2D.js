class scene2D {
    
    constructor(canvas){
   
        this.gl = canvas.getContext('experimental-webgl');
        this.gl.canvas.addEventListener('click',this.click.bind(this));

        this.buffer = [];
        this.vertex_buffer = this.gl.createBuffer();

        this.event={
            click : [],
        };

        this.mixModelProgram =[
            `
            attribute vec2 coordinates;

            uniform vec2 u_ratio;
            uniform vec2 u_trans;
            uniform vec2 u_pos;
            uniform vec3 u_color;

            varying lowp vec3 vColor;

            void main(void) {
                float x  = u_pos.x * u_trans.x - 1.0;
                float y  = -(u_pos.y * u_trans.y - 1.0);
                gl_Position = vec4( coordinates.x * u_ratio.x + x   , coordinates.y * u_ratio.y + y  , 0, 1.0);
                vColor = u_color;
            }
            `
            ,
            `
            precision lowp float;
            varying lowp vec3 vColor;

            void   main()
            {
                gl_FragColor = vec4( vColor.x , vColor.y , vColor.z , 1.0);
            }
            `
        ]
    
  
        this.modelProgram = this.gl.createProgram();

        var v1 = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(v1, this.mixModelProgram[0]);
        this.gl.compileShader(v1);
        this.gl.attachShader(this.modelProgram,v1);


        var f1 = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(f1, this.mixModelProgram[1]);
        this.gl.compileShader(f1);
        this.gl.attachShader(this.modelProgram,f1);

        this.gl.linkProgram(this.modelProgram);
        this.gl.useProgram(this.modelProgram);

        this.resize();

        window.addEventListener("resize", ()=>{
            this.resize.call(this);
            this.clear();
            this.draw();
        });

    }

    click(e){
        var x = (e.pageX - this.gl.canvas.offsetLeft);
        var y = (e.pageY - this.gl.canvas.offsetTop);
        this.event.click.forEach((a)=>{
            if(a[2](a[0],a[1],x,y)){a[3]();}
        })
    }

    drawBuffer(buffer){
      
        this.buffer = buffer;
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, 
            new Float32Array(buffer.vertices), 
            this.gl.STATIC_DRAW
        );
        var model_coord = this.gl.getAttribLocation(this.modelProgram, "coordinates");

        this.gl.vertexAttribPointer(
             model_coord,
             2, 
             this.gl.FLOAT, 
             false,
             0,
             0
        );

        this.gl.enableVertexAttribArray(model_coord);
        this.draw();
    }

    draw(){
        if(!this.buffer.position) { return ;}

        this.event={
            click: [],
        }

        var posLoc = this.gl.getUniformLocation(this.modelProgram, "u_pos");
        var colorLoc = this.gl.getUniformLocation(this.modelProgram, "u_color");

        var a;
        var b;
        var c;

        for(var i =0; i< this.buffer.position.length; i++){

            this.gl.uniform2fv(posLoc,[this.buffer.position[i][0], this.buffer.position[i][1]]);
            
            if(this.buffer.event[i]){
                this.event.click.push(
                    [
                        this.buffer.position[i][0],
                        this.buffer.position[i][1],
                        this.buffer.collision[this.buffer.model[i]],
                        this.buffer.event[i]
                    ]);
            }

            var modelPos = this.buffer.bufferPos[this.buffer.model[i]];
            var a = modelPos[0];
            var b = modelPos[1][0];

            this.gl.uniform3fv(
                colorLoc,
                [
                    this.buffer.color3[i][0],
                    this.buffer.color3[i][1],
                    this.buffer.color3[i][2]
                ]
            );

            this.gl.drawArrays(this.gl.TRIANGLES, a,b);

            for(var j= 1 ; j< modelPos.length ; j++){
                a = a + b;
                b = modelPos[1][j];
                c = j*3;
                
                this.gl.uniform3fv(
                    colorLoc,
                    [
                        this.buffer.color3[i][c],
                        this.buffer.color3[i][c+1],
                        this.buffer.color3[i][c+2]
                    ]
                );
                this.gl.drawArrays(this.gl.TRIANGLES, a,b);
            }
        }
    }

    resize(){
        this.gl.canvas.width = this.gl.canvas.offsetWidth;
        this.gl.canvas.height = this.gl.canvas.offsetHeight;
        this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height);
      
        var t= 130/this.gl.canvas.width;

        this.gl.uniform2fv(
            this.gl.getUniformLocation(this.modelProgram, "u_ratio"),
             [
                 t,
                 this.gl.canvas.width/this.gl.canvas.height*t
             ]
        );
        this.gl.uniform2fv(
            this.gl.getUniformLocation(this.modelProgram, "u_trans"),
            [
                2/this.gl.canvas.width, 
                2/this.gl.canvas.height
            ]
        );
    }

    clear(){
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    destroy(){
        this.event={
            click: [],
        }
        this.gl.deleteBuffer(this.vertex_buffer);
        this.gl.useProgram(null);
        this.gl.deleteProgram(this.modelProgram);
    }

}