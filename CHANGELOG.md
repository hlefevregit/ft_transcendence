## [1.2.2](https://github.com/hlefevregit/ft_transcendence/compare/v1.2.1...v1.2.2) (2025-06-12)


### Bug Fixes

* **Tournement:** Merge louis' gui fixes and hugo's tournament session ([f7174a5](https://github.com/hlefevregit/ft_transcendence/commit/f7174a5f888deb1e00f7bc0c6de9aa7c4ee9a164))

## [1.2.1](https://github.com/hlefevregit/ft_transcendence/compare/v1.2.0...v1.2.1) (2025-06-12)


### Bug Fixes

* **FinishedGameGUI:** ldalmass: Added default case to show both back and replay button, this only applies for the local and ai game mode ([ecb011f](https://github.com/hlefevregit/ft_transcendence/commit/ecb011f129977d791d1d5fe4c932fedbc2e70c35))
* **FinishedGameGUI:** ldalmass: Fixed The displaying of the button depending of the context ([e0f6899](https://github.com/hlefevregit/ft_transcendence/commit/e0f6899a26a0c215c40c9f039733a663669a70be))

# [1.2.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.1.0...v1.2.0) (2025-06-12)


### Bug Fixes

* **AI:** lpolizzi: made the AI linear, no more while loop to get stuck in. ([3dd27d6](https://github.com/hlefevregit/ft_transcendence/commit/3dd27d6cf7e00bf1bea32c11cf2b1a456ad9c91a))
* **BracketGUI:** ldalmass: Added winner player card to the bracketGUI. Removed some unused content ([c58ca8a](https://github.com/hlefevregit/ft_transcendence/commit/c58ca8a628edf09fdefc461b1fb22d28801a357a))
* **renaming:** ldalmass: Renamed a variable for tournament purpose in the GUI ([029afb1](https://github.com/hlefevregit/ft_transcendence/commit/029afb1eecb7827bdc9a57482ac4eafb727d2d34))
* **tournament:** gameId correctly passed in the websocket, tournament start for game1 but not game2, paddle mouvement does not work ([62600ea](https://github.com/hlefevregit/ft_transcendence/commit/62600ea2acfca74b67a40ce62ed3cb4242802b44))


### Features

* **AI): ldalmass: Finally succeeded making the AI bot for the pong. feat(usernameGUI:** Added a new GUI to enter the users alias when joining or hosting a tournament ([59fa480](https://github.com/hlefevregit/ft_transcendence/commit/59fa480b267c2b3f8fd3952ae206ae3df38599b3))
* **AI:** ldalmass: WIP version of the bouncing ball predition calculation ([bdd3b04](https://github.com/hlefevregit/ft_transcendence/commit/bdd3b041378856a9929e28618ffd24e63b20d6a9))
* **DisplayingAliases:** ldalmass: Created a function that displays the current two aliases from the player 1 and 2 in game when in a tournament ([0465de8](https://github.com/hlefevregit/ft_transcendence/commit/0465de8965d399ce37484e316978178d530c091d))
* **tournament pseudo:** Host can now see the bracket, pseudo handled ([bb647f8](https://github.com/hlefevregit/ft_transcendence/commit/bb647f82eff7339fae26fa4b0bd313a6db2f638b))
* **Tournament:** Party created and destoyed succesfully, issue on joining ([e06c4f7](https://github.com/hlefevregit/ft_transcendence/commit/e06c4f768030040f2584a7096065349eb98ff501))

# [1.1.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.0.1...v1.1.0) (2025-06-12)


### Bug Fixes

* **AI:** lpolizzi: Added a check to see if ball is going towards AI before updating AI ball knowledge so that it doesn't waste time getting information while the ball is going towards the player. ([c1b957b](https://github.com/hlefevregit/ft_transcendence/commit/c1b957be83adf8150efa2b21554e39aed2f39561))
* **AI:** lpolizzi: made the AI linear, no more while loop to get stuck in. ([35341fa](https://github.com/hlefevregit/ft_transcendence/commit/35341fa07908ca2ce697737d7bc077433791e4c0))
* **BracketGUI:** ldalmass: Added winner player card to the bracketGUI. Removed some unused content ([6601c32](https://github.com/hlefevregit/ft_transcendence/commit/6601c327cf15f33b9c7f7e09f34c083f919dcb4a))
* **renaming:** ldalmass: Renamed a variable for tournament purpose in the GUI ([a64b648](https://github.com/hlefevregit/ft_transcendence/commit/a64b648bf626ca30b90ed6ec92e99a95c9c65f36))
* **tournament:** gameId correctly passed in the websocket, tournament start for game1 but not game2, paddle mouvement does not work ([e1c475c](https://github.com/hlefevregit/ft_transcendence/commit/e1c475cf7c03c6b1d549287170302d0720bbdae6))


### Features

* **AI): ldalmass: Finally succeeded making the AI bot for the pong. feat(usernameGUI:** Added a new GUI to enter the users alias when joining or hosting a tournament ([0f49334](https://github.com/hlefevregit/ft_transcendence/commit/0f4933420119b28aa9b4897b17b9c127dcbaa1a3))
* **AI:** ldalmass: WIP version of the bouncing ball predition calculation ([1f2af40](https://github.com/hlefevregit/ft_transcendence/commit/1f2af4002eb33a17102879088f61614e17a3ee95))
* **DisplayingAliases:** ldalmass: Created a function that displays the current two aliases from the player 1 and 2 in game when in a tournament ([4072098](https://github.com/hlefevregit/ft_transcendence/commit/4072098cc0dd415fc26df32ec4cf33061e7f2793))
* **Tournament Branch:** Rebasing Tournament branch ([be8760d](https://github.com/hlefevregit/ft_transcendence/commit/be8760d2f2d10d4a6eff2776e22c7c5f11d7e2b5))
* **tournament pseudo:** Host can now see the bracket, pseudo handled ([bfbc0d3](https://github.com/hlefevregit/ft_transcendence/commit/bfbc0d321633ee29cdd91253dea804b2b2d1f1b6))
* **Tournament:** Party created and destoyed succesfully, issue on joining ([74f6404](https://github.com/hlefevregit/ft_transcendence/commit/74f64046faf7aa642c828713303527f0ce34c09a))

## [1.0.1](https://github.com/hlefevregit/ft_transcendence/compare/v1.0.0...v1.0.1) (2025-06-12)


### Bug Fixes

* **compose.yml:** lpolizzi: Fixed paths in docker-compose.yml. ([975bc37](https://github.com/hlefevregit/ft_transcendence/commit/975bc37e21ff57ec09bc848a494f7cd3d1c6d27f))

# 1.0.0 (2025-06-09)


### Features

* **ci-cd:** add CI-CD workflow ([2a6d0cb](https://github.com/hlefevregit/ft_transcendence/commit/2a6d0cb8e21b390356871717e57854c7940ba9a2))
