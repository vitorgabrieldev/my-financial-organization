/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Category } from '../models/Category';
import type { CategoryCreate } from '../models/CategoryCreate';
import type { CategoryPatch } from '../models/CategoryPatch';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CategoriesService {
    /**
     * Listar categorias
     * @param limit
     * @param offset
     * @param cursor Cursor opaco retornado pela paginação anterior.
     * @param sort
     * @param order
     * @param kind
     * @param search
     * @returns any Lista de categorias
     * @throws ApiError
     */
    public static getApiV1Categories(
        limit: number = 100,
        offset?: number,
        cursor?: string,
        sort: 'name' | 'kind' | 'created_at' = 'name',
        order: 'asc' | 'desc' = 'desc',
        kind?: 'income' | 'expense',
        search?: string,
    ): CancelablePromise<{
        data: Array<Category>;
        pagination: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/categories',
            query: {
                'limit': limit,
                'offset': offset,
                'cursor': cursor,
                'sort': sort,
                'order': order,
                'kind': kind,
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
     * Criar categoria
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Categoria criada
     * @throws ApiError
     */
    public static postApiV1Categories(
        requestBody: CategoryCreate,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Category;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/categories',
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
     * Buscar categoria por id
     * @param id
     * @returns any Categoria encontrada
     * @throws ApiError
     */
    public static getApiV1Categories1(
        id: string,
    ): CancelablePromise<{
        data: Category;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/categories/{id}',
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
     * Atualizar categoria por id
     * @param id
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Categoria atualizada
     * @throws ApiError
     */
    public static patchApiV1Categories(
        id: string,
        requestBody: CategoryPatch,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Category;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/categories/{id}',
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
     * Excluir categoria por id
     * @param id
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Categoria excluída
     * @throws ApiError
     */
    public static deleteApiV1Categories(
        id: string,
        idempotencyKey?: string,
    ): CancelablePromise<{
        deleted: boolean;
        id: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/categories/{id}',
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
