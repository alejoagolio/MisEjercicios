// La imagen que tienen que modificar viene en el parámetro image y contiene inicialmente los datos originales
// es objeto del tipo ImageData ( más info acá https://mzl.la/3rETTC6  )
// Factor indica la cantidad de intensidades permitidas (sin contar el 0)
function index(x, y, width){
    let red = y * (width * 4) + x * 4
    return [red, red+1, red+2, red+3]
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


function dither(image, factor, algorithm)
{
    const data_imagea = new Uint8ClampedArray(image.data);
    for(let i = 0; i < image.width - 1; i+=4){
        for(let j = 0; j < image.height - 1; j++){

                

                let oldpixel = index(i,j, image.width)
                oldpixel = [image.data[oldpixel[0]], image.data[oldpixel[1]], image.data[oldpixel[2]], image.data[oldpixel[3]]]
                let newpixel = quantize(oldpixel, factor)
                let error_red = oldpixel[0] - newpixel[0]
                let error_green = oldpixel[1] - newpixel[1]
                let error_blue = oldpixel[2] - newpixel[2]
                let error = (Math.abs(error_red) + Math.abs(error_green) + Math.abs(error_blue)) / 3

                image.data[oldpixel[0]] = newpixel[0]
                image.data[oldpixel[1]] = newpixel[1]
                image.data[oldpixel[2]] = newpixel[2]
                
                let right_pixel = index(i + 4, j, image.width);
                image.data[right_pixel[0]] += error_red * 7 / 16;
                image.data[right_pixel[0] + 1] += error_green * 7 / 16;
                image.data[right_pixel[0] + 2] += error_blue * 7 / 16;

                image.data[right_pixel[0] - 2 + image.width] += error_red * 3 / 16;
                image.data[right_pixel[0] - 2 + image.width + 1] += error_green * 3 / 16;
                image.data[right_pixel[0] - 2 + image.width + 2] += error_blue * 3 / 16;

                image.data[right_pixel[0] - 1 + image.width] += error_red * 5 / 16;
                image.data[right_pixel[0] - 1 + image.width + 1] += error_green * 5 / 16;
                image.data[right_pixel[0] - 1 + image.width + 2] += error_blue * 5 / 16;

                image.data[right_pixel[0] + image.width] += error_red * 1 / 16;
                image.data[right_pixel[0] + image.width + 1] += error_green * 1 / 16;
                image.data[right_pixel[0] + image.width + 2] += error_blue * 1 / 16;
                

        }

        const result = new Uint8ClampedArray(image.data);

        substraction(data_imagea, image.data, result);
}
}

// Imágenes a restar (imageA y imageB) y el retorno en result
function substraction(imageA,imageB,result) 
{
    const len = imageA.data.length;
    for (let i = 0; i < len; i += 4) {
        result[i]     = imageA[i]     - imageB[i];
        result[i + 1] = imageA[i + 1] - imageB[i + 1];
        result[i + 2] = imageA[i + 2] - imageB[i + 2];
    }
}