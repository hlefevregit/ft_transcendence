import { Mesh, MeshBuilder, Scene, Vector3, Color4, ActionManager, ActionEvent, ExecuteCodeAction } from '@babylonjs/core'

// Custom mesh encapsulating one Battleship player interface
class BattleshipMesh extends Mesh {
    pivot: Mesh
    screen: Mesh
    field: Mesh
    cells: Mesh[] = []

    constructor(name: string, scene: Scene, onClick: (ij:number, evt:ActionEvent) => void, position?: Vector3, rotation?: Vector3) {
        super(name, scene);

		// Cylinder pivot for the screen's rotating animation. Mostly aesthetic
        this.pivot = MeshBuilder.CreateCylinder("pivot-" + name, {height:10.5, diameter:1.7}, scene);
        this.pivot.parent = this;
        this.pivot.rotation.z += Math.PI/2;

		// Upper box, represents the opponent's field. Parent mesh of the cells (see below)
        this.screen = MeshBuilder.CreateBox("screen-" + name, {width:10, height:10.5, depth:0.7}, scene);
		this.screen.position = new Vector3(0, 5.6, 0.3);

		// Array of 'cells', small clickable meshes used by player to select where to attack next
        const cellColor = new Color4(0, 0.27, 1);
        for (let i=0; i < 10; i++) {
            for (let j=0; j < 10; j++) {
                const cell = MeshBuilder.CreateBox("cell" + i + j + "-" + name, {size:0.8, depth:0.3, faceColors:Array(6).fill(cellColor)});
                cell.parent = this.screen;
                cell.position = new Vector3(i-4.5, j-4.25, -0.3);
				cell.actionManager = new ActionManager(scene);
				cell.actionManager.registerAction(new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					(event) => onClick(i*10 + j, event))
				);
                this.cells.push(cell);
            }
        }
        this.screen.setParent(this.pivot);
        this.pivot.rotation.x += Math.PI/12

		// Lower box, represents the player's own field. Might be used for ship placement (TBD)
        this.field = MeshBuilder.CreateBox("field-" + name, {width:10.2, height:0.7, depth:10.7}, scene);
        this.field.setParent(this);
        this.field.position.addInPlace(new Vector3(0, -0.2, -5.6));

        if (position !== undefined)
            this.position.addInPlace(position);
        if (rotation !== undefined)
            this.rotation.addInPlace(rotation);
    }
}

export default BattleshipMesh;