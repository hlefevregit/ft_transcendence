import '@babylonjs/loaders';
import { GLTFFileLoader } from '@babylonjs/loaders/glTF/glTFFileLoader';

GLTFFileLoader.IncrementalLoading = false;
GLTFFileLoader.HomogeneousCoordinates = false;

export * from "@babylonjs/gui/2D";
export * from '@babylonjs/core';
export * from '@babylonjs/loaders/glTF/glTFFileLoader';
