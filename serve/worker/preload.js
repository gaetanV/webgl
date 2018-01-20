onmessage = ev => {

    var hitpoint = new Float32Array(ev.data);
    for(var i =0; i<ev.data; i++) {
        hitpoint[i] = Math.random();
    }
    postMessage(hitpoint);
}