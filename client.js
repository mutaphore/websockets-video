
try {
    const socket = new WebSocket("ws://localhost:8001");
} catch (e) {
    console.log(e);
}