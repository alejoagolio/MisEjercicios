// Implementación de la estructura de datos Half-Edge
//
// La estructura de datos half-edge representa una malla dividiendo cada edge en dos half-edges,
// uno para cada cara/face adyacente. Esto permite un navegación y consultas de topología eficientes. 
// La half-edge asume que las mallas son manifold. Para que una malla sea manifold, deben cumplirse dos condiciones. 
// Primero, las caras adyacentes alrededor de un vértice deben poder ordenarse de modo que sus vértices (además del
// vértice común) formen una cadena simple. Segundo, cada arista debe ser compartida por no más de dos caras.

// Asumiremos un orden de giro CCW para las caras. Por ejemplo,
//     (2)
//     / \
//   (0)—(1)
// CCW order 0 -> 1 -> 2

// Paso 1. Definir las clases básicas: Vertex, HalfEdge, Face
// Paso 2. Definir la clase HalfEdgeMesh que maneja la estructura de datos half-edge
// Paso 3. Implementar un parser simple para archivos OBJ
// Paso 4. Implementar los funciones de consultas (getAdjacentVertices, etc.)
// Paso 5. (Opcional) Implementar Catmull-Clark Subdivision usando half-edges. 

// ============================================================================
// Clases de la estructura de datos
// ============================================================================

// clase Vertex 
//  Implementar el constructor y los siguientes métodos:
//  - getAdjacentVertices(): Devuelve un array con los vértices adyacentes (1-ring neighbors).
//  - getOutgoingHalfEdges(): Devuelve un array con las half-edges que salen de este vértice.
//  - getIncidentFaces(): Devuelve un array con las caras incidentes a este vértice.
//  - getValence(): Devuelve la valencia del vértice (número de edges/caras conectadas).
//  - isBoundary(): Devuelve true si el vértice está en la frontera (tiene al menos una half-edge sin twin).
class Vertex {
    // El constructor debe guardar:
    //  - id: Identificador único del vértice
    //  - position: Posición 3D del vértice (objeto {x, y, z})
    //  - halfEdge: Una half-edge que sale de este vértice (objeto HalfEdge)
    constructor(x, y, z, id) {
        // COMPLETAR
        this.id = id
        this.position = {x: x, y: y, z: z}
        this.halfEdge = null
    }

    /**
     * Devuelve un array con los vértices adyacentes
     */
    getAdjacentVertices() {
        let adjacent = []
        // caso triangulo
        if(this.halfEdge.face.isTriangle()){
            for (let edge of this.getOutgoingHalfEdges()){
                adjacent.push(edge.getDestinationVertex())
            }
        }
        // caso un solo vertice
        else if(this.halfEdge.face.getNumSides() === 1){
            adjacent.push(this.halfEdge.getDestinationVertex())
        }
        // caso cuadrilatero o mas
        else{
            let startEdge = this.halfEdge
            let edge = startEdge
            do {
                adjacent.push(edge.getDestinationVertex())
                edge = edge.twin
                if (edge !== null) {
                    edge = edge.next
                }
            } while (edge !== startEdge && edge !== null)
        }
        return adjacent;
    }

    /**
     * Devuelve un array con las half-edges que salen de este vértice
     */
    getOutgoingHalfEdges() {
        // COMPLETAR
        let edges = []
        let startEdge = this.halfEdge
        let edge = startEdge
        do {
            edges.push(edge)
            edge = edge.twin
            if (edge !== null) {
                edge = edge.next
            }
        } while (edge !== startEdge && edge !== null)
        return edges;
    }

    /**
     * Devuelve un array con las caras incidentes a este vértice
     */
    getIncidentFaces() {
       // COMPLETAR
        faces = []
        for (let edge of this.getOutgoingHalfEdges()){
            if (edge.face !== null){
                faces.push(edge.face)
            }
        return faces;
    }
}

    /**
     * Devuelve la valencia del vértice (número de edges/caras conectadas)
     */
    getValence() {
        // COMPLETAR
        return this.getOutgoingHalfEdges().length
    }

    /*
    * Devuelve true si el vértice está en la frontera (tiene al menos una half-edge sin twin)
    */
    isBoundary() {
       // COMPLETAR
        for (let edge of this.getOutgoingHalfEdges()){
            if(edge.isBoundary()){
                return true
            }
        }
        return false
    }

