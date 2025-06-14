import { EngineOptions, SceneOptions, Scene, Mesh, ArcRotateCamera,
		 HemisphericLight, StandardMaterial, GlowLayer } from '@babylonjs/core'
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

export interface MatsRef {
	blue: StandardMaterial
	red: StandardMaterial
	white: StandardMaterial
	grid: GridMaterial
    indic: StandardMaterial
}

export type GameRefType = {
  playing: PlayerInfo
  waiting: PlayerInfo
  table: Mesh
  camera: ArcRotateCamera
  light: HemisphericLight
  mats: MatsRef
  glow: GlowLayer
}