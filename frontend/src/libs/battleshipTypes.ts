import { EngineOptions, SceneOptions, Scene, Mesh, ArcRotateCamera,
		 HemisphericLight, StandardMaterial } from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials'
import { BattleshipMesh } from '@/assets/BattleshipMesh'

export type SceneCanvasProps = {
  engineOptions?: EngineOptions
  sceneOptions?: SceneOptions
  onRender?: (scene: Scene) => void
  onSceneReady: (scene: Scene) => void
}

export type ShipTup = [set:Set<number>, index:number]

export type PlayerInfo = {
  obj: BattleshipMesh
  ships: Set<ShipTup> | null
}

export type GameRefType = {
  playing: PlayerInfo
  waiting: PlayerInfo
  table: Mesh
  camera: ArcRotateCamera
  light: HemisphericLight
  mats: {
    blue: StandardMaterial
    red: StandardMaterial
    white: StandardMaterial
    grid: GridMaterial
  }
}