    toString() {
        return `Vertex ${this.id} [${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)}]`;
    }
}

// Clase half-edge
// Implementar el constructor y los siguientes métodos:
//  - getSourceVertex(): Devuelve el vértice de origen de esta half-edge.
//  - getDestinationVertex(): Devuelve el vértice de destino de esta half-edge.
//  - getVertices(): Devuelve un array con ambos vértices de esta half-edge [origen, destino].
//  - isBoundary(): Devuelve true si esta half-edge es una frontera (no tiene twin).
//  - getLength(): Devuelve la longitud de esta half-edge.
class HalfEdge {
    // el constructor debe guardar:
    //  - id: Identificador único de la half-edge
    //  - vertex: Vértice en el INICIO de esta half-edge (objeto Vertex)
    //  - face: Cara a la que pertenece esta half-edge (objeto Face)
    //  - next: Siguiente half-edge en la cara (objeto HalfEdge)
    //  - prev: Half-edge previa en la cara (objeto HalfEdge)
    //  - twin: Half-edge opuesta (objeto HalfEdge)
    constructor(id) {
       // COMPLETAR
         this.id = id
         this.vertex = null
         this.face = null
         this.next = null
         this.prev = null
         this.twin = null
    }

    /**
     *  Devuelve el vértice de origen de esta half-edge.
     */
    getSourceVertex() {
        // COMPLETAR
        return this.vertex
    }

    // Devuelve el vértice de destino de esta half-edge.
    getDestinationVertex() {
        // COMPLETAR
        return this.next.vertex
    }

    // Devuelve ambos vértices de esta half-edge como un array [origen, destino]
    getVertices() {
        // COMPLETAR
        return [this.getSourceVertex(), this.getDestinationVertex()]
    }

    // Comprueba si esta half-edge es una frontera (no tiene twin)
    isBoundary() {
        // COMPLETAR
        return this.twin === null
    }

    // Devuelve la longitud de esta half-edge. La longitud
    // la calculamos como la distancia entre los vértices de origen y destino.
    // Recordar que dado x, y en R3 la distancia d(x,y)= sqrt((x1-y1)^2 + (x2-y2)^2 + (x3-y3)^2)
    getLength() {
        // COMPLETAR
        let v1 = this.getSourceVertex().position
        let v2 = this.getDestinationVertex().position
        return Math.sqrt((v1.x - v2.x)**2 + (v1.y - v2.y)**2 + (v1.z - v2.z)**2)
    }

    toString() {
        const vertexId = this.vertex ? this.vertex.id : 'null';
        const faceId = this.face ? this.face.id : 'null';
        const twinId = this.twin ? this.twin.id : 'null';
        return `HalfEdge ${this.id} (vertex: ${vertexId}, face: ${faceId}, twin: ${twinId})`;
    }
}

// Clase face - representa una cara (polígono) en la malla
// Implementar el constructor y los siguientes métodos:
//  - getVertices(): Devuelve un array con los vértices de esta cara en orden.
//  - getHalfEdges(): Devuelve un array con las half-edges de esta cara en orden.
//  - getAdjacentFaces(): Devuelve un array con las caras adyacentes (comparten una arista).
//  - getNumSides(): Devuelve el número de lados (vértices/edges) de esta cara.
//  - isTriangle(): Devuelve true si esta cara es un triángulo.
//  - isQuad(): Devuelve true si esta cara es un cuadrilátero.
//  - hasBoundaryEdge(): Devuelve true si esta cara tiene al menos una half-edge sin twin.
class Face {
    // El constructor debe guardar:
    //  - id: Identificador único de la cara
    //  - halfEdge: Una half-edge que pertenece a esta cara (objeto HalfEdge)
    constructor(id) {
      // COMPLETAR
      this.id = id
      this.halfEdge = null
    }

    // Devuelve todos los vértices de esta cara en orden
    getVertices() {
        // COMPLETAR
        vertices = []
        let startEdge = this.halfEdge
        let edge = startEdge
        while (true) {
            vertices.push(edge.getSourceVertex())
            edge = edge.next
            if (edge === startEdge) break
        }
        return vertices;
    }

