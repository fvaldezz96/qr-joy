import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import api from '../../api/client';
import { setAuthToken } from '../../api/setAuthToken';
import { readToken, removeToken, saveToken } from '../../utils/tokenStorage';

type Role = 'user' | 'admin' | 'employee';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error?: string;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
};

// ✅ Limpieza del input
function sanitize(input: string) {
  return input.replace(/[<>{}]/g, '').trim();
}

// ✅ Login seguro con persistencia cifrada
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (body: { email: string; password: string }) => {
    const cleanEmail = sanitize(body.email);
    const cleanPass = sanitize(body.password);

    const { data } = await api.post('/auth/login', { email: cleanEmail, password: cleanPass });

    const payload = data.data as { token: string; user: User };

    // Guardar token de forma segura (nativo/web)
    await saveToken(payload.token);
    setAuthToken(payload.token);
    return payload;
  },
);

// ✅ Revalidar usuario usando el token almacenado
export const meThunk = createAsyncThunk('auth/me', async () => {
  const storedToken = await readToken();
  if (!storedToken) throw new Error('No token found');

  setAuthToken(storedToken);
  const { data } = await api.get('/auth/me');
  return data.data as User;
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      setAuthToken(null);
      removeToken();
    },
  },
  extraReducers: (b) => {
    b.addCase(loginThunk.pending, (s) => {
      s.loading = true;
      s.error = undefined;
    })
      .addCase(loginThunk.fulfilled, (s, a: PayloadAction<{ token: string; user: User }>) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = a.payload.user;
      })
      .addCase(loginThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message;
      })
      .addCase(meThunk.fulfilled, (s, a) => {
        s.user = a.payload;
      })
      .addCase(meThunk.rejected, (s) => {
        s.user = null;
        s.token = null;
        removeToken();
      });
  },
});

export const { logout } = slice.actions;
export default slice.reducer;
