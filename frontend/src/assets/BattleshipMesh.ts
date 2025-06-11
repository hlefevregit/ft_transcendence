import { Mesh, MeshBuilder, Scene, Vector3, ActionManager, ActionEvent, ExecuteCodeAction, StandardMaterial, TransformNode } from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'

class ShipMesh extends TransformNode {
	mesh: Mesh

	constructor(name:string, size:number, ship:string, scene:Scene, parent:TransformNode, posX:number, posZ:number) {
		super(ship + "-node-" + name, scene, false);

		this.mesh = MeshBuilder.CreateCapsule(
			ship + "-" + name,
			{height:size-0.4, orientation:Vector3.Right()},
			scene,
		);
		this.mesh.parent = this;
		this.mesh.position.x += (size - 1) / 2;
		this.mesh.position.y += 1;

		this.parent = parent;
		this.position = new Vector3(posX * 0.92, 0, -posZ * 0.92)
		this.scalingDeterminant = 0.92
	}
}

// Custom mesh encapsulating one Battleship player interface
class BattleshipMesh extends TransformNode {
    pivot: Mesh
    screen: Mesh
    field: Mesh
    cells: Mesh[] = []
	ships: ShipMesh[] = Array(5)

    constructor(name: string, scene: Scene, onClick: (ij:number, evt:ActionEvent) => void, blue: StandardMaterial, grid: GridMaterial, position?: Vector3, rotation?: number) {
        super(name, scene, false);

		// Cylinder pivot for the screen's rotating animation. Mostly aesthetic
        this.pivot = MeshBuilder.CreateCylinder("pivot-" + name, {height:10.5, diameter:1.7}, scene);
        this.pivot.parent = this;
        this.pivot.rotation.z += Math.PI/2;

		// Upper box, represents the opponent's field. Parent mesh of the cells (see below)
        this.screen = MeshBuilder.CreateBox("screen-" + name, {width:10, height:10.5, depth:0.7}, scene);
		this.screen.position = new Vector3(0, 5.6, 0.3);

		// Array of 'cells', small clickable meshes used by player to select where to attack next
        for (let i=0; i < 10; i++) {
            for (let j=0; j < 10; j++) {
                const cell = MeshBuilder.CreateBox("cell" + i + j + "-" + name, {size:0.8, depth:0.3});
				cell.material = blue;
                cell.parent = this.screen;
                cell.position = new Vector3(i-4.5, 4.75-j, -0.3);
				cell.actionManager = new ActionManager(scene);
				cell.actionManager.registerAction(new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					(event) => {
						event.additionalData = name;
						onClick(i*10 + j, event);
					})
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
		this.field.material = grid;

		const fieldNode = new TransformNode("fieldnode-" + name, scene, true);
		fieldNode.parent = this.field;
		fieldNode.position = new Vector3(-4.5, 0, 3);

		this.ships[0] = new ShipMesh(name, 5, "carrier", scene, fieldNode, 3, 5);
		this.ships[1] = new ShipMesh(name, 4, "bship", scene, fieldNode, 0, 0);
		this.ships[2] = new ShipMesh(name, 3, "destro", scene, fieldNode, 7, 6);
		this.ships[3] = new ShipMesh(name, 3, "sub", scene, fieldNode, 4, 1);
		this.ships[4] = new ShipMesh(name, 2, "patrol", scene, fieldNode, 7, 1);

        if (position !== undefined)
            this.position.addInPlace(position);
        if (rotation !== undefined)
            this.rotation.y += rotation;
    }
}

export default BattleshipMesh;