    // Devuelve todas las half-edges de esta cara en orden
    getHalfEdges() {
        // COMPLETAR
        let edges = []
        let startEdge = this.halfEdge
        let edge = startEdge
        while (true) {
            edges.push(edge)
            edge = edge.next
            if (edge === startEdge) break
        }
        return edges;
    }

    // Devuelve todas las caras adyacentes (comparten una arista) a esta cara
    getAdjacentFaces() {
        // COMPLETAR
        adjacent = []
        for (let edge of this.getHalfEdges()){
            if (edge.twin !== null && edge.twin.face !== null){
                adjacent.push(edge.twin.face)
            }
        return adjacent;
    }
}

    // Devuelve el número de vértices/edges en esta cara
    getNumSides() {
        // COMPLETAR
        return this.getHalfEdges().length
    }

    // Comprueba si esta cara es un triángulo
    isTriangle() {
        // COMPLETAR
        return this.getNumSides() === 3
    }

    // Comprueba si esta cara es un cuadrilátero
    isQuad() {
        // COMPLETAR
        return this.getNumSides() === 4
    }

    // Comprueba si esta cara tiene una arista de frontera
    hasBoundaryEdge() {
        // COMPLETAR
        for (let edge of this.getHalfEdges()){
            if(edge.isBoundary()){
                return true
            }
        }
        return false
    }

    toString() {
        const vertices = this.getVertices();
        const vertexIds = vertices.map(v => v.id).join(', ');
        return `Face ${this.id} [${vertexIds}]`;
    }
}

// ============================================================================
// Clase HalfEdgeMesh - Clase principal que maneja la estructura de datos half-edge
// ============================================================================

// Implementar el constructor y los siguientes métodos:
//  - buildFromOBJ(positions, faceIndices): Construye la estructura half-edge a partir de datos OBJ.
//    positions: Array de posiciones [x, y, z].
//    faceIndices: Array de arrays de índices de vértices para cada cara.
//  - validate(): Valida la estructura half-edge, devuelve un objeto con los resultados de la validación.
//  - getStats(): Devuelve estadísticas sobre la malla (número de vértices, half-edges, caras, edges).
//  - Métodos de consulta de conectividad (ver más abajo).
class HalfEdgeMesh {
    // La clase halfedge Mesh debe mantener una lista de: vértices, half-edges y caras; y un diccionario/mapa
    // para rastrear los pares de edges (para encontrar twins).
    constructor() {
        // COMPLETAR
        this.vertices = []
        this.halfEdges = []
        this.faces = []
        this.edges = new Map()
    }

    // Construye la estructura half-edge a partir de datos OBJ
    // positions: Array de posiciones [x, y, z]
    // faceIndices: Array de índices de vértices para cada cara
    buildFromOBJ(positions, faceIndices) {
        // COMPLETAR
        // Vertices
        for(let i = 0; i < positions.length; i++){
            let pos = positions[i]
            let vertex = new Vertex(pos[0], pos[1], pos[2], i)
            this.vertices.push(vertex)
        }
        // Faces and HalfEdges
        let halfEdgeId = 0
        for(let i = 0; i < faceIndices.length; i++){
            let indices = faceIndices[i]
            let face = new Face(i)
            this.faces.push(face)
            let faceHalfEdges = []
            for(let j = 0; j < indices.length; j++){
                let he = new HalfEdge(halfEdgeId++)
                he.vertex = this.vertices[indices[j]]
                he.face = face
                faceHalfEdges.push(he)
                this.halfEdges.push(he)
                // Map edge for twin linking
                let v1 = indices[j]
                let v2 = indices[(j + 1) % indices.length]
                let edgeKey = this.getEdgeKey(v1, v2)
                this.edges.set(edgeKey, he)
            }
            // Link halfEdges in face
            for(let j = 0; j < faceHalfEdges.length; j++){
                faceHalfEdges[j].next = faceHalfEdges[(j + 1) % faceHalfEdges.length]
                faceHalfEdges[j].prev = faceHalfEdges[(j - 1 + faceHalfEdges.length) % faceHalfEdges.length]
            }
            face.halfEdge = faceHalfEdges[0]
            // Link halfEdge to vertex
            for(let he of faceHalfEdges){
                if(he.vertex.halfEdge === null){
                    he.vertex.halfEdge = he
                }
            }
        }
    }


