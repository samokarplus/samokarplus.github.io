# Crazy Eights

Live page: https://samo.karplus.org/crazy8s/

Choose **1 player + bot** to play against **Mr. Samo the Crazy 8 bot!**. Solo play starts immediately and runs locally without PeerJS or an invite link. The bot uses only its own hand, plays legal cards, draws one at a time until playable, and chooses the suit it has most of when playing an eight. Solo rounds and championships retain the same rules, shouts, animations, celebrations, and refresh recovery.

This static game supports 2–4 humans through a shared room URL. Open the page, enter a name, create a room, copy the invite link, and deal once friends join. The homepage has a Crazy Eights link and play button.

Rules: one 52-card deck, seven cards each for two players or five each for three/four. Match rank or active suit. Eights are wild and require a suit choice. Click the deck to draw one card at a time until a playable card is found, then play it. Recycle the discards while retaining the top card. Pass only when no draw or play is available. First empty hand wins; a fully blocked game uses the lowest remaining hand score.

Setup includes background and table color swatches plus custom color pickers. The host's colors are shared with guests and saved for room refreshes. Printed pip layouts, illustrated court cards, patterned card backs, and deal/draw/play animations are included; animations respect reduced-motion preferences.

**Host a championship** starts a race to 3, 5, or 7 round wins. Standings and scores are shared and restored after refresh. The host deals the next round after each finish; a unique leader who reaches the target is the champion. If a blocked round creates tied leaders at the target, play continues until one leads. A new championship resets wins while keeping the room and players.

Playing an eight opens symbol buttons for **Espadios ♠**, **Clubitos ♣**, **Ziamondes ♦**, and **Heartitos ♥**. A successful suit choice automatically broadcasts the player's suit shout to everyone.

All players can send the long suit names or **ESPA**, **BITOS**, **TITOS**, and **ZIA**, plus laughing, surprised, and sunglasses emoji reactions. The reaction picker also includes **DRAWFEST**, **Woo! Keep drawing buddy!** with a hand beckoning toward the deck, and **DONT EVER TELL ME I CANT CUZ I PROBABLY CAN AND I PROBABLY WILL**. Three or more consecutive draws show a public DRAWFEST counter. Manual taunts have a two-second cooldown per player and incoming reactions can be muted locally. Taunts never change cards, turn order, or scores.

Match point shows **CHAMPIONSHIP ROUND**. Tied match-point leaders show **SUDDEN DEATH**, including 6–6 in a race to seven. Round winners get a trophy and confetti; the championship winner is named with final standings. Effects respect reduced-motion preferences.

## Architecture

**Jackquetta**, **Kinguetta**, **Trece**, and **Seisy** are available as manual taunts and are automatically exclaimed after a valid Jack, King, 3, or 6 is played, respectively. Speech bubbles now appear prominently between the players and draw pile with a player badge. The labeled **Taunts** button opens all reactions, including **I've got responses. I've got responses**.

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
