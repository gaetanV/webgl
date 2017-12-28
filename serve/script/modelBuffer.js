class modelBuffer{
    constructor(){
        
        this.position = [];
        this.model = [];
        this.color3 = [];
        this.angle = [];
        this.collision = [];

        this.vertices = [];
        this.event = [];
        this.bufferPos = [];
        
    }

    load(model){
        this.bufferPos.push([this.vertices.length/2,model.bufferpos]);
        this.vertices = this.vertices.concat(model.vertices);
        this.collision.push(eval(`
                (
                (x,y,X,Y) => { ${model.collision } }
                )
            `));
        return this.bufferPos.length-1;
    }
    
    transform(modelId,param){
        this.position.push([param.x,param.y]);
        this.model.push(modelId);
        this.color3.push(param.color3.map(a=>a/255));
        this.angle.push(param.angle);
        this.event.push(param.event.click||false);
    }
}
