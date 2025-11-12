// Esta función construye una matriz de transfromación de 3x3 en coordenadas homogéneas 
// utilizando los parámetros de posición, rotación y escala. La estructura de datos a 
// devolver es un arreglo 1D con 9 valores en orden "column-major". Es decir, para un 
// arreglo A[] de 0 a 8, cada posición corresponderá a la siguiente matriz:
//
// | A[0] A[3] A[6] |
// | A[1] A[4] A[7] |
// | A[2] A[5] A[8] |
// 
// Se deberá aplicar primero la escala, luego la rotación y finalmente la traslación. 
// Las rotaciones vienen expresadas en grados. 
function BuildTransform( positionX, positionY, rotation, scale )
{
	let rad = Math.PI / 180;
	rotation = rotation * rad;

	let matriz_escalado = Array(scale, 0, 0, 0, scale, 0, 0, 0, 1);

	let matriz_rotacion = Array(Math.cos(rotation), Math.sin(rotation), 0, Math.sin(rotation) * -1, Math.cos(rotation), 0, 0, 0, 1);

	let matriz_traslacion = Array(1, 0, 0, 0, 1, 0, positionX, positionY, 1);

	let scale_x_rotacion = ComposeTransforms(matriz_escalado, matriz_rotacion);

	let matriz_final = ComposeTransforms(scale_x_rotacion, matriz_traslacion);

	return matriz_final;
}

// Esta función retorna una matriz que resula de la composición de trasn1 y trans2. Ambas 
// matrices vienen como un arreglo 1D expresado en orden "column-major", y se deberá 
// retornar también una matriz en orden "column-major". La composición debe aplicar 
// primero trans1 y luego trans2. 
function ComposeTransforms( trans1, trans2 )
{	
	let fila_1_1 = Array(trans1[0], trans1[3], trans1[6]);
	let fila_2_1 = Array(trans1[1], trans1[4], trans1[7]);
	let fila_3_1 = Array(trans1[2], trans1[5], trans1[8]);

	let columna_1_2 = Array(trans2[0], trans2[1], trans2[2]);
	let columna_2_2 = Array(trans2[3], trans2[4], trans2[5]);
	let columna_3_2 = Array(trans2[6], trans2[7], trans2[8]);

	let matriz_final = Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
	
	for(let i = 0; i < 3; i++){
		for (let j = 0; j < 3; j++){
			matriz_final[j + i * 3] = fila_1_1[i] * columna_1_2[j] + fila_2_1[i] * columna_2_2[j] + fila_3_1[i] * columna_3_2[j];
		}
	}

	return matriz_final;
}