// 🔄 SERVICIO DE SINCRONIZACIÓN QR FRONT
// Maneja la sincronización entre local y nube para el sistema QR

import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, SYNC_CONFIG, ENVIRONMENT } from '../config-hybrid';

// 📊 Tipos de datos para sincronización
export interface QRSyncData {
  orders: any[];
  tickets: any[];
  tables: any[];
  products: any[];
  lastSync: string;
  timestamp: number;
}

export interface QRBackupData {
  source: 'cloud' | 'local';
  data: QRSyncData;
  compressed: boolean;
}

// 🔄 Estado de sincronización
export enum QRSyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// 📱 Servicio de sincronización QR
class QRSyncService {
  private status: QRSyncStatus = QRSyncStatus.IDLE;
  private lastSyncTime: number = 0;
  private syncInterval: any = null;
  private retryCount: number = 0;

  constructor() {
    this.initAutoSync();
  }

  // 🚀 Iniciar sincronización automática
  private initAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, SYNC_CONFIG.syncInterval);

    console.log('🔄 QR Auto-sync iniciado');
  }

  // 🔄 Realizar sincronización completa
  async performSync(): Promise<boolean> {
    if (this.status === QRSyncStatus.SYNCING) {
      console.log('🔄 QR Sincronización ya en progreso...');
      return false;
    }

    this.status = QRSyncStatus.SYNCING;
    console.log('🔄 Iniciando sincronización QR...');

    try {
      // 1. Verificar conexión a la nube
      const isCloudAvailable = await this.checkCloudConnection();
      
      if (!isCloudAvailable) {
        console.log('☁️ Sin conexión a la nube, usando modo offline QR');
        this.status = QRSyncStatus.OFFLINE;
        return false;
      }

      // 2. Obtener datos locales
      const localData = await this.getLocalData();
      
      // 3. Obtener datos de la nube
      const cloudData = await this.getCloudData();
      
      // 4. Comparar y fusionar datos
      const mergedData = await this.mergeData(localData, cloudData);
      
      // 5. Guardar datos fusionados localmente
      await this.saveLocalData(mergedData);
      
      // 6. Si hay datos locales nuevos, subir a la nube
      if (this.hasLocalChanges(localData, cloudData)) {
        await this.uploadToCloud(localData);
      }

      // 7. Realizar backup automático
      if (SYNC_CONFIG.autoBackup) {
        await this.performBackup(cloudData);
      }

      this.lastSyncTime = Date.now();
      this.status = QRSyncStatus.SUCCESS;
      this.retryCount = 0;
      
      console.log('✅ QR Sincronización completada exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error en sincronización QR:', error);
      this.status = QRSyncStatus.ERROR;
      this.retryCount++;
      
      // Reintentar si no supera el máximo
      if (this.retryCount < SYNC_CONFIG.maxRetries) {
        console.log(`🔄 Reintentando sincronización QR (${this.retryCount}/${SYNC_CONFIG.maxRetries})`);
        setTimeout(() => this.performSync(), 5000 * this.retryCount);
      }
      
      return false;
    }
  }

  // 🌐 Verificar conexión a la nube
  private async checkCloudConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, {
        timeout: SYNC_CONFIG.timeout
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 📱 Obtener datos locales
  private async getLocalData(): Promise<QRSyncData> {
    try {
      const orders = await AsyncStorage.getItem('qr_local_orders') || '[]';
      const tickets = await AsyncStorage.getItem('qr_local_tickets') || '[]';
      const tables = await AsyncStorage.getItem('qr_local_tables') || '[]';
      const products = await AsyncStorage.getItem('qr_local_products') || '[]';
      const lastSync = await AsyncStorage.getItem('qr_last_sync') || new Date(0).toISOString();

      return {
        orders: JSON.parse(orders),
        tickets: JSON.parse(tickets),
        tables: JSON.parse(tables),
        products: JSON.parse(products),
        lastSync,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error obteniendo datos locales QR:', error);
      return {
        orders: [],
        tickets: [],
        tables: [],
        products: [],
        lastSync: new Date(0).toISOString(),
        timestamp: Date.now()
      };
    }
  }

  // ☁️ Obtener datos de la nube
  private async getCloudData(): Promise<QRSyncData> {
    try {
      const [ordersRes, ticketsRes, tablesRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/orders`),
        axios.get(`${API_BASE_URL}/tickets`),
        axios.get(`${API_BASE_URL}/tables`),
        axios.get(`${API_BASE_URL}/products`)
      ]);

      return {
        orders: ordersRes.data.data || [],
        tickets: ticketsRes.data.data || [],
        tables: tablesRes.data.data || [],
        products: productsRes.data.data || [],
        lastSync: new Date().toISOString(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error obteniendo datos de la nube QR:', error);
      throw error;
    }
  }

  // 🔄 Fusionar datos (priorizar datos más recientes)
  private async mergeData(local: QRSyncData, cloud: QRSyncData): Promise<QRSyncData> {
    const merged: QRSyncData = {
      orders: this.mergeArrays(local.orders, cloud.orders, 'createdAt'),
      tickets: this.mergeArrays(local.tickets, cloud.tickets, 'createdAt'),
      tables: this.mergeArrays(local.tables, cloud.tables, 'updatedAt'),
      products: this.mergeArrays(local.products, cloud.products, 'updatedAt'),
      lastSync: new Date().toISOString(),
      timestamp: Date.now()
    };

    console.log(`🔄 Datos QR fusionados: ${merged.orders.length} órdenes, ${merged.tickets.length} tickets`);
    return merged;
  }

  // 🔄 Fusionar arrays por timestamp
  private mergeArrays(local: any[], cloud: any[], timestampField: string): any[] {
    const merged = new Map();
    
    // Agregar datos locales
    local.forEach(item => {
      merged.set(item._id, { ...item, source: 'local' });
    });
    
    // Agregar datos de la nube (sobrescribir si son más recientes)
    cloud.forEach(item => {
      const existing = merged.get(item._id);
      if (!existing || new Date(item[timestampField]) > new Date(existing[timestampField])) {
        merged.set(item._id, { ...item, source: 'cloud' });
      }
    });
    
    return Array.from(merged.values());
  }

  // 💾 Guardar datos localmente
  private async saveLocalData(data: QRSyncData): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('qr_local_orders', JSON.stringify(data.orders)),
        AsyncStorage.setItem('qr_local_tickets', JSON.stringify(data.tickets)),
        AsyncStorage.setItem('qr_local_tables', JSON.stringify(data.tables)),
        AsyncStorage.setItem('qr_local_products', JSON.stringify(data.products)),
        AsyncStorage.setItem('qr_last_sync', data.lastSync)
      ]);
      
      console.log('💾 Datos QR guardados localmente');
    } catch (error) {
      console.error('Error guardando datos locales QR:', error);
      throw error;
    }
  }

  // 📤 Subir cambios locales a la nube
  private async uploadToCloud(localData: QRSyncData): Promise<void> {
    try {
      // Subir solo los datos que no existen en la nube
      const newOrders = localData.orders.filter(order => order.source === 'local');
      const newTickets = localData.tickets.filter(ticket => ticket.source === 'local');
      
      if (newOrders.length > 0) {
        await Promise.all(
          newOrders.map(order => 
            axios.post(`${API_BASE_URL}/orders`, order)
          )
        );
        
        console.log(`📤 ${newOrders.length} órdenes QR subidas a la nube`);
      }

      if (newTickets.length > 0) {
        await Promise.all(
          newTickets.map(ticket => 
            axios.post(`${API_BASE_URL}/tickets`, ticket)
          )
        );
        
        console.log(`📤 ${newTickets.length} tickets QR subidos a la nube`);
      }
    } catch (error) {
      console.error('Error subiendo datos QR a la nube:', error);
      throw error;
    }
  }

  // 📦 Realizar backup automático
  private async performBackup(cloudData: QRSyncData): Promise<void> {
    try {
      const backupData: QRBackupData = {
        source: 'cloud',
        data: cloudData,
        compressed: false
      };

      await AsyncStorage.setItem('qr_backup_data', JSON.stringify(backupData));
      console.log('📦 QR Backup automático completado');
    } catch (error) {
      console.error('Error en backup automático QR:', error);
    }
  }

  // 🔍 Verificar si hay cambios locales
  private hasLocalChanges(local: QRSyncData, cloud: QRSyncData): boolean {
    return local.orders.some(order => order.source === 'local') ||
           local.tickets.some(ticket => ticket.source === 'local') ||
           local.tables.some(table => table.source === 'local') ||
           local.products.some(product => product.source === 'local');
  }

  // 📊 Obtener estado actual
  getStatus(): {
    status: QRSyncStatus;
    lastSync: number;
    retryCount: number;
  } {
    return {
      status: this.status,
      lastSync: this.lastSyncTime,
      retryCount: this.retryCount
    };
  }

  // 🛑 Detener sincronización
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('🛑 QR Sincronización automática detenida');
  }

  // 🔄 Forzar sincronización manual
  async forceSync(): Promise<boolean> {
    this.retryCount = 0;
    return await this.performSync();
  }

  // 🎫 Función específica para tickets
  async syncTicket(ticketId: string): Promise<boolean> {
    try {
      const localTickets = await AsyncStorage.getItem('qr_local_tickets') || '[]';
      const tickets = JSON.parse(localTickets);
      const ticket = tickets.find((t: any) => t._id === ticketId);
      
      if (ticket && ticket.source === 'local') {
        await axios.post(`${API_BASE_URL}/tickets`, ticket);
        
        // Actualizar estado local
        ticket.source = 'cloud';
        await AsyncStorage.setItem('qr_local_tickets', JSON.stringify(tickets));
        
        console.log(`🎫 Ticket ${ticketId} sincronizado con la nube`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error sincronizando ticket ${ticketId}:`, error);
      return false;
    }
  }
}

// 🚀 Exportar instancia única
export const qrSyncService = new QRSyncService();
export default qrSyncService;
