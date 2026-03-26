# Peer Pathfinder

A two-app demo showing real-time peer-to-peer communication between a Game Master dashboard and a Player view, built with Vue 3 + Vite + PeerJS. Character data (initiative, HP, AC, conditions) flows directly between browsers with no backend server.

---

## How PeerJS works in this project

### What is PeerJS?

PeerJS is a library that wraps the browser's WebRTC API to give you a simple, event-driven interface for peer-to-peer connections. Two browsers can send data directly to each other once they've been introduced — that introduction happens via a free public signaling server that PeerJS provides by default.

The flow looks like this:

```
Browser A                  Signaling Server               Browser B
   |                             |                             |
   |-- "I'm open, my ID is X" -->|                             |
   |                             |<-- "I'm open, my ID is Y" --|
   |                             |                             |
   |-- "Connect me to Y" ------->|-- "A wants to connect" ---->|
   |<------- WebRTC handshake (ICE/SDP negotiation) ---------->|
   |                                                           |
   |<=============== direct data channel open ================>|
```

Once the data channel is open, the signaling server is no longer involved. All messages go directly between the two browsers.

---

### Step 1 — Creating a Peer

Both apps create a `Peer` instance on load. This registers them with the signaling server and generates a unique ID.

```js
// gm-app/src/composables/usePeer.js
import { Peer } from 'peerjs'

const peer = new Peer()

peer.on('open', id => {
  // id is a unique string like "a1b2c3d4-..."
  // Store it so the player app can find it
  localStorage.setItem('gm-peer-id', id)
})
```

The `open` event fires once the signaling server has acknowledged the peer. Until then, no connections can be made.

---

### Step 2 — The GM listens for incoming connections

The GM app is the "host" side. It listens for connections using the `connection` event on the `Peer` instance.

```js
// gm-app/src/composables/usePeer.js
peer.on('connection', incoming => {
  setupConn(incoming, onData)
})
```

`setupConn` attaches the event handlers that manage the connection lifecycle:

```js
function setupConn(c, onData) {
  conn.value = c

  c.on('open', () => {
    connectionStatus.value = 'connected'
    // Connection is ready — broadcast current state to the new player
  })

  c.on('data', data => {
    onData?.(data)
  })

  c.on('close', () => {
    connectionStatus.value = 'disconnected'
    conn.value = null
  })
}
```

---

### Step 3 — The Player connects to the GM

The player app is the "client" side. It initiates the connection by calling `peer.connect()` with the GM's peer ID.

```js
// player-app/src/composables/usePeer.js
function connectTo(peerId, onData) {
  const c = peer.connect(peerId)

  c.on('open', () => {
    connectionStatus.value = 'connected'
  })

  c.on('data', data => {
    onData?.(data)
  })

  c.on('close', () => {
    connectionStatus.value = 'disconnected'
  })
}
```

`peer.connect()` returns a `DataConnection` object immediately, but it isn't usable until the `open` event fires.

---

### Step 4 — Sharing the GM's Peer ID

For the player to connect, it needs to know the GM's peer ID. This project handles it two ways:

**Same browser (localStorage)**

When the GM's peer ID is generated, it's written to `localStorage`:

```js
// gm-app/src/composables/usePeer.js
peer.on('open', id => {
  localStorage.setItem('gm-peer-id', id)
})
```

When the player app loads in the same browser, it reads it back and auto-connects:

```js
// player-app/src/App.vue
init(handleData, () => {
  const stored = localStorage.getItem('gm-peer-id')
  if (stored) connectTo(stored, handleData)
})
```

**Different browsers (URL param)**

The GM's "Open Player App" button appends the peer ID as a query parameter:

```js
// gm-app/src/App.vue
const url = `${playerBaseUrl}/?gmPeerId=${myPeerId.value}`
window.open(url, '_blank')
```

The player app reads it from the URL on load:

```js
// player-app/src/App.vue
const params = new URLSearchParams(window.location.search)
const paramId = params.get('gmPeerId')
if (paramId) gmPeerId.value = paramId
```

The URL param takes priority; localStorage is the fallback.

---

### Step 5 — Sending data

Once connected, both sides can call `conn.send()` with any serialisable JavaScript value. PeerJS handles serialisation automatically.

This project uses a typed message format so the receiver knows what to do with each message:

```js
// Send a full state snapshot when a player first connects
conn.send({
  type: 'full_sync',
  characters: characters.value.map(c => ({ ...c }))
})

// Send a single character update (HP change, condition toggled, etc.)
conn.send({
  type: 'update',
  character: { ...char }
})

// Tell the player to remove a character
conn.send({
  type: 'remove',
  id: char.id
})
```

---

### Step 6 — Receiving and handling data

The player app's `handleData` function switches on the message type and updates local state accordingly:

```js
// player-app/src/App.vue
function handleData(data) {
  if (data.type === 'full_sync') {
    // Replace entire character list on first connect
    characters.value = data.characters

  } else if (data.type === 'update') {
    // Update existing character or add if new
    const idx = characters.value.findIndex(c => c.id === data.character.id)
    if (idx !== -1) characters.value[idx] = data.character
    else characters.value.push(data.character)

  } else if (data.type === 'remove') {
    characters.value = characters.value.filter(c => c.id !== data.id)
  }
}
```

Because Vue's reactivity system is watching `characters`, the UI updates automatically whenever this function runs.

---

### The `usePeer` composable

Both apps extract all PeerJS logic into a `usePeer` composable so the Vue components stay clean. The composable owns the `Peer` instance and exposes only what the component needs:

```js
return {
  myPeerId,        // ref<string> — this peer's ID
  connectionStatus, // ref<'disconnected'|'waiting'|'connected'>
  statusMessage,   // ref<string> — human-readable status
  log,             // ref<string[]> — event log for debugging
  init,            // (onData) => void — creates the Peer, starts listening
  connectTo,       // (peerId, onData, onConnected?) => void
  send,            // (data) => void — sends if connected, no-ops otherwise
  disconnect,      // () => void
}
```

The GM and player versions differ slightly — the GM's `init` also listens for incoming connections, while the player's `init` accepts an `onReady` callback that fires once the peer ID is available (needed for auto-connect on load).

---

## Project structure

```
peer-pathfinder/
├── gm-app/                        # Game Master dashboard
│   └── src/
│       ├── composables/usePeer.js  # PeerJS logic — host side
│       ├── components/
│       │   ├── ConnectionPanel.vue
│       │   ├── AddCharacterPanel.vue
│       │   └── CharacterCard.vue
│       └── App.vue
└── player-app/                    # Player view
    └── src/
        ├── composables/usePeer.js  # PeerJS logic — client side
        ├── components/
        │   └── CharacterRow.vue
        └── App.vue
```

## Running locally

```bash
# Terminal 1
cd peer-pathfinder/gm-app && npm run dev    # http://localhost:5173

# Terminal 2
cd peer-pathfinder/player-app && npm run dev  # http://localhost:5174
```

Open the GM app first, then click "Open Player App". If both are in the same browser the player connects automatically via localStorage.
