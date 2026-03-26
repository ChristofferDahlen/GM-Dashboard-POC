import { ref } from 'vue'
import { Peer } from 'peerjs'

export function usePeer() {
  const myPeerId = ref('')
  const connectionStatus = ref('disconnected')
  const statusMessage = ref('Not connected')
  const conn = ref(null)
  const log = ref([])
  let peer = null

  function addLog(msg) {
    const time = new Date().toLocaleTimeString()
    log.value.unshift(`[${time}] ${msg}`)
    if (log.value.length > 50) log.value.pop()
  }

  function init(onData) {
    peer = new Peer()
    peer.on('open', id => {
      myPeerId.value = id
      localStorage.setItem('gm-peer-id', id)
      addLog(`Your Peer ID: ${id}`)
    })
    peer.on('connection', incoming => {
      setupConn(incoming, onData)
      addLog(`Incoming connection from ${incoming.peer}`)
    })
    peer.on('error', err => addLog(`Peer error: ${err.message}`))
  }

  function setupConn(c, onData) {
    conn.value = c
    connectionStatus.value = 'waiting'
    statusMessage.value = 'Connecting...'

    c.on('open', () => {
      connectionStatus.value = 'connected'
      statusMessage.value = `Connected to ${c.peer}`
      addLog(`Connected to ${c.peer}`)
    })
    c.on('data', data => {
      addLog(`Received: ${data.type}`)
      onData?.(data)
    })
    c.on('close', () => {
      connectionStatus.value = 'disconnected'
      statusMessage.value = 'Disconnected'
      conn.value = null
      addLog('Connection closed')
    })
  }

  function connectTo(peerId, onData, onConnected) {
    if (!peer || !peerId) return
    const c = peer.connect(peerId)
    setupConn(c, onData)
    c.on('open', () => onConnected?.())
  }

  function send(data) {
    if (conn.value && connectionStatus.value === 'connected') {
      conn.value.send(data)
    }
  }

  function disconnect() {
    conn.value?.close()
  }

  return { myPeerId, connectionStatus, statusMessage, conn, log, init, connectTo, send, disconnect, addLog }
}
