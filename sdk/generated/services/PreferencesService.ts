/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Preferences } from '../models/Preferences';
import type { PreferencesPatch } from '../models/PreferencesPatch';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PreferencesService {
    /**
     * Buscar preferências do usuário atual
     * @returns any Preferências retornadas
     * @throws ApiError
     */
    public static getApiV1Preferences(): CancelablePromise<{
        data: Preferences;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/preferences',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
    /**
     * Atualizar preferências do usuário atual
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Preferências atualizadas
     * @throws ApiError
     */
    public static patchApiV1Preferences(
        requestBody: PreferencesPatch,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Preferences;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/preferences',
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                409: `Conflito de estado (ex: idempotência ou dados duplicados)`,
                422: `Payload inválido`,
            },
        });
    }
}
