/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangelogEntry } from '../models/ChangelogEntry';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemService {
    /**
     * Informações da API
     * @returns any Metadados da API
     * @throws ApiError
     */
    public static getApi(): CancelablePromise<{
        name: string;
        version: string;
        healthcheck: string;
        docs?: string;
        openapi: string;
        changelog?: string;
        endpoints: Record<string, string>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
    /**
     * Healthcheck
     * @returns any Serviço disponível
     * @throws ApiError
     */
    public static getApiHealth(): CancelablePromise<{
        status: string;
        service: string;
        timestamp: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/health',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
    /**
     * Changelog da API
     * @returns any Histórico de versões
     * @throws ApiError
     */
    public static getApiChangelog(): CancelablePromise<{
        current_version: string;
        data: Array<ChangelogEntry>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/changelog',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
    /**
     * Especificação OpenAPI em JSON
     * @returns any Documento OpenAPI da API
     * @throws ApiError
     */
    public static getApiOpenapiJson(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/openapi.json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
    /**
     * Metadados da versão estável v1
     * @returns any Status da versão v1
     * @throws ApiError
     */
    public static getApiV1(): CancelablePromise<{
        version: string;
        status: string;
        openapi: string;
        changelog: string;
        latest_release: (ChangelogEntry | null);
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
    /**
     * Status da versão v2
     * @returns any Status da versão v2
     * @throws ApiError
     */
    public static getApiV2(): CancelablePromise<{
        version: string;
        status: string;
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v2',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
            },
        });
    }
}
