Bun.serve({
  port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      if (server.upgrade(req)) {
        return; // Upgrade successful, don't return Response
      }
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    return new Response("Hello via Bun!");
  },
  websocket: {
    async message(ws, message) {
      console.log(`Received ${message}`);
      ws.send(`You said: ${message}`);
    },
  }
})