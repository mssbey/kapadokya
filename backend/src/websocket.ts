import { WebSocketServer, WebSocket } from 'ws';
import { redis } from './lib/redis';

interface WSClient {
  ws: WebSocket;
  tourId?: string;
}

const clients: Set<WSClient> = new Set();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws, req) => {
    const client: WSClient = { ws };
    clients.add(client);

    console.log(`WebSocket client connected. Total: ${clients.size}`);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'subscribe' && message.tourId) {
          client.tourId = message.tourId;
        }
      } catch {
        // Invalid message
      }
    });

    ws.on('close', () => {
      clients.delete(client);
      console.log(`WebSocket client disconnected. Total: ${clients.size}`);
    });

    ws.on('error', () => {
      clients.delete(client);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
  });
}

export function broadcastAvailabilityUpdate(tourId: string, date: string, seatsAvailable: number) {
  const message = JSON.stringify({
    type: 'availability_update',
    tourId,
    date,
    seatsAvailable,
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      if (!client.tourId || client.tourId === tourId) {
        client.ws.send(message);
      }
    }
  });
}

export function broadcastBookingNotification(data: {
  tourTitle: string;
  guestName: string;
  date: string;
}) {
  const message = JSON.stringify({
    type: 'new_booking',
    data: {
      tourTitle: data.tourTitle,
      location: 'Cappadocia',
      timeAgo: 'just now',
    },
    timestamp: Date.now(),
  });

  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}
