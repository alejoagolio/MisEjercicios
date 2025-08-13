// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
function index(x, y, width){
    return y * (width * 4) + x * 4
}

function allowed_colors(factor) {
    let colors = []
    let step = 255 / factor
    for (let i = 0; i <= factor; i++) {
        let value = Math.round(i * step)
        colors.push(value)
    }
    return colors
}

function find_closest_color(actual, allowed_colors) {
    let closest = allowed_colors[0];
    let min_distance = Math.abs(actual - closest)
    for (let i = 1; i < allowed_colors.length; i++) {
        let distance = Math.abs(actual - allowed_colors[i]);
        if (distance < min_distance) {
            min_distance = distance;
            closest = allowed_colors[i];
        }
    }
    return closest;
}

function quantize(pixel, factor) {
    let allowed = allowed_colors(factor);
    let red = find_closest_color(pixel[0], allowed);
    let green = find_closest_color(pixel[1], allowed);
    let blue = find_closest_color(pixel[2], allowed);
    return [red, green, blue, pixel[3]];
}

function add_error(image, x, y, er, eg, eb, algorithm){

    if(algorithm === "floyd-steinberg"){
        let p = index(x+1, y, image.width);
        image.data[p] += er * 7 / 16;
        image.data[p+1] += eg * 7 / 16;
        image.data[p+2] += eb * 7 / 16;
        
        // 3/16 abajo a la izquierda
        p = index(x-1, y+1, image.width);
        image.data[p]     += er * 3 / 16;
        image.data[p+1] += eg * 3 / 16;
        image.data[p+2] += eb * 3 / 16;
        
        // 5/16 abajo
        p = index(x, y + 1, image.width);
        image.data[p] += er * 5 / 16;
        image.data[p+1] += eg * 5 / 16;
        image.data[p+2] += eb * 5 / 16;
        
        // 1/16 abajo a la derecha
        p = index(x+1, y+1, image.width);
        image.data[p] += er * 1 / 16;
        image.data[p+1] += eg * 1 / 16;
        image.data[p+2] += eb * 1 / 16;
    } else {
        let p = index(x+1, y, image.width)
        image.data[p] += er * 7 / 48;
        image.data[p+1] += eg * 7 / 48;
        image.data[p+2] += eb * 7 / 48;

        p = index(x+2, y, image.width)
        image.data[p] += er * 5 / 48;
        image.data[p+1] += eg * 5 / 48;
        image.data[p+2] += eb * 5 / 48;

        p = index(x-2, y+1, image.width)
        image.data[p] += er * 3 / 48;
        image.data[p+1] += eg * 3 / 48;
        image.data[p+2] += eb * 3 / 48;

        p = index(x-1, y+1, image.width)
        image.data[p] += er * 5 / 48;
        image.data[p+1] += eg * 5 / 48;
        image.data[p+2] += eb * 5 / 48;

        p = index(x, y+1, image.width)
        image.data[p] += er * 7 / 48;
        image.data[p+1] += eg * 7 / 48;
        image.data[p+2] += eb * 7 / 48;

        p = index(x+1, y+1, image.width)
        image.data[p] += er * 5 / 48;
        image.data[p+1] += eg * 5 / 48;
        image.data[p+2] += eb * 5 / 48;

        p = index(x+2, y+1, image.width)
        image.data[p] += er * 3 / 48;
        image.data[p+1] += eg * 3 / 48;
        image.data[p+2] += eb * 3 / 48;

        p = index(x-2, y+2, image.width)
        image.data[p] += er * 1 / 48;
        image.data[p+1] += eg * 1 / 48;
        image.data[p+2] += eb * 1 / 48;

        p = index(x-1, y+2, image.width)
        image.data[p] += er * 3 / 48;
        image.data[p+1] += eg * 3 / 48;
        image.data[p+2] += eb * 3 / 48;

        p = index(x, y+2, image.width)
        image.data[p] += er * 5 / 48;
        image.data[p+1] += eg * 5 / 48;
        image.data[p+2] += eb * 5 / 48;

        p = index(x+1, y+2, image.width)
        image.data[p] += er * 3 / 48;
        image.data[p+1] += eg * 3 / 48;
        image.data[p+2] += eb * 3 / 48;

        p = index(x+2, y+2, image.width)
        image.data[p] += er * 1 / 48;
        image.data[p+1] += eg * 1 / 48;
        image.data[p+2] += eb * 1 / 48;
    }
}


function dither(image, factor, algorithm)
{   
    if(algorithm === "floyd-steinberg"){

        for(let i = 0; i < image.height - 1; i++){
            for(let j = 1; j < image.width - 1; j++){
                
                let p = index(j, i, image.width)
                
                const oldr = image.data[p], oldg = image.data[p+1], oldb = image.data[p+2];
                const [nr, ng, nb] = quantize([oldr, oldg, oldb], factor);
                
                const er = oldr - nr;
                const eg = oldg - ng;
                const eb = oldb - nb;
                
                image.data[p] = nr
                image.data[p+1] = ng
                image.data[p+2] = nb
                
                add_error(image, j, i, er, eg, eb, algorithm);
                
            }
        }

        for(let i = 0; i < image.height; i++){
            let p = index(i, 0, image.width)

            let oldr = image.data[p], oldg = image.data[p+1], oldb = image.data[p+2];
            let [nr, ng, nb] = quantize([oldr, oldg, oldb], factor);

            image.data[p] = nr
            image.data[p+1] = ng
            image.data[p+2] = nb

            p = index(i, image.width-1, image.width)

            oldr = image.data[p], oldg = image.data[p+1], oldb = image.data[p+2];
            [nr, ng, nb] = quantize([oldr, oldg, oldb], factor);

            image.data[p] = nr
            image.data[p+1] = ng
            image.data[p+2] = nb
        }

        for(let i = 1; i < image.width - 1; i++){

            let p = index(image.height-1, i, image.width)

            let oldr = image.data[p], oldg = image.data[p+1], oldb = image.data[p+2];
            let [nr, ng, nb] = quantize([oldr, oldg, oldb], factor);

            image.data[p] = nr
            image.data[p+1] = ng
            image.data[p+2] = nb
        }
    
    } else {
        for(let i = 0; i < image.height - 2; i++){
            for(let j = 2; j < image.width - 2; j++){
                
                let p = index(j, i, image.width)
                
                const oldr = image.data[p], oldg = image.data[p+1], oldb = image.data[p+2];
                const [nr, ng, nb] = quantize([oldr, oldg, oldb], factor);
                
                const er = oldr - nr;
                const eg = oldg - ng;
                const eb = oldb - nb;
                
                image.data[p] = nr
                image.data[p+1] = ng
                image.data[p+2] = nb
                
                add_error(image, j, i, er, eg, eb, algorithm);
            }
            
        }
    }
}
        
// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA, imageB, result) {
  const A = imageA.data;
  const B = imageB.data;
  const R = result.data;
  const len = R.length;

  for (let i = 0; i < len; i += 4) {
    R[i] = A[i] - B[i];
    R[i+1] = A[i+1] - B[i+1];
    R[i+2] = A[i+2] - B[i+2]; 
  }
}