    class EnergyAPI {
        constructor(url, onDataCallback, onStatusChangeCallback) {
            this.url = url;
            this.onData = onDataCallback;
            this.onStatusChange = onStatusChangeCallback;
            this.connect();
        }

        connect() {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => this.onStatusChange(true);
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.onData(data);
            };

            this.socket.onclose = () => {
                this.onStatusChange(false);
                setTimeout(() => this.connect(), 5000);
            };
        }
    }