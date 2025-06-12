import { Mesh, MeshBuilder, Scene, Vector3, ActionManager, ActionEvent, ExecuteCodeAction,
		KeyboardInfo, KeyboardEventTypes, StandardMaterial, TransformNode } from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'
import 'https://cdn.babylonjs.com/earcut.min.js'

export class ShipMesh extends TransformNode {
	size: number
	mesh: Mesh
	static outlined: ShipMesh | null = null

	private _i: number = 0
	private _j: number = 0
	private _isRight: boolean = true

	constructor(name:string, size:number, ship:string, scene:Scene, parent:TransformNode, i:number, j:number) {
		super(ship + "-node-" + name, scene, false);
		this.size = size;
		this.i = i;
		this.j = j;

		this.mesh = MeshBuilder.CreateCapsule(ship + "-" + name, {height:size*0.9 - 0.2}, scene);
		this.mesh.parent = this;
		this.mesh.position.x += (size - 1) * 0.45;
		this.mesh.rotation.z = Math.PI/2

		this.parent = parent;
		// this.position = new Vector3(i * 0.9, 0, -j * 0.9)

		this.mesh.actionManager = new ActionManager(scene);
		const action = new ExecuteCodeAction(ActionManager.OnPickTrigger, () => this.onClick());
		this.mesh.actionManager.registerAction(action);
	}

	get i() { return this._i }
	set i(i: number) {
		this._i = i;
		this.position.x = 0.9 * i;
	}
	
	get j() { return this._j }
	set j(j: number) {
		this._j = j
		this.position.z = -0.9 * j;
	}

	get isRight() { return this._isRight }
	set isRight(isRight: boolean) {
		this.rotation.y = isRight ? 0 : Math.PI/2;
		this._isRight = isRight;
	}

	onClick(): void {
		if (ShipMesh.outlined)
			ShipMesh.outlined.mesh.renderOutline = false;
		this.mesh.renderOutline = true;
		ShipMesh.outlined = this;
	}

	static moveShip(kbInfo: KeyboardInfo) {
		if (!ShipMesh.outlined || kbInfo.type !== KeyboardEventTypes.KEYDOWN)
			return;
		const ship = ShipMesh.outlined;

		switch (kbInfo.event.code) {
			case "KeyW":
				if (ship.j > 0) ship.j -= 1;
				break;
			case "KeyA":
				if (ship.i > 0) ship.i -= 1;
				break;
			case "KeyS":
				if ((ship.isRight && ship.j < 9) || ship.j + ship.size < 10)
					ship.j += 1;
				break;
			case "KeyD":
				if ((!ship.isRight && ship.i < 9) || ship.i + ship.size < 10)
					ship.i += 1;
				break;
			case "Space":
				if (ship.i + ship.size <= 10 || ship.j + ship.size <= 10)
					ship.isRight = !ship.isRight;
				break;
			case "Enter":
				break;
		}
		console.log(kbInfo.event.code + ": x=" + ship.position.x + " z=" + ship.position.z)
	}
}

// Custom mesh encapsulating one Battleship player interface
export class BattleshipMesh extends TransformNode {
    pivot: Mesh
    screen: Mesh
    field: Mesh
    cells: Mesh[] = []
	ships: ShipMesh[] = Array(5)
	fieldNode: TransformNode

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

		const options = {
			shape: [ 
				new Vector3(-5.2, 0, -5.2),
				new Vector3(5.2, 0, -5.2),
				new Vector3(5.2, 0, 5.2),
				new Vector3(-5.2, 0, 5.2)
			],
			holes: [[ 
				new Vector3(-4.5, 0, -4.5),
				new Vector3(4.5, 0, -4.5),
				new Vector3(4.5, 0, 4.5),
				new Vector3(-4.5, 0, 4.5)
			]],
			depth:0.9,
		}
		const polygon = MeshBuilder.ExtrudePolygon("field-border-" + name, options, scene);
		polygon.parent = this.field
		polygon.position.y += 0.5
		polygon.position.z -= 0.3

		this.fieldNode = new TransformNode("fieldnode-" + name, scene, true);
		this.fieldNode.parent = this.field;
		this.fieldNode.position = new Vector3(-4.05, 0.3, 3.754);

		// const debug = [
		// 	MeshBuilder.CreateSphere("top-left", {}, scene),
		// 	MeshBuilder.CreateSphere("top-right", {}, scene),
		// 	MeshBuilder.CreateSphere("center", {}, scene),
		// 	MeshBuilder.CreateSphere("bottom-left", {}, scene),
		// 	MeshBuilder.CreateSphere("bottom-right", {}, scene),
		// ];
		// for (const sphere of debug)
		// 	sphere.parent = this.fieldNode;
		// debug[0].position = new Vector3(0,0,0);
		// debug[1].position = new Vector3(9*0.9,0,0);
		// debug[2].position = new Vector3(4.5*0.9,0,-4.5*0.9);
		// debug[3].position = new Vector3(0,0,-9*0.9);
		// debug[4].position = new Vector3(9*0.9,0,-9*0.9);

		this.ships[0] = new ShipMesh(name, 5, "carrier", scene, this.fieldNode, 3, 5);
		this.ships[1] = new ShipMesh(name, 4, "bship", scene, this.fieldNode, 0, 0);
		this.ships[2] = new ShipMesh(name, 3, "destro", scene, this.fieldNode, 7, 6);
		this.ships[3] = new ShipMesh(name, 3, "sub", scene, this.fieldNode, 4, 1);
		this.ships[4] = new ShipMesh(name, 2, "patrol", scene, this.fieldNode, 4, 6);

        if (position !== undefined)
            this.position.addInPlace(position);
        if (rotation !== undefined)
            this.rotation.y += rotation;
    }
}