import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import api from '../../api/client';
import { ENDPOINTS } from '../../config';
import type { RootState } from '..';

export interface Table {
  _id: string;
  number: number;
  name?: string;
  capacity?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

interface TablesState {
  items: Table[];
  loading: boolean;
  error?: string;
}

const initialState: TablesState = {
  items: [],
  loading: false,
};

export const fetchTables = createAsyncThunk('tables/fetchAll', async () => {
  const { data } = await api.get(ENDPOINTS.tables.base);
  return data.data as Table[];
});

export const createTable = createAsyncThunk<
  Table,
  { number: number; name?: string; capacity?: number; active?: boolean },
  { rejectValue: { message: string } }
>('tables/create', async (payload, { rejectWithValue }) => {
  const body = {
    number: payload.number,
    name: payload.name,
    capacity: payload.capacity,
    active: payload.active ?? true,
  };

  try {
    const { data } = await api.post(ENDPOINTS.tables.create, body);
    return data.data as Table;
  } catch (err: any) {
    const message =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      'No se pudo crear la mesa';
    return rejectWithValue({ message });
  }
});

export const updateTable = createAsyncThunk(
  'tables/update',
  async ({ id, ...changes }: { id: string; name?: string; capacity?: number; active?: boolean }) => {
    const { data } = await api.patch(ENDPOINTS.tables.byId(id), changes);
    return data.data as Table;
  },
);

export const deleteTable = createAsyncThunk('tables/delete', async (id: string) => {
  await api.delete(ENDPOINTS.tables.byId(id));
  return id;
});

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const selectTables = (state: RootState) => (state as any).tables.items as Table[];
export const selectActiveTables = (state: RootState) =>
  ((state as any).tables.items as Table[]).filter(
    (t: Table) => t.active && (!t.status || t.status === 'available'),
  );
export const selectTablesLoading = (state: RootState) => (state as any).tables.loading as boolean;

export default tablesSlice.reducer;
