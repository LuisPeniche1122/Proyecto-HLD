export class WebSocketClient {
    private ws: WebSocket | null = null;
    private readonly wsUrl = import.meta.env.VITE_WS_URL;

    connect(
        roomCode: string, 
        token: string, 
        onUpdate: (state: any) => void, 
        onError: (error: Error) => void
    ): void {
        // Evitamos abrir múltiples conexiones
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.ws = new WebSocket(`${this.wsUrl}/rooms/play/${roomCode}?token=${token}`);

        this.ws.onmessage = (event) => {
            try {
                const state = JSON.parse(event.data);
                onUpdate(state);
            } catch (e) {
                console.error("Error parseando el estado de la sala:", e);
            }
        };

        this.ws.onerror = () => {
            onError(new Error("Error de red. No se pudo conectar a la sala."));
        };

        this.ws.onclose = (event) => {
            if (event.code !== 1000 && event.code !== 1005) {
                onError(new Error(event.reason || "Conexión cerrada por el servidor."));
            }
            this.ws = null;
        };
    }

    sendEvent(action: string, payload: object = {}): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error(`No se puede enviar '${action}': WebSocket desconectado.`);
            return;
        }
        this.ws.send(JSON.stringify({ action, ...payload }));
    }

    disconnect(): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            this.ws.close(1000, "Saliendo de la sala");
            this.ws = null;
        }
    }
}

// Exportamos un Singleton para que todos los Gateways usen exactamente el mismo tubo de red
export const sharedWsClient = new WebSocketClient();