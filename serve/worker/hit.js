onmessage = ev => {
    ev.data.forEach((d,i)=>{
        if(Math.cos(Math.cos(d*Math.PI))>Math.cos(Math.cos(0.9*Math.PI))){
            
            postMessage(i);
        }
    })

}