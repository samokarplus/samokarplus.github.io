# Crazy Eights

Live page: https://samo.karplus.org/crazy8s/

This static game supports 2–4 humans through a shared room URL. Open the page, enter a name, create a room, copy the invite link, and deal once friends join. The homepage has a Crazy Eights link and play button.

Rules: one 52-card deck, seven cards each for two players or five each for three/four. Match rank or active suit. Eights are wild and require a suit choice. Draw until a playable card is found, then play it. Recycle the discards while retaining the top card. Pass only when no draw or play is available. First empty hand wins; a fully blocked game uses the lowest remaining hand score.

## Architecture

- boardgame.io runs the game state, turn order, move validation, shuffling, and game-over flow in the host browser.
- PeerJS brokers WebRTC connections through its public cloud signaling service. Cards and moves travel between players' browsers; this repo runs no application server.
- The host is authoritative and sees the full deck. Guests receive only their own hand and public counts. This is a friends' game, not a cheating-resistant competitive service.
- Rooms pause if a seated player disconnects. Guests can reconnect with their session token in the same browser tab. Host refresh restores the saved deck, hands, turn, and scores from session storage; players reconnect to it. Closing the host tab ends the room unless it is restored in that same browser session.
- Some restrictive networks block WebRTC, and signaling depends on PeerJS Cloud availability. Failed connections show a reconnect control. No camera/microphone access or paid service is required.
- The game page has no analytics script, accounts, or public room directory. Anyone who has a room URL can join available lobby seats.

## Development

From this directory:

```sh
npm ci
npm test
npm run build
```

Serve the repository root, for example with `python3 -m http.server 8768`, and open `http://localhost:8768/crazy8s/`. Commit the generated `app.js` with source changes; GitHub Pages serves the prebuilt bundle and does not run npm. The deployment contains no Node server. Tests cover 52-card conservation, 2–4 player rounds, drawing, recycling, wins, suit changes, private views, and refresh restoration.

Dependencies: [boardgame.io](https://github.com/boardgameio/boardgame.io) (MIT), [PeerJS](https://github.com/peers/peerjs) (MIT), and [Lucide](https://github.com/lucide-icons/lucide) (ISC). Browser dependencies are bundled, including upstream license comments. Server/UI packages included by boardgame.io's npm dependency tree are not run by this static site.
