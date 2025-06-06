import 'babylonjs'

class BattleshipMesh extends BABYLON.Mesh {
    pivot: BABYLON.Mesh
    screen: BABYLON.Mesh
    field: BABYLON.Mesh
    cells: BABYLON.Mesh[] = []

    constructor( name: string, scene: BABYLON.Scene, position?: BABYLON.Vector3, rotation?: BABYLON.Vector3) {
        super(name, scene);
        this.pivot = BABYLON.MeshBuilder.CreateCylinder("pivot" + name, {height:10.5, diameter:1.7}, scene);
        this.pivot.parent = this;
        this.pivot.rotation.z += Math.PI/2;

        this.screen = BABYLON.MeshBuilder.CreateBox("screen" + name, {width:10, height:10.5, depth:0.7}, scene);
		this.screen.position = new BABYLON.Vector3(0, 5.6, 0.3);

        const cellColor = new BABYLON.Color4(0, 0.27, 1);
        for (let i=0; i < 10; i++) {
            for (let j=0; j < 10; j++) {
                const cell = BABYLON.MeshBuilder.CreateBox("cell" + i + j + name, {size:0.8, depth:0.3, faceColors:Array(6).fill(cellColor)});
                cell.parent = this.screen;
                cell.position = new BABYLON.Vector3(i-4.5, j-4.25, -0.3);
                this.cells.push(cell);
            }
        }
        this.screen.setParent(this.pivot);
        this.pivot.rotation.x += Math.PI/12

        this.field = BABYLON.MeshBuilder.CreateBox(name + "Field", {width:10.2, height:0.7, depth:10.7}, scene);
        this.field.setParent(this);
        this.field.position.addInPlace(new BABYLON.Vector3(0, -0.2, -5.6));

        if (position !== undefined)
            this.position.addInPlace(position);
        if (rotation !== undefined)
            this.rotation.addInPlace(rotation);
    }
}

export default BattleshipMesh;