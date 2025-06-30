# [1.8.0](https://github.com/hlefevregit/ft_transcendence/compare/1.7.0...1.8.0) (2025-06-30)


### Bug Fixes

* **assets & prod:** lpolizzi: Changed assets for the map. Made frontend run in production mode. ([018d8dd](https://github.com/hlefevregit/ft_transcendence/commit/018d8dd38432f0611072e43faf710e6c54e53f04))
* **assets & prod:** lpolizzi: Changed assets for the map. Made frontend run in production mode. ([32adb53](https://github.com/hlefevregit/ft_transcendence/commit/32adb530ad5564896417104b1d32b90ebe095853))
* **assets & prod:** lpolizzi: Changed assets for the map. Made frontend run in production mode. ([cbad002](https://github.com/hlefevregit/ft_transcendence/commit/cbad0029db79f107ecabd5ed86fd78c9242821db))
* **balance api:** lpolizzi: Added balance api calls to second blackjack hand. Also made the winnings from blackjack be 3/2 instead of 3/1. ([7c25bbc](https://github.com/hlefevregit/ft_transcendence/commit/7c25bbc03d7e27c92b10afcd865396b8a96db7be))
* **balance api:** lpolizzi: Added balance api calls to second blackjack hand. Also made the winnings from blackjack be 3/2 instead of 3/1. ([77c7231](https://github.com/hlefevregit/ft_transcendence/commit/77c72312c6ce140bbff5ad9052671ceaad7c9cfb))
* **Ball depending on framerate:** ldalmass: fixed ball movement being updated in the renderLoop, instead its in the backgroundCalulations() loop ([6d6bb09](https://github.com/hlefevregit/ft_transcendence/commit/6d6bb098de6b0733394790c00975a61cdc47c199))
* **Ball depending on framerate:** ldalmass: fixed ball movement being updated in the renderLoop, instead its in the backgroundCalulations() loop ([e745b9c](https://github.com/hlefevregit/ft_transcendence/commit/e745b9cd3a88bd07d732ec5f0250fb2c08e95117))
* **Balnace GUI:** ldalmass: added balance function ([f7dc76b](https://github.com/hlefevregit/ft_transcendence/commit/f7dc76b9e11638e724d8c10d18b3800b02ff7364))
* **blackjack map:** lpolizzi: Finally found a way to import the map and see it on screen. ([7562a08](https://github.com/hlefevregit/ft_transcendence/commit/7562a083ff7ff1f71cab54ec4345660c36bffb09))
* **blackjack map:** lpolizzi: Finally found a way to import the map and see it on screen. ([27fbc1e](https://github.com/hlefevregit/ft_transcendence/commit/27fbc1eb171cd7cccbcb23083c9d0f8feeb81dd0))
* **BlackJack:** ldalmass: Added actionGUI and its functions to display or not the split or double button ([d872060](https://github.com/hlefevregit/ft_transcendence/commit/d8720600ba842b4dc38d0e55ffd3a5005d16ae8c))
* **BlackJack:** ldalmass: Added actionGUI and its functions to display or not the split or double button ([86d5cde](https://github.com/hlefevregit/ft_transcendence/commit/86d5cde73198785b268ffcf119c0915db25399ac))
* **caca:** ldalmass: caca -> back in settingsGUI ([ef0538b](https://github.com/hlefevregit/ft_transcendence/commit/ef0538b017d6eba05aa456ae46c1b49548d8fa89))
* **card mesh isolation:** lpolizzi: Founda way to isolate specific card meshes to handle each card as it's own. ([1770a16](https://github.com/hlefevregit/ft_transcendence/commit/1770a164e759099cfb3f52ecc3f36e447ce9e700))
* **card mesh isolation:** lpolizzi: Founda way to isolate specific card meshes to handle each card as it's own. ([702a037](https://github.com/hlefevregit/ft_transcendence/commit/702a03799a53b57f1787961a055a7687fab921dd))
* **card meshes map:** lpolizzi: Fixed map making function for the cards meshes. Need to fix the card dealing function to correctly deal and enable cards visibility. ([61ca25e](https://github.com/hlefevregit/ft_transcendence/commit/61ca25e78b9ddd6d02c5481327169300e6109ef1))
* **card meshes:** lpolizzi: Made the deal card function store a clone of the card in an array to use during the hand and destroy directly after to avoid lag. ([d2cab5e](https://github.com/hlefevregit/ft_transcendence/commit/d2cab5e69402fb316e188f955f656506a09564a5))
* **card meshes:** lpolizzi: Made the deal card function store a clone of the card in an array to use during the hand and destroy directly after to avoid lag. ([f4b97a5](https://github.com/hlefevregit/ft_transcendence/commit/f4b97a58e6b50f4814753e8dcefa1c7a96765756))
* **card model+textures:** lpolizzi: Added and placed card model with textures. ([1605337](https://github.com/hlefevregit/ft_transcendence/commit/16053370606ac89a07f58467f5e73050eaf8636a))
* **card model+textures:** lpolizzi: Added and placed card model with textures. ([879f03e](https://github.com/hlefevregit/ft_transcendence/commit/879f03e411e6191d91933b15a8b28515b495b5ed))
* **card model:** lpolizzi: Exported good version of Card.gltf with c4d. ([a749b29](https://github.com/hlefevregit/ft_transcendence/commit/a749b292e479bc02f7fd1c9bec5e6a28ea044448))
* **card model:** lpolizzi: Exported good version of Card.gltf with c4d. ([8d6a75a](https://github.com/hlefevregit/ft_transcendence/commit/8d6a75a55787707909006417d97d0dde243d6e63))
* **Cards:** ldalmass: fixed cards ([84eef40](https://github.com/hlefevregit/ft_transcendence/commit/84eef40716f2ae5f5a20852f472290e5aa30b498))
* **cards:** lpolizzi: Fixed cards record sometimes being undefined. Also fixed it being called wrong in some places and dealCard not returning the dealt card. ([f33d327](https://github.com/hlefevregit/ft_transcendence/commit/f33d32770c3d6d612c9c7b5acd6058633eaf9bc2))
* **cards:** lpolizzi: Fixed cards record sometimes being undefined. Also fixed it being called wrong in some places and dealCard not returning the dealt card. ([f423ba7](https://github.com/hlefevregit/ft_transcendence/commit/f423ba74212e3ae2ca09689d39fdace25d8b6f41))
* **Casino.gltf:** ldalmass: replaced existing walls and floor with a new plane to fix  the textures ([021c77c](https://github.com/hlefevregit/ft_transcendence/commit/021c77cc444d046b44a408422f2d83fd436af0a1))
* **docker network:** lpolizzi: Made docker network use bridge driver to avoid unnecessary and potentially unsafe port exposure. ([5c4514c](https://github.com/hlefevregit/ft_transcendence/commit/5c4514c3da839380daed2d260f1e0a56c654ecc7))
* **docker network:** lpolizzi: Made docker network use bridge driver to avoid unnecessary and potentially unsafe port exposure. ([c067166](https://github.com/hlefevregit/ft_transcendence/commit/c067166b0e7692a0b551de6bbbd9817b49129baf))
* **docker network:** lpolizzi: Made docker network use bridge driver to avoid unnecessary and potentially unsafe port exposure. ([89bbba9](https://github.com/hlefevregit/ft_transcendence/commit/89bbba9cec3c575f51310f2e7b60b5bfdf811b12))
* **game logic:** lpolizzi: Continued implementing game logic with initial card dealing. Started working on buttons and states for the player choices. ([955cd1e](https://github.com/hlefevregit/ft_transcendence/commit/955cd1ee022a7369202e43a0dd897cad651c78a9))
* **game logic:** lpolizzi: Continued implementing game logic with initial card dealing. Started working on buttons and states for the player choices. ([4166c50](https://github.com/hlefevregit/ft_transcendence/commit/4166c50d0cb30fefbcb0d399b8cacde3a0488f13))
* **game logic:** lpolizzi: Continued to implement game logic. Need to implement initial card dealing for 1-2 players and dealer and interactive behavior with gui. Next step after that will be 3d graphics playability. ([c844d43](https://github.com/hlefevregit/ft_transcendence/commit/c844d43189cd5ddd8bfbe9d11f35b534961e09af))
* **game logic:** lpolizzi: Continued to implement game logic. Need to implement initial card dealing for 1-2 players and dealer and interactive behavior with gui. Next step after that will be 3d graphics playability. ([05d57c7](https://github.com/hlefevregit/ft_transcendence/commit/05d57c735803e709714c65a0faa987da64f84f8c))
* **game logic:** lpolizzi: Game logic is mostly done now. Stand button doesnt work for some reason, need to look into that. ([a5f7cf6](https://github.com/hlefevregit/ft_transcendence/commit/a5f7cf67943a44f93848130dfb1967f82d680583))
* **game logic:** lpolizzi: Game logic is mostly done now. Stand button doesnt work for some reason, need to look into that. ([2c47109](https://github.com/hlefevregit/ft_transcendence/commit/2c47109417283c315358b2056328ea441900ae5c))
* **game logic:** lpolizzi: Started implementing game logic with player and dealer card getting dealt 2 cards each. ([63a3703](https://github.com/hlefevregit/ft_transcendence/commit/63a3703e544dc548ad06aeb58c335e43a3f017d9))
* **game logic:** lpolizzi: Started implementing game logic with player and dealer card getting dealt 2 cards each. ([d95c55c](https://github.com/hlefevregit/ft_transcendence/commit/d95c55c7d97fc6e1fa5f7483462502a28b41b2c6))
* **gameOverGUI:** ldalmass: made a finished gamed GUI, replay button doesnt work rn, letting leo add the functionnality to it ([cd1714f](https://github.com/hlefevregit/ft_transcendence/commit/cd1714f4701b0de60febb3ce369279a9bc973ba3))
* **Global fluidity:** hulefevr: Removed some componnents to optimize the game ([03c7e28](https://github.com/hlefevregit/ft_transcendence/commit/03c7e28efc3e0a5c597a06a6dc4f7b65d374a9e6))
* **Global fluidity:** hulefevr: Removed some componnents to optimize the game ([e9eb5bd](https://github.com/hlefevregit/ft_transcendence/commit/e9eb5bd0a44c5d49faed18166a19e77609f441a9))
* **hot reload, blackjack logic, camera transitions:** lpolizzi: Rolled back to dev mode to be able to use hot reload. Updated blackjack logic to be correct and have less errors. Added camera transitions in blackjack game to see the table better. ([2dd86c9](https://github.com/hlefevregit/ft_transcendence/commit/2dd86c92d0102dab8ac32d3d69b187b9e35015c6))
* **map load time:** lpolizzi: Made map loading time way faster for blackjack. Also improved a bit for pong. ([8cbc759](https://github.com/hlefevregit/ft_transcendence/commit/8cbc759b66f3ff979926f631b5d92f1ffe2e77b6))
* **map:** lpolizzi: Finally fixed all textures in the map. Fixed walls not being high/long enough to hide the void when using different aspect ratios. ([39af310](https://github.com/hlefevregit/ft_transcendence/commit/39af3105770a8669ae94b2b86f8ba6231f064b1f))
* **memory management:** lpolizzi: Tried to fix memory leaks. Don't know if it fully works or not yet. ([5d9db56](https://github.com/hlefevregit/ft_transcendence/commit/5d9db5605ef088e740989457ea59a6aa5783737a))
* **naming:** lpolizzi: changed the variable naming for blackjack component. ([666cfe6](https://github.com/hlefevregit/ft_transcendence/commit/666cfe6866a58a9346063a4cdaef77ee6bf6fe99))
* **naming:** lpolizzi: changed the variable naming for blackjack component. ([2d5a4e6](https://github.com/hlefevregit/ft_transcendence/commit/2d5a4e668c2c18fdbaae25b0bf9f409d2ab9cc1f))
* **Online:** ldalmass: fixed GUI being glitched ([c6a5d91](https://github.com/hlefevregit/ft_transcendence/commit/c6a5d91e9239cf30e78d6a0db83fbd57e5666311))
* **Online:** ldalmass: fixed GUI being glitched ([5a9b547](https://github.com/hlefevregit/ft_transcendence/commit/5a9b547bbc17bd0b43a8eda518fd4edf2759068b))
* **perf & logic:** lpolizzi: Fixed performance by disabling meshes for the card by default. Removed split and double down features because they would be dumb without a betting function. Might reimplement later if I have the time. ([53c03b8](https://github.com/hlefevregit/ft_transcendence/commit/53c03b817918d7016abfa366c061f40a9db379da))
* **perf & logic:** lpolizzi: Fixed performance by disabling meshes for the card by default. Removed split and double down features because they would be dumb without a betting function. Might reimplement later if I have the time. ([419f125](https://github.com/hlefevregit/ft_transcendence/commit/419f1253c25b8ca1fda50acdcbedd3d216ee46b4))
* **scene disposal:** lpolizzi: Fixed scene not being disposed when going back to museum with return button in both games. ([bdbf959](https://github.com/hlefevregit/ft_transcendence/commit/bdbf95902ec44249b2095d82e5e5b6ea2a9df606))
* **scene disposal:** lpolizzi: Fixed scene not being disposed when going back to museum with return button in both games. ([9bacace](https://github.com/hlefevregit/ft_transcendence/commit/9bacacef89b93089ac52b380d5090c6a7a928a44))
* **scoresGUI:** ldalmass: Now P1 and P2 can track their total scores after each hit/stand. Dealer is at 0, will be fixed later ([b776d10](https://github.com/hlefevregit/ft_transcendence/commit/b776d10f8003ff8ee7ec9e04f07ad0ddb6767d01))
* **Scores:** ldalmass: added scores GUI but its unfinished ([d0003a8](https://github.com/hlefevregit/ft_transcendence/commit/d0003a886e6a567592377696c3ebebe2175b7455))
* **Standardisation:** lpolizzi: Standardised GLTF import function. Added playing card 3d model. ([c53b8d4](https://github.com/hlefevregit/ft_transcendence/commit/c53b8d4b084807425ea752de0f7c7d83a51020c7))
* **Standardisation:** lpolizzi: Standardised GLTF import function. Added playing card 3d model. ([56f8aae](https://github.com/hlefevregit/ft_transcendence/commit/56f8aae57797ef0723ad6a312d53a0f623058441))
* **stand:** lpolizzi: Fixed stand button not working. ([6917e4d](https://github.com/hlefevregit/ft_transcendence/commit/6917e4db77a14b79fe39c1899de9baa5dacfbd92))
* **stand:** lpolizzi: Fixed stand button not working. ([804efd5](https://github.com/hlefevregit/ft_transcendence/commit/804efd576477233aac3359b9b18e65d41b75441d))
* **Tournament:** added script of thmouty for the list of accessible url for google auth. Commented all tournament online code ([12204b7](https://github.com/hlefevregit/ft_transcendence/commit/12204b7b823ee80aad1af29f284203e4403ecf4d))
* **Tournament:** added script of thmouty for the list of accessible url for google auth. Commented all tournament online code ([6a6db6f](https://github.com/hlefevregit/ft_transcendence/commit/6a6db6fe5b8f5ae7012fcebe837a66176a077015))
* **Tournament:** ldalmass: Can now play all three games, but loops rn. Added finish button to bracketGUI and much more ([a64f81d](https://github.com/hlefevregit/ft_transcendence/commit/a64f81db40a039b1b50f4d9a4ce3a4901397b572))
* **Tournament:** ldalmass: Can now play all three games, but loops rn. Added finish button to bracketGUI and much more ([59d6414](https://github.com/hlefevregit/ft_transcendence/commit/59d641452b368bab7cfbd9a1f76562a1ea0485e7))
* **Tournament:** ldalmass: Fixed aliases not being add to the pong.current structure ([b38d332](https://github.com/hlefevregit/ft_transcendence/commit/b38d3322758bf0aec184b65ad2c692225b7726b7))
* **Tournament:** ldalmass: Fixed aliases not being add to the pong.current structure ([3c29740](https://github.com/hlefevregit/ft_transcendence/commit/3c29740af55dad29badcb27733d7e359590228f0))
* **Tournament:** ldalmass: fixed GUI not being reseted when abandonning the tournament ([9be9dd9](https://github.com/hlefevregit/ft_transcendence/commit/9be9dd9b53d8577f4ebb99231c242ec8f28fa7fb))
* **Tournament:** ldalmass: Tournament now plays all three games. TODO: Fix the scores displaying the correct aliases in each matches, Add the red/green outlines to finished matches in the bracketGUI, Add aliases to the final in the bracketGUI, Optimize performance because we re dipped again to th 40FPS. ([586a74e](https://github.com/hlefevregit/ft_transcendence/commit/586a74e0f50c0c8ee492d5e4007cf0247a43212d))
* **Tournament:** ldalmass: Tournament now plays all three games. TODO: Fix the scores displaying the correct aliases in each matches, Add the red/green outlines to finished matches in the bracketGUI, Add aliases to the final in the bracketGUI, Optimize performance because we re dipped again to th 40FPS. ([54cd1c7](https://github.com/hlefevregit/ft_transcendence/commit/54cd1c757140994dad138672536e0d63bbbd6073))
* **Tournament:** ldalmass: tournament WIP, fixed player 2 movement being disabled, changed lot of GUIs for the tournament ([465ac03](https://github.com/hlefevregit/ft_transcendence/commit/465ac035804d58d4b70f8c5683f38fb24b114f2d))
* **Tournament:** ldalmass: tournament WIP, fixed player 2 movement being disabled, changed lot of GUIs for the tournament ([22a3c1c](https://github.com/hlefevregit/ft_transcendence/commit/22a3c1ce11fee07f2967acff027717e763ca9ae3))
* **Transcendence Map:** ldalmass: incremented arena size again. Next update should be the last to add all the credits ([8ca7eb0](https://github.com/hlefevregit/ft_transcendence/commit/8ca7eb0c41fdb2118745200cd1dfd13a9b7f634d))
* **transitionToCamera():** ldalmass: tried to fix ([57eb85f](https://github.com/hlefevregit/ft_transcendence/commit/57eb85f987bd039eb66484b700bb17cd2bb49464))
* **transitionToCamera(:** ldalmass: its almost working, still need to figure out why it doesnt visually go to  state) ([0c78234](https://github.com/hlefevregit/ft_transcendence/commit/0c78234407844f5a6e57c63d7dc1eb11307c92bb))
* **transitionToCamera:** ldalmass: made a BlackJack Equivalent for the transitionToCamera() function ([86bb36e](https://github.com/hlefevregit/ft_transcendence/commit/86bb36e0afe0ee98c75228426058bc3d44b50ca3))
* **transitionToCamera:** ldalmass: removed the roll_over thingy in updateGUIsWhenNeeded(), it was blocking in_transition state to be set ([6c5aeca](https://github.com/hlefevregit/ft_transcendence/commit/6c5aecac1c974f5320694b0869ca881c941aaa66))
* **utils:** lpolizzi: Added utils function to acces individual card meshes easily. Also defined game logic in a comment in gamelogic.ts. ([534eac3](https://github.com/hlefevregit/ft_transcendence/commit/534eac3606b84e142a99ce2f733ef96a11835a80))
* **utils:** lpolizzi: Added utils function to acces individual card meshes easily. Also defined game logic in a comment in gamelogic.ts. ([94c9f11](https://github.com/hlefevregit/ft_transcendence/commit/94c9f11266b62b5eac7e870f71841018d4196bc3))
* **utils:** lpolizzi: Added utils function to acces individual card meshes easily. Also defined game logic in a comment in gamelogic.ts. ([c6b4297](https://github.com/hlefevregit/ft_transcendence/commit/c6b429768bd746b45a8635542c0777eb9153be1c))
* **utils:** lpolizzi: Added utils function to acces individual card meshes easily. Also defined game logic in a comment in gamelogic.ts. ([786981b](https://github.com/hlefevregit/ft_transcendence/commit/786981b649acc38f3c0c49b596a6cd6adeaa96fe))
* **VAULT:** hulefevr: vault now works for the backend ([bde51f7](https://github.com/hlefevregit/ft_transcendence/commit/bde51f725138864ee72d991e6c5d522d04e27d1c))
* **WIP Balance GUI:** ldalmass: Balance GUI now gets the current money with websocket, thx Hugo. Still work in progress ([afeabcc](https://github.com/hlefevregit/ft_transcendence/commit/afeabcccc253e6ec97b683b020a3093989cef189))


### Features

* **BabylonJS Setup:** ldalmass: Setup babylonjs working for the second game. Re-using GUI lib created by @MazeWave ([58d85ae](https://github.com/hlefevregit/ft_transcendence/commit/58d85ae0935f552ed5c26aaf40220ae3fe458023))
* **BabylonJS Setup:** ldalmass: Setup babylonjs working for the second game. Re-using GUI lib created by @MazeWave ([fe5c8ed](https://github.com/hlefevregit/ft_transcendence/commit/fe5c8ed7d6f62b912c155ea8500bf464fd4c0b49))
* **BlackJack:** hulefevr: Added balance to the backend ([33e5dcd](https://github.com/hlefevregit/ft_transcendence/commit/33e5dcd958e8560905edec5e52128221ae07245d))
* **BlackJack:** hulefevr: Added balance to the backend ([357dc24](https://github.com/hlefevregit/ft_transcendence/commit/357dc24112d8100344ed217e3f53e9907a471056))
* **BlackJack:** ldalmass: Added a balance to see how much debt you have (not linked to the database for now) ([843e6dd](https://github.com/hlefevregit/ft_transcendence/commit/843e6ddb0b6d939e54b06ed7a21281a7d1b6a36b))
* **BlackJack:** ldalmass: Added a balance to see how much debt you have (not linked to the database for now) ([08bc8fe](https://github.com/hlefevregit/ft_transcendence/commit/08bc8fe1c240fc4f331b2d1161b3cfb9e7d467fa))
* **blackjack:** lpolizzi: Fixed debug menu and tried to make the map work. ([2664974](https://github.com/hlefevregit/ft_transcendence/commit/266497407372393b64de105716392840dc67ce72))
* **blackjack:** lpolizzi: Fixed debug menu and tried to make the map work. ([f1ab68d](https://github.com/hlefevregit/ft_transcendence/commit/f1ab68de3c6c00bc555e6ab5227e8fd821e1909e))
* **Easter Egg:** hulefevr: Added the easter egg as a microservice so it can be up whenever wherever ([b90c9e3](https://github.com/hlefevregit/ft_transcendence/commit/b90c9e3739c04a3090b57f1dfe85e8fe6bfb3e92))
* **Easter Egg:** hulefevr: Added the easter egg as a microservice so it can be up whenever wherever ([7460a38](https://github.com/hlefevregit/ft_transcendence/commit/7460a38f50b916edb3fad1094adf5e9e4b54a84c))
* **Easter egg:** hulefevr: easter egg added and the route for it too ([93cfe95](https://github.com/hlefevregit/ft_transcendence/commit/93cfe9580b68549f2ac97f7d76dfaf0030545e04))
* **Easter egg:** hulefevr: easter egg added and the route for it too ([a90e771](https://github.com/hlefevregit/ft_transcendence/commit/a90e7713b29e1743e4580fd592fe4eb50f1f0636))
* **Easter Egg:** hulefevr: easter egg for tacounet added ([3e1b539](https://github.com/hlefevregit/ft_transcendence/commit/3e1b539321a935620e47871df0e9d7f605a527d2))
* **Easter Egg:** hulefevr: easter egg for tacounet added ([ba4436a](https://github.com/hlefevregit/ft_transcendence/commit/ba4436a62abf20312ccc723ed9e7f168a369ebac))
* **GameModeGUI:** ldalmass: created a new GUI to select solo or duo ([c681ed7](https://github.com/hlefevregit/ft_transcendence/commit/c681ed74f81ed977ad85c8756459e54b23833c89))
* **GameModeGUI:** ldalmass: created a new GUI to select solo or duo ([8d76607](https://github.com/hlefevregit/ft_transcendence/commit/8d766071d27b5805947f9b61d62c25b3b864e85b))
* **gitignore:** lpolizzi: Added backend logs to gitignore. ([a9ad28f](https://github.com/hlefevregit/ft_transcendence/commit/a9ad28f8c68830dc0aea74f4b208e4b3d3236042))
* **gitignore:** lpolizzi: Added backend logs to gitignore. ([0fbee42](https://github.com/hlefevregit/ft_transcendence/commit/0fbee422082f4c19acb714031e9db9de54c0a6fe))
* **NEW CARDS:** ldalmass: Made cards GLTF with all mirroring possible : normal, vertical, horizontal, vertical + horizontal ([566e7a9](https://github.com/hlefevregit/ft_transcendence/commit/566e7a957d26e1fb36014c13599b4017e27c09c0))
* **Optimized Cards:** ldalmass: Optimized cards meshes : 33% less vertex. Optimized Card's texture : 4096x4096 -> 512x512. Revamped card's textures to be pixel friendly and hand-made ([588d9cc](https://github.com/hlefevregit/ft_transcendence/commit/588d9cc80af37af9c105c5a7837eda435686ffce))
* **play button:** lpolizzi: Made play button start a game. Need to implement game logic and game animations now. ([5b01f93](https://github.com/hlefevregit/ft_transcendence/commit/5b01f93060a670a0e0561440e377bda74175cb41))
* **play button:** lpolizzi: Made play button start a game. Need to implement game logic and game animations now. ([38b4469](https://github.com/hlefevregit/ft_transcendence/commit/38b446984a4a2e745bb749f546ee312e581e05ba))
* **REMOTE:** hulefevr: Remote checked, google sign in to enhanced ([9911f9a](https://github.com/hlefevregit/ft_transcendence/commit/9911f9ac7fd62e40d76b173d91f6b22063936400))
* **TOURNAMENT: Added aliases for all four players:** ldalmass ([07b3024](https://github.com/hlefevregit/ft_transcendence/commit/07b3024016201041d9bf098160184effe35aca65))
* **TOURNAMENT: Added aliases for all four players:** ldalmass ([71d48c1](https://github.com/hlefevregit/ft_transcendence/commit/71d48c121aa9a02c2d370cbb7ab59250cea88a73))
* **Tournament): ldalmass: Tournament almost finished: All three games are working fine. Aliases input works, even if its empty. BracketGUI correctly shows the next match (Yellow outline), and the overall progression: Green outline = winner, Red outline = looser. Aliases and score are correctly updated while in_game state: arenaGUI gets properly updated. TODO: fix the Player 1 and Player 2 still appearing in the finishedGameGUI, caused because of translations. fix(Ball Movement) becoming slow with the lag, it has now been moved in the bacjgroundCalculations() loop. fix(GUI Lag:** Removed the 200ms update functions to reduce lag (gaining ~0FPS) ([d9558fe](https://github.com/hlefevregit/ft_transcendence/commit/d9558fe5c4c9af57414379fce47a346a333afe8b))
* **Tournament): ldalmass: Tournament almost finished: All three games are working fine. Aliases input works, even if its empty. BracketGUI correctly shows the next match (Yellow outline), and the overall progression: Green outline = winner, Red outline = looser. Aliases and score are correctly updated while in_game state: arenaGUI gets properly updated. TODO: fix the Player 1 and Player 2 still appearing in the finishedGameGUI, caused because of translations. fix(Ball Movement) becoming slow with the lag, it has now been moved in the bacjgroundCalculations() loop. fix(GUI Lag:** Removed the 200ms update functions to reduce lag (gaining ~0FPS) ([5d67f7f](https://github.com/hlefevregit/ft_transcendence/commit/5d67f7ffe1ed72665a4fecca86d0fecbbcf1df06))
* **Views:** route game2 done, museum place done also ([6156c21](https://github.com/hlefevregit/ft_transcendence/commit/6156c21d9b8d9fb1b9e5521732c60b816283f29d))
* **Views:** route game2 done, museum place done also ([f5ad33a](https://github.com/hlefevregit/ft_transcendence/commit/f5ad33abb7eb7f553f33fc984779e4bae6b87a26))

# [1.7.0](https://github.com/hlefevregit/ft_transcendence/compare/1.6.0...1.7.0) (2025-06-27)


### Bug Fixes

* **Vault:** token for backend pong game encrypted ([28dc067](https://github.com/hlefevregit/ft_transcendence/commit/28dc067b8ccf799c1bdece955464635a0f72de73))


### Features

* **WAF/Vault:** hulefevr: merged branch WAF/HashiCorp done by lpolizzi ([f4b9248](https://github.com/hlefevregit/ft_transcendence/commit/f4b9248a7f7250327243d317eb39f20c4dea9196))

# [1.6.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.5.0...1.6.0) (2025-06-17)


### Bug Fixes

* **GUI not displaying on multiple states:** ldalmass ([a6ea0c6](https://github.com/hlefevregit/ft_transcendence/commit/a6ea0c65681a9f976824f1137c2c079a39ee8a50))


### Features

* **Tournament:** hulefevr: Tournament done until final, this feature will be stopped for now until local tournament is finished ([acc8cbb](https://github.com/hlefevregit/ft_transcendence/commit/acc8cbbf132eeaa660fa5296eb5855d0f1954c28))

# [1.6.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.5.0...v1.6.0) (2025-06-17)


### Bug Fixes

* **GUI not displaying on multiple states:** ldalmass ([a6ea0c6](https://github.com/hlefevregit/ft_transcendence/commit/a6ea0c65681a9f976824f1137c2c079a39ee8a50))


### Features

* **Tournament:** hulefevr: Tournament done until final, this feature will be stopped for now until local tournament is finished ([acc8cbb](https://github.com/hlefevregit/ft_transcendence/commit/acc8cbbf132eeaa660fa5296eb5855d0f1954c28))

# [1.6.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.5.0...v1.6.0) (2025-06-17)


### Bug Fixes

* **GUI not displaying on multiple states:** ldalmass ([a6ea0c6](https://github.com/hlefevregit/ft_transcendence/commit/a6ea0c65681a9f976824f1137c2c079a39ee8a50))


### Features

* **Tournament:** hulefevr: Tournament done until final, this feature will be stopped for now until local tournament is finished ([acc8cbb](https://github.com/hlefevregit/ft_transcendence/commit/acc8cbbf132eeaa660fa5296eb5855d0f1954c28))

# [1.5.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.4.1...v1.5.0) (2025-06-13)


### Features

* **SFX on buttons:** ldalmass, music and sfx volume are not tied ([948f4db](https://github.com/hlefevregit/ft_transcendence/commit/948f4dbbbce473823f62e24912b0605951bd80e9))

## [1.4.1](https://github.com/hlefevregit/ft_transcendence/compare/v1.4.0...v1.4.1) (2025-06-13)


### Bug Fixes

* **fixed roomListGUI randomly not showing:** ldalmass ([c3578e6](https://github.com/hlefevregit/ft_transcendence/commit/c3578e6056b4997808ec3b206fb28beb157da4e6))

# [1.4.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.3.0...v1.4.0) (2025-06-13)


### Features

* **GRAND MÉNAGE DE PRINTEMPS PART II:** ldalmass: more cleaning ([8bafb22](https://github.com/hlefevregit/ft_transcendence/commit/8bafb22a18ac569f11df7a6698da50de1c7abbca))

# [1.3.0](https://github.com/hlefevregit/ft_transcendence/compare/v1.2.2...v1.3.0) (2025-06-12)


### Features

* **GRAND MÉNAGE DE PRINTEMPS:** ldalmass: Renamed existing files, created new one, moved functions around, GRAND MÉNAGE DE PRINTEMPS ([ad016af](https://github.com/hlefevregit/ft_transcendence/commit/ad016af34233e98d5b38de06c11736ce1c36c1a9))

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