    // ------ Sugerienca: completar estas funciones auxiliares para usarse en buildFromOBJ ------
    // Crea una key única para un edge dado sus dos vértices
    // Esta funcion puede ser útil para definir el mapa de edges
    getEdgeKey(v1, v2) {
        return `${v1}-${v2}`;
    }

    // Enlaza las half-edges gemelas (twin) basándose en el mapa de edges
    // Esta función se llama para construir las referencias twin después de crear todas las half-edges
    linkTwins() {
        // COMPLETAR
        for (let edge of this.halfEdges){
            let v1 = edge.getSourceVertex().id
            let v2 = edge.getDestinationVertex().id
            let twinKey = this.getEdgeKey(v2, v1)
            if (this.edges.has(twinKey)){
                let twinEdge = this.edges.get(twinKey)
                edge.twin = twinEdge
                twinEdge.twin = edge
            }
        }
    }
    // ---------------------------------------------------------------


    
    // Valida la estructura half-edge
    // Todos los vértices deben tener al menos una half-edge saliente
    // Todas las half-edges deben tener referencias válidas a vértices, caras, next, prev
    // next.prev debe ser this y prev.next debe ser this
    // twin.twin debe ser this (si twin existe)
    // Las half-edges en una cara deben formar un ciclo cerrado
    // Devuelve un objeto con los resultados de la validación: {valid: bool, errors: Array, warnings: Array}
    // 0 si no hay errores, 1 si los hay. 
    validate() {
        const errors = [];
        const warnings = [];
        const isValid = errors.length === 0;

        // COMPLETAR
        // Validar vértices
        for (let vertex of this.vertices){
            if (vertex.halfEdge === null){
                errors.push(`Vertex ${vertex.id} has no outgoing half-edge.`);
            }
        }
        // Validar half-edges
        for (let edge of this.halfEdges){
            if (edge.vertex === null){
                errors.push(`HalfEdge ${edge.id} has no source vertex.`);
            }
            if (edge.face === null){
                errors.push(`HalfEdge ${edge.id} has no face.`);
            }
            if (edge.next === null){
                errors.push(`HalfEdge ${edge.id} has no next half-edge.`);
            }
            if (edge.prev === null){
                errors.push(`HalfEdge ${edge.id} has no previous half-edge.`);
            }
            if (edge.next && edge.next.prev !== edge){
                errors.push(`HalfEdge ${edge.id} next.prev does not point back to this half-edge.`);
            }
            if (edge.prev && edge.prev.next !== edge){
                errors.push(`HalfEdge ${edge.id} prev.next does not point back to this half-edge.`);
            }
            if (edge.twin && edge.twin.twin !== edge){
                errors.push(`HalfEdge ${edge.id} twin.twin does not point back to this half-edge.`);
            }
            // Validar ciclo cerrado en la cara
            let startEdge = edge
            let currentEdge = edge.next
            let count = 0
            while (currentEdge !== startEdge && count < this.halfEdges.length){
                if (currentEdge === null){
                    errors.push(`HalfEdge ${edge.id} face does not form a closed loop.`);
                    break
                }
                currentEdge = currentEdge.next
                count++
            }
        }
        return {
            valid: isValid,
            errors,
            warnings
        };
    }

    // Devuelve la cantidad de vértices, half-edges, caras y edges (aproximado)
    // Para edges, contamos half-edges / 2 (las half-edges de frontera se cuentan una sola vez)
    getStats() {
        // COMPLETAR
        let numEdges = 0
        let edgeSet = new Set()
        for (let edge of this.halfEdges){
            let v1 = edge.getSourceVertex().id
            let v2 = edge.getDestinationVertex().id
            let edgeKey = this.getEdgeKey(Math.min(v1, v2), Math.max(v1, v2))
            edgeSet.add(edgeKey)
        }
        numEdges = edgeSet.size
        return {
            numVertices: this.vertices.length,
            numHalfEdges: this.halfEdges.length,
            numFaces: this.faces.length,
            numEdges: numEdges
        };
    }

    // ========================================================================
    // Consultas de conectividad
    // Estos métodos permiten consultar la conectividad topológica de la malla
    // y navegar a través de sus elementos (vértices, half-edges, caras).
    // ========================================================================

