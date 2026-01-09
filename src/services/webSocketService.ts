// 📱 SERVICIO WEBSOCKET HÍBRIDO - QR FRONT
// Conexión WebSocket para sincronización en tiempo real

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, ENVIRONMENT } from '../config-hybrid';

// 🌐 Tipos de eventos (mismos que Product App)
export interface QRWebSocketEvents {
  // Conexión
  welcome: {
    socketId: string;
    serverTime: string;
    system: string;
    features: {
      sync: boolean;
      notifications: boolean;
      realTime: boolean;
    };
  };

  // Usuarios
  'user:joined': {
    userId: string;
    socketId: string;
    timestamp: string;
  };

  'user:left': {
    socketId: string;
    timestamp: string;
  };

  'user:disconnected': {
    socketId: string;
    reason: string;
    timestamp: string;
  };

  // Sincronización
  'sync:incoming': {
    source: string;
    targetSystem: string;
    data: any;
    timestamp: string;
  };

  'sync:response': {
    data: any;
    sourceSystem: string;
    timestamp: string;
  };

  // Órdenes
  'order:created': {
    _id: string;
    source: string;
    timestamp: string;
    [key: string]: any;
  };

  'order:status_changed': {
    orderId: string;
    status: string;
    source: string;
    timestamp: string;
  };

  // Tickets
  'ticket:created': {
    _id: string;
    source: string;
    timestamp: string;
    [key: string]: any;
  };

  // Notificaciones
  'notification:receive': {
    type: string;
    title: string;
    message: string;
    timestamp: string;
    [key: string]: any;
  };

  // Heartbeat
  pong: {
    timestamp: string;
    server: string;
  };
}

// 📱 Estado de conexión
export enum QRConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// 🔄 Servicio WebSocket QR
class QRHybridWebSocketService {
  private socket: Socket | null = null;
  private connectionStatus: QRConnectionStatus = QRConnectionStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: any = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  // 🚀 Conectar al servidor WebSocket
  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.connectionStatus = QRConnectionStatus.CONNECTING;
      console.log(`🔌 Conectando QR WebSocket: ${API_BASE_URL}`);

      // Configurar opciones de conexión
      const socketOptions: any = {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      };

      // Agregar autenticación si hay userId
      if (userId) {
        socketOptions.auth = { userId };
      }

      this.socket = io(API_BASE_URL, socketOptions);

      // Eventos de conexión
      this.socket.on('connect', () => {
        console.log(`✅ QR WebSocket conectado: ${this.socket?.id}`);
        this.connectionStatus = QRConnectionStatus.CONNECTED;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection:changed', this.connectionStatus);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión QR WebSocket:', error);
        this.connectionStatus = QRConnectionStatus.ERROR;
        this.emit('connection:changed', this.connectionStatus);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`❌ QR WebSocket desconectado: ${reason}`);
        this.connectionStatus = QRConnectionStatus.DISCONNECTED;
        this.stopHeartbeat();
        this.emit('connection:changed', this.connectionStatus);
        
        if (reason === 'io server disconnect') {
          // El servidor desconectó intencionalmente, reconectar manualmente
          this.connect(userId);
        } else {
          // Desconexión de red, intentar reconectar
          this.handleReconnect();
        }
      });

      // Eventos de bienvenida
      this.socket.on('welcome', (data: QRWebSocketEvents['welcome']) => {
        console.log('🎉 Bienvenida QR recibida:', data);
        this.emit('welcome', data);
      });

      // Eventos de sincronización
      this.socket.on('sync:incoming', (data: QRWebSocketEvents['sync:incoming']) => {
        console.log('🔄 Datos de sincronización QR recibidos:', data);
        this.emit('sync:incoming', data);
      });

      this.socket.on('sync:response', (data: QRWebSocketEvents['sync:response']) => {
        console.log('🔄 Respuesta de sincronización QR:', data);
        this.emit('sync:response', data);
      });

      // Eventos de negocio QR
      this.socket.on('order:created', (data: QRWebSocketEvents['order:created']) => {
        console.log('📝 Orden QR creada en tiempo real:', data._id);
        this.emit('order:created', data);
      });

      this.socket.on('order:status_changed', (data: QRWebSocketEvents['order:status_changed']) => {
        console.log('📝 Estado de orden QR cambiado:', data.orderId);
        this.emit('order:status_changed', data);
      });

      this.socket.on('ticket:created', (data: QRWebSocketEvents['ticket:created']) => {
        console.log('🎫 Ticket QR creado en tiempo real:', data._id);
        this.emit('ticket:created', data);
      });

      // Notificaciones
      this.socket.on('notification:receive', (data: QRWebSocketEvents['notification:receive']) => {
        console.log('🔔 Notificación QR recibida:', data.type);
        this.emit('notification:receive', data);
      });

      // Heartbeat
      this.socket.on('pong', (data: QRWebSocketEvents['pong']) => {
        console.log('💓 Heartbeat QR recibido:', data.server);
      });
    });
  }

  // 🛑 Desconectar
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.stopHeartbeat();
    this.connectionStatus = QRConnectionStatus.DISCONNECTED;
    this.emit('connection:changed', this.connectionStatus);
    console.log('🛑 QR WebSocket desconectado manualmente');
  }

  // 📱 Unirse a sala
  joinRoom(room: string, userId?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join:room', { room, userId, system: 'qr-app' });
      console.log(`📱 QR Uniéndose a sala: ${room}`);
    }
  }

  // 🚪 Salir de sala
  leaveRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave:room', { room });
      console.log(`🚪 QR Saliendo de sala: ${room}`);
    }
  }

  // 🔄 Enviar solicitud de sincronización
  requestSync(data: any, targetSystem: string): void {
    if (this.socket?.connected) {
      this.socket.emit('sync:request', { data, targetSystem });
      console.log(`🔄 QR Solicitando sincronización con: ${targetSystem}`);
    }
  }

  // 📢 Enviar evento personalizado
  emit(event: string, data: any): void {
    // Notificar a listeners locales
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error en listener de evento QR ${event}:`, error);
        }
      });
    }

    // Enviar al servidor si está conectado
    if (this.socket?.connected && this.eventListeners.has(event)) {
      this.socket.emit(event, data);
    }
  }

  // 👂 Escuchar eventos
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  // 🚫 Dejar de escuchar eventos
  off(event: string, listener?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (listener) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  // 📊 Obtener estado de conexión
  getConnectionStatus(): QRConnectionStatus {
    return this.connectionStatus;
  }

  // 🔍 Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 💓 Iniciar heartbeat
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Cada 30 segundos
  }

  // 💓 Detener heartbeat
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 🔄 Manejar reconexión
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de intentos de reconexión QR alcanzado');
      return;
    }

    this.reconnectAttempts++;
    this.connectionStatus = QRConnectionStatus.RECONNECTING;
    this.emit('connection:changed', this.connectionStatus);

    console.log(`🔄 QR Reintentando conectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // 🎛️ Configurar event listeners internos
  private setupEventListeners(): void {
    // Listener para cambios de conexión
    this.on('connection:changed', (status: QRConnectionStatus) => {
      console.log(`📊 Estado de conexión QR cambiado: ${status}`);
    });
  }
}

// 🚀 Exportar instancia única
export const qrWebSocketService = new QRHybridWebSocketService();
export default qrWebSocketService;
