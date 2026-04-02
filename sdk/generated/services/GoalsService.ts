/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Goal } from '../models/Goal';
import type { GoalCreate } from '../models/GoalCreate';
import type { GoalPatch } from '../models/GoalPatch';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GoalsService {
    /**
     * Listar metas
     * @param limit
     * @param offset
     * @param cursor Cursor opaco retornado pela paginação anterior.
     * @param sort
     * @param order
     * @param status
     * @param search
     * @returns any Lista de metas
     * @throws ApiError
     */
    public static getApiV1Goals(
        limit: number = 100,
        offset?: number,
        cursor?: string,
        sort: 'created_at' | 'name' | 'target_amount' | 'current_amount' | 'status' = 'created_at',
        order: 'asc' | 'desc' = 'desc',
        status?: 'active' | 'achieved' | 'paused' | 'cancelled',
        search?: string,
    ): CancelablePromise<{
        data: Array<Goal>;
        pagination: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals',
            query: {
                'limit': limit,
                'offset': offset,
                'cursor': cursor,
                'sort': sort,
                'order': order,
                'status': status,
                'search': search,
            },
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                403: `Sem permissão no módulo/ação`,
                422: `Payload inválido`,
            },
        });
    }
    /**
     * Criar meta
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Meta criada
     * @throws ApiError
     */
    public static postApiV1Goals(
        requestBody: GoalCreate,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Goal;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/goals',
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                403: `Sem permissão no módulo/ação`,
                409: `Conflito de estado (ex: idempotência ou dados duplicados)`,
                422: `Payload inválido`,
            },
        });
    }
    /**
     * Buscar meta por id
     * @param id
     * @returns any Meta encontrada
     * @throws ApiError
     */
    public static getApiV1Goals1(
        id: string,
    ): CancelablePromise<{
        data: Goal;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/goals/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                404: `Recurso não encontrado`,
            },
        });
    }
    /**
     * Atualizar meta por id
     * @param id
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Meta atualizada
     * @throws ApiError
     */
    public static patchApiV1Goals(
        id: string,
        requestBody: GoalPatch,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Goal;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/goals/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                403: `Sem permissão no módulo/ação`,
                404: `Recurso não encontrado`,
                409: `Conflito de estado (ex: idempotência ou dados duplicados)`,
                422: `Payload inválido`,
            },
        });
    }
    /**
     * Excluir meta por id
     * @param id
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Meta excluída
     * @throws ApiError
     */
    public static deleteApiV1Goals(
        id: string,
        idempotencyKey?: string,
    ): CancelablePromise<{
        deleted: boolean;
        id: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/goals/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            errors: {
                401: `Não autenticado (API key ou Bearer token inválido/ausente)`,
                403: `Sem permissão no módulo/ação`,
                404: `Recurso não encontrado`,
                409: `Conflito de estado (ex: idempotência ou dados duplicados)`,
            },
        });
    }
}