    // Chequea si dos vértices son adyacentes (comparten una arista)
    areVerticesAdjacent(vertexId1, vertexId2) {
       // COMPLETAR
        let vertex1 = this.vertices[vertexId1]
        for (let edge of vertex1.getOutgoingHalfEdges()){
            if (edge.getDestinationVertex().id === vertexId2){
                return true
            }
        }
        return false
    }

    // Devuelve la half-edge entre dos vértices (si existe)
    getHalfEdgeBetween(vertexId1, vertexId2) {
        // COMPLETAR
        let vertex1 = this.vertices[vertexId1]
        for (let edge of vertex1.getOutgoingHalfEdges()){
            if (edge.getDestinationVertex().id === vertexId2){
                return edge
            }
        }
        return null
    }

    // Chequea si dos caras son adyacentes (comparten una arista)
    areFacesAdjacent(faceId1, faceId2) {
       // COMPLETAR
        let face1 = this.faces[faceId1]
        for (let edge of face1.getHalfEdges()){
            if (edge.twin !== null && edge.twin.face !== null && edge.twin.face.id === faceId2){
                return true
            }
        }
        return false
    }

    // Encuentra los vértices comunes entre dos caras
    getCommonVertices(faceId1, faceId2) {
        // COMPLETAR
        let face1 = this.faces[faceId1]
        let face2 = this.faces[faceId2]
        let vertices1 = new Set(face1.getVertices().map(v => v.id))
        let common = []
        for (let v of face2.getVertices()){
            if (vertices1.has(v.id)){
                common.push(v)
            }
        return common;
    }
}

    // Devuelve todos los vértices de frontera
    getBoundaryVertices() {
        // COMPLETAR
        boundary = []
        for (let vertex of this.vertices){
            if (vertex.isBoundary()){
                boundary.push(vertex)
            }
        }
        return boundary;
    }

    // Devuelve todas las half-edges de frontera
    getBoundaryHalfEdges() {
        // COMPLETAR
        boundary = []
        for (let edge of this.halfEdges){
            if (edge.isBoundary()){
                boundary.push(edge)
            }
        return boundary;
    }
}

    // Devuelve todas las caras de frontera
    getBoundaryFaces() {
        // COMPLETAR
        boundary = []
        for (let face of this.faces){
            if (face.hasBoundaryEdge()){
                boundary.push(face)
            }
        return boundary;
    }
}


    // Encuentra los vecinos en k-ring de un vértice (vértices a distancia k)
    // k=1 da los vecinos directos, k=2 da los vecinos de los vecinos, etc.
    getKRingNeighbors(vertexId, k) {
        // COMPLETAR
        let startVertex = this.vertices[vertexId]
        let currentRing = new Set([startVertex])
        let allNeighbors = new Set([startVertex])
        for (let i = 0; i < k; i++){
            let nextRing = new Set()
            for (let vertex of currentRing){
                for (let neighbor of vertex.getAdjacentVertices()){
                    if (!allNeighbors.has(neighbor)){
                        nextRing.add(neighbor)
                        allNeighbors.add(neighbor)
                    }
                }
            }
            currentRing = nextRing
        }
    }
}

// ============================================================================
// Lectura de archivos OBJ
// ============================================================================

// Implementar una función para parsear archivos OBJ simples
// Hint: ver qué hace String.split, trim, startsWith, parseFloat, parseInt
// 
function parseOBJ(text) {
    const positions = [];
    const faces = [];

    // COMPLETAR
    const lines = text.split('\n');
    for (let line of lines){
        line = line.trim()
        if (line.startsWith('v ')){
            let parts = line.split(/\s+/)
            let x = parseFloat(parts[1])
            let y = parseFloat(parts[2])
            let z = parseFloat(parts[3])
            positions.push([x, y, z])
        }
        else if (line.startsWith('f ')){
            let parts = line.split(/\s+/)
            let face = []
            for (let i = 1; i < parts.length; i++){
                let idx = parseInt(parts[i].split('/')[0]) - 1 // OBJ is 1-indexed
                face.push(idx)
            }
            faces.push(face)
        }
    }
    return {
        positions,
        faces
    };
}
