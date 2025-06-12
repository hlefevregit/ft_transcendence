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
