// GUIONLINE.ts
import React from 'react';

import * as baby from '@/libs/babylonLibs';
import * as game from '@/libs/pongLibs';


export const instantiateOnlineModeSelectionGUI = (
  pong: React.RefObject<game.pongStruct>,
  states: React.RefObject<game.states>,
  lang: React.RefObject<game.lang>,
  socketRef : WebSocket | null,
//   onHost: () => void,
//   onJoin: () => void
): void => {
  const gui = game.createScreen("onlineModeSelectionGUI");

  const container = game.createAdaptiveContainer("onlineModeSelectionContainer", "300px", "300px");
  const stack = game.createVerticalStackPanel("onlineModeSelectionStack");

//   const title = game.createDynamicTitle("onlineModeSelectionTitle", () => game.getLabel("onlineModeTitle", lang.current), pong);

//   const hostBtn = game.createDynamicButton("hostGameBtn", () => game.getLabel("hostGame", lang.current), pong, () => {
//     onHost();
//   });

//   const joinBtn = game.createDynamicButton("joinGameBtn", () => game.getLabel("joinGame", lang.current), pong, () => {
//     onJoin();
//   });

  const backBtn = game.createDynamicButton("backFromOnlineModeBtn", () => game.getLabel("back", lang.current), pong, () => {
    states.current = game.states.main_menu;
  });

//   stack.addControl(title);
//   stack.addControl(hostBtn);
//   stack.addControl(joinBtn);
  stack.addControl(backBtn);

  container.addControl(stack);
  gui.addControl(container);

  pong.current.hostOrJoinGUI = gui;
  pong.current.guiTexture?.addControl(gui);
};
