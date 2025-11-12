/* [TODO] Clase Point
Implementar la clase Point con los métodos necesarios para
realizar operaciones vectoriales básicas como suma, multiplicación
por un escalar, división por un escalar, comparación y verificación
de igualdad.
Testear: centroid([ (1,0,0), (0,1,0), (0,0,1) ]) = (1/3,1/3,1/3).
*/
class Point {
  constructor(x = 0.0, y = 0.0, z = 0.0) {
    this.x = x;
    this.y = y;
    this.z = z;

  }

  add(other) {
    return new Point(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  multiply(factor) {
    return new Point(this.x * factor, this.y * factor, this.z * factor);
  }

  divide(factor) {
    return this.multiply(1.0 / factor);
  }

  equals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
  // definimos un orden lexicográfico para los puntos
  lessThan(other) {
    return (this.x < other.x) ||
           (this.x === other.x && this.y < other.y) ||
           (this.x === other.x && this.y === other.y && this.z < other.z);
  }

}

//[TODO] Calcula el centroide de un conjunto de puntos. O sea, el promedio de sus coordenadas.
// Devuelve una instancia de Point.
function centroid(points) {
  let sumx = 0.0;
  let sumy = 0.0;
  let sumz = 0.0;
  for(let i = 0; i < points.length; i++) {
    sumx += points[i].x;
    sumy += points[i].y;
    sumz += points[i].z;
  }
  return new Point(sumx / points.length, sumy / points.length, sumz / points.length);
}

/* [TODO] Clase Edge
Implementar la clase Edge que representa una arista entre dos puntos.
Debe incluir métodos para verificar si un punto pertenece a la arista,
comparar dos aristas y verificar si son iguales.
Además, contiene el atributo mid_edge (punto medio de la arista)
*/
class Edge {
  constructor(aBegin, aEnd) {
    if (aEnd.lessThan(aBegin)) {
    // asegurar que begin es el menor, si no, doy vuelta
    // esto me asegura que (A,B) y (B,A) son la misma arista
      [aBegin, aEnd] = [aEnd, aBegin];
    }
    this.hole_edge = false; // si es borde, ie, una superficie con agujero
    // completar
    this.begin = aBegin;
    this.end = aEnd;
    this.mid_edge = new Point(
      (aBegin.x + aEnd.x) / 2.0,
      (aBegin.y + aEnd.y) / 2.0,
      (aBegin.z + aEnd.z) / 2.0
    );

  }

  contains(point) {
    let AB = new Point(this.end.x - this.begin.x, this.end.y - this.begin.y, this.end.z - this.begin.z);
    let AP = new Point(point.x - this.begin.x, point.y - this.begin.y, point.z - this.begin.z);
    let BP = new Point(point.x - this.end.x, point.y - this.end.y, point.z - this.end.z);
    let cross = new Point(
      AB.y * AP.z - AB.z * AP.y,
      AB.z * AP.x - AB.x * AP.z,
      AB.x * AP.y - AB.y * AP.x
    );
    let cross_magnitude = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
    if (cross_magnitude > 1e-6) {
      return false; // no es colineal
    }
    let dot1 = AB.x * AP.x + AB.y * AP.y + AB.z * AP.z;
    let dot2 = (-AB.x) * BP.x + (-AB.y) * BP.y + (-AB.z) * BP.z;
    return dot1 >= 0 && dot2 >= 0; // está entre begin y end
  }

  equals(other) {
    return (this.begin.equals(other.begin) && this.end.equals(other.end)) || (this.begin.equals(other.end) && this.end.equals(other.begin));
  }
  // definimos un orden lexicográfico para las aristas similar a puntos
  lessThan(other) {
    return this.begin.lessThan(other.begin) ||
           (this.begin.equals(other.begin) && this.end.lessThan(other.end));
  }

}

/* [TODO] Clase Face
Implementar la clase Face que representa una cara poligonal definida
por una lista de vértices (en orden) y aristas. Recordar que debe formar un polígono cerrado. 
Debe incluir métodos para calcular el facepoint (centroide), verificar si un vértice o arista pertenece a
la cara.
Testear: crea una cara con 4 vértices y verifica que las 4 aristas se crean correctamente.
*/
class Face {
  constructor(aVertices) {
    // completar
    this.vertices = aVertices;
    this.edges = [];
    for(let i = 0; i < aVertices.length - 1; i++) {
      this.edges.push(new Edge(aVertices[i], aVertices[i + 1]));
    }
    this.edges.push(new Edge(aVertices[aVertices.length - 1], aVertices[0]));
    this.face_point = centroid(aVertices);

    this.mid_edge_avg = 0.0;
    for(let i = 0; i < this.edges.length; i++) {
      this.mid_edge_avg = this.mid_edge_avg + this.edges[i].mid_edge;
    }
    this.mid_edge_avg = this.mid_edge_avg.divide(this.edges.length);
  }

  contains(vertex) {
    // completar
    for(let i = 0; i < this.vertices.length; i++) {
      if(this.vertices[i].equals(vertex)){
        return true;
      }
  }
    return false;
  }
}
// [TODO]: Implementar la función que calcula los nuevos vértices según Catmull-Clark:
//                      new_vertex = (F + 2*R + (n-3)*P) / n
// F = promedio de puntos de caras, R = promedio de puntos medios de aristas,
// P = posición del vértice original, n = valencia del vértice (número de caras/edges adyacentes)
// Devuelve un Map/look-up table de Point a Point (vértice original a nuevo vértice)
function next_vertices(edges, faces) {
  const next_vertices_map = new Map();
  const vertices = new Set();
  let F = [];
  let R = [];
  for(let i = 0; i < faces.length; i++) {
    F.push(faces[i].face_point);
    for(let j = 0; j < faces[i].edges.length; j++) {
      R.push(faces[i].edges[j].mid_edge_avg);
    }
  }
  

  return next_vertices_map;
}

function findEdgePoint(edge, uniqueEdges) {
  for (const uniqueEdge of uniqueEdges) {
    if (uniqueEdge.equals(edge)) {
      return uniqueEdge.edge_point;
    }
  }
  return edge.edge_point;  // fallback
}

// [TODO]: Implementar la función que realiza una iteración de subdivisión.
// Input: lista de caras (Face[]).
// Output: nueva lista de caras (Face[]) refinada.
// Pasos:
// 1. Calcular los puntos de las caras (face points) - ya están en Face.face_point
// 2. Calcular los puntos de las aristas (edge points)
// 3. Calcular los nuevos vértices (next vertices)
// 4. Crear las nuevas caras usando los puntos calculados
function catmull_clark_surface_subdivision(faces) {
  // Paso 2: Calculo edge points
  // Notamos que un edge puede pertenecer a más de una cara, así que
  // primero necesitamos una lista única de edges para evitar cálculos repetidos.
  
  // COMPLETAR 


  // Paso 3: Calculo next vertices que mapea vertices viejos a nuevos

  // COMPLETAR
  
  // Paso 4: Crear nuevas caras. Divide y refina.
  // Para encontrar los edgePoints correspondientes, usar findEdgePoint.
  // Ejemplo: si la cara es (A,B,C,D), las nuevas caras son:
    // (A, edgePoint(AB), facePoint, edgePoint(DA))
    // (B, edgePoint(BC), facePoint, edgePoint(AB))
    // (C, edgePoint(CD), facePoint, edgePoint(BC))
    // (D, edgePoint(DA), facePoint, edgePoint(CD))
  const next_faces = [];

  // COMPLETAR

  return next_faces;
}



function createInitialCubeFaces() {
  // Creamos los 8 vértices del cubo usando objetos Point
  const v0 = new Point( 1,  1,  1);
  const v1 = new Point(-1,  1,  1);
  const v2 = new Point(-1, -1,  1);
  const v3 = new Point( 1, -1,  1);
  const v4 = new Point( 1, -1, -1);
  const v5 = new Point( 1,  1, -1);
  const v6 = new Point(-1,  1, -1);
  const v7 = new Point(-1, -1, -1);

  // Creamos las 6 caras del cubo (cuadriláteros/quads)
  return [
    new Face([v0, v1, v2, v3]), // front
    new Face([v0, v3, v4, v5]), // right
    new Face([v0, v5, v6, v1]), // top
    new Face([v1, v6, v7, v2]), // left
    new Face([v2, v7, v4, v3]), // bottom
    new Face([v5, v4, v7, v6])  // back
  ];
} // Usamos esto para luego subdividir

function facesToMeshData(faces) {
  const positions = [];
  const colors = [];

  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];

    // Generamos un color basado en el índice de la cara
    const hue = (i * 137.5) % 360; 
    const color = hslToRgb(hue / 360, 0.7, 0.6);

    // Quads a triángulos
    if (face.vertices.length === 4) {
      const [v0, v1, v2, v3] = face.vertices;

      // Triangulo 1: v0, v1, v2
      positions.push(v0.x, v0.y, v0.z);
      positions.push(v1.x, v1.y, v1.z);
      positions.push(v2.x, v2.y, v2.z);

      colors.push(...color, ...color, ...color);

      // Triangulo 2: v0, v2, v3
      positions.push(v0.x, v0.y, v0.z);
      positions.push(v2.x, v2.y, v2.z);
      positions.push(v3.x, v3.y, v3.z);

      colors.push(...color, ...color, ...color);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    vertexCount: positions.length / 3
  };
}