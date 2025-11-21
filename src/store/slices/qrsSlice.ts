import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import api from '../../api/client';
import { ENDPOINTS } from '../../config';

export interface UserQr {
    orderId: string;
    tableId?: string;
    tableNumber?: number;
    total: number;
    status: string;
    createdAt?: string;
    qr: {
        id: string;
        code: string;
        signature: string;
        state: 'active' | 'redeemed' | 'expired';
        createdAt?: string;
        expiresAt?: string;
        redeemedAt?: string;
    };
}

interface QrState {
    items: UserQr[];
    loading: boolean;
    error?: string;
}

const initialState: QrState = {
    items: [],
    loading: false,
};

export const fetchUserQrs = createAsyncThunk('qrs/fetchUserQrs', async (userId: string) => {
    try {
        const { data } = await api.get(ENDPOINTS.qr.byUser(userId));
        console.log('data : ', data);
        return data.data.items as UserQr[];
    } catch (error) {
        console.log('error : ', error);
        return [];
    }
});

const qrsSlice = createSlice({
    name: 'qrs',
    initialState,
    reducers: {
        clearQrs(state) {
            state.items = [];
            state.error = undefined;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchUserQrs.pending, state => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(fetchUserQrs.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUserQrs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { clearQrs } = qrsSlice.actions;
export default qrsSlice.reducer;
