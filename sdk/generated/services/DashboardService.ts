/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DashboardSummary } from '../models/DashboardSummary';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Resumo consolidado para dashboard
     * @param from
     * @param to
     * @returns any Resumo retornado
     * @throws ApiError
     */
    public static getApiV1DashboardSummary(
        from?: string,
        to?: string,
    ): CancelablePromise<{
        data: DashboardSummary;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/dashboard/summary',
            query: {
                'from': from,
                'to': to,
            },
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                403: `Sem permissão no módulo/ação`,
            },
        });
    }
}
