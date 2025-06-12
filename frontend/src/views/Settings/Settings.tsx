import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as BABYLON from "@babylonjs/core";
import BabylonScene from "@/components/BabylonScene";
import PlayerSprite from "@/components/PlayerSprite";

import SettingsProfile from "./SettingsProfile";
import SettingsFriends from "./SettingsFriends";
import SettingsHistory from "./SettingsHistory";

import "@/styles/Settings.css";

import { useTranslation } from "react-i18next";

type Tab = "profile" | "friends" | "history";

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const handleSceneReady = useCallback(
    (
      scene: BABYLON.Scene,
      engine: BABYLON.Engine,
      camera: BABYLON.FreeCamera
    ) => {
      PlayerSprite({
        scene,
        startX: -200,
        startY: -120,
        size: 256,
        spritePaths: {
          idle: "/assets/spriteshesh/City_men_1/Idle.png",
          walk: "/assets/spriteshesh/City_men_1/Walk.png",
          backward: "/assets/spriteshesh/City_men_1/Backward.png",
        },
        leftBoundary: -250,
        rightBoundary: 250,
        onGoLeftBeyond: () => navigate("/game1"),
        onGoRightBeyond: () => { },
      });
    },
    [navigate]
  );

  // Pour déplacer la barre sous l’onglet
  const tabIndex = activeTab === "profile" ? 0 : activeTab === "friends" ? 1 : 2;
  const underlineColors: Record<Tab, string> = {
    profile: "#3b82f6",  // bleu
    friends: "#10b981",  // vert
    history: "#f59e0b",  // ambre
  };

  return (
    <div className="settings-page">
      <BabylonScene
        backgroundUrl="/assets/3.jpg"
        onSceneReady={handleSceneReady}
        canvasClassName="settings-canvas"
      />
      <div className="settings-backdrop" />
      <div className="settings-container">
        <h1 className="settings-title">{t('settings_title')}</h1>

        {/* ─────────── Onglets ─────────── */}
        <nav className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === "profile" ? "active profile-tab" : ""
              }`}
            onClick={() => setActiveTab("profile")}
            type="button"
          >
			{t('profile_menu')}
          </button>

          <button
            className={`settings-tab ${activeTab === "friends" ? "active friends-tab" : ""
              }`}
            onClick={() => setActiveTab("friends")}
            type="button"
          >
			{t('friends_menu')}
          </button>

          <button
            className={`settings-tab ${activeTab === "history" ? "active history-tab" : ""
              }`}
            onClick={() => setActiveTab("history")}
            type="button"
          >
			{t('history_menu')}
          </button>

          {/* ─── Barre de soulignement qui se déplace ─── */}
          <div
            className="tab-underline"
            style={{
              width: "25%",
              left: `calc(${tabIndex} * (100% / 3) + (100% / 24))`,
              backgroundColor: underlineColors[activeTab],
            }}
          />
        </nav>

        {/* ─────────── Contenu des onglets ─────────── */}
        <div className="settings-content">
          {/* On ne démonte JAMAIS SettingsProfile → il conserve son état interne */}
          <div style={{ display: activeTab === "profile" ? "block" : "none" }}>
            <SettingsProfile />
          </div>

          <div style={{ display: activeTab === "friends" ? "block" : "none" }}>
            <SettingsFriends />
          </div>

          <div style={{ display: activeTab === "history" ? "block" : "none" }}>
            <SettingsHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
