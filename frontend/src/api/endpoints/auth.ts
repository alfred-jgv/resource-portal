// src/api/endpoints/auth.ts
import { api } from '../axios.config';
import * as types from '../../types';

export const authApi = {
    login: (data: types.LoginCredentials) =>
        api.post<types.AuthResponse>('/auth/login', data),

    register: (data: types.RegisterCredentials) =>
        api.post<types.AuthResponse>('/auth/register', data),

    getCurrentUser: () =>
        api.get<types.User>('/auth/me'),
};