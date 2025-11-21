import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import api from '../../api/client';
import { ENDPOINTS, withQuery } from '../../config';

export type ComandaStatus = 'queued' | 'in_progress' | 'served' | 'cancelled';
export type ComandaStation = 'bar' | 'kitchen';

export interface ComandaItem {
  productId: string;
  qty: number;
  note?: string;
}

export interface Comanda {
  _id: string;
  orderId: string;
  userId?: string;
  qrCode?: string;
  qrSignature?: string;
  station: ComandaStation;
  status: ComandaStatus;
  items: ComandaItem[];
   tableNumber?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FetchParams {
  station?: ComandaStation;
  status?: ComandaStatus;
}

interface ComandasState {
  items: Comanda[];
  loading: boolean;
  error?: string;
  filters: FetchParams;
}

const initialState: ComandasState = {
  items: [],
  loading: false,
  filters: {},
};

export const fetchComandas = createAsyncThunk(
  'comandas/fetchAll',
  async (params: FetchParams | undefined = undefined) => {
    const url = withQuery(ENDPOINTS.comandas.base, params);
    const { data } = await api.get(url);
    return data.data as Comanda[];
  },
);

export const updateComandaStatus = createAsyncThunk(
  'comandas/updateStatus',
  async ({ id, status }: { id: string; status: ComandaStatus }) => {
    const { data } = await api.patch(`${ENDPOINTS.comandas.base}/${id}`, { status });
    return data.data as Comanda;
  },
);

const comandasSlice = createSlice({
  name: 'comandas',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<FetchParams>) {
      state.filters = action.payload;
    },
    clearComandas(state) {
      state.items = [];
      state.error = undefined;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchComandas.pending, state => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchComandas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComandas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateComandaStatus.fulfilled, (state, action) => {
        state.items = state.items.map(item => (item._id === action.payload._id ? action.payload : item));
      });
  },
});

export const { setFilters, clearComandas } = comandasSlice.actions;
export default comandasSlice.reducer;
