/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthLoginBody } from '../models/AuthLoginBody';
import type { AuthLogoutBody } from '../models/AuthLogoutBody';
import type { AuthLogoutData } from '../models/AuthLogoutData';
import type { AuthRefreshBody } from '../models/AuthRefreshBody';
import type { AuthSessionData } from '../models/AuthSessionData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Login com email/senha para obter access token do Supabase
     * @param requestBody
     * @returns any Sessão autenticada
     * @throws ApiError
     */
    public static postApiAuthLogin(
        requestBody: AuthLoginBody,
    ): CancelablePromise<{
        data: AuthSessionData;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                422: `Payload inválido`,
            },
        });
    }
    /**
     * Renovar sessão com refresh token
     * @param requestBody
     * @returns any Sessão renovada
     * @throws ApiError
     */
    public static postApiAuthRefresh(
        requestBody: AuthRefreshBody,
    ): CancelablePromise<{
        data: AuthSessionData;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                422: `Payload inválido`,
            },
        });
    }
    /**
     * Revogar sessão atual ou global
     * @param requestBody
     * @returns any Sessão revogada
     * @throws ApiError
     */
    public static postApiAuthLogout(
        requestBody?: AuthLogoutBody,
    ): CancelablePromise<{
        data: AuthLogoutData;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                422: `Payload inválido`,
            },
        });
    }
}
