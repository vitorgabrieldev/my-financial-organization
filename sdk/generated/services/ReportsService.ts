/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryReportRow } from '../models/CategoryReportRow';
import type { MonthlyReportRow } from '../models/MonthlyReportRow';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Relatório mensal consolidado
     * @param from
     * @param to
     * @returns any Linhas do relatório mensal
     * @throws ApiError
     */
    public static getApiV1ReportsMonthly(
        from?: string,
        to?: string,
    ): CancelablePromise<{
        data: Array<MonthlyReportRow>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/monthly',
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
    /**
     * Relatório por categoria
     * @param from
     * @param to
     * @param kind
     * @param categoryId
     * @returns any Linhas do relatório por categoria
     * @throws ApiError
     */
    public static getApiV1ReportsCategories(
        from?: string,
        to?: string,
        kind?: 'income' | 'expense',
        categoryId?: string,
    ): CancelablePromise<{
        data: Array<CategoryReportRow>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/categories',
            query: {
                'from': from,
                'to': to,
                'kind': kind,
                'category_id': categoryId,
            },
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                403: `Sem permissão no módulo/ação`,
            },
        });
    }
}
