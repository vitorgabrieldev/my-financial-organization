/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { AccountCreate } from '../models/AccountCreate';
import type { AccountPatch } from '../models/AccountPatch';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountsService {
    /**
     * Listar contas
     * @param limit
     * @param offset
     * @param cursor Cursor opaco retornado pela paginação anterior.
     * @param sort
     * @param order
     * @param includeArchived
     * @param search
     * @returns any Lista de contas
     * @throws ApiError
     */
    public static getApiV1Accounts(
        limit: number = 100,
        offset?: number,
        cursor?: string,
        sort: 'created_at' | 'name' | 'initial_balance' = 'created_at',
        order: 'asc' | 'desc' = 'desc',
        includeArchived: boolean = false,
        search?: string,
    ): CancelablePromise<{
        data: Array<Account>;
        pagination: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/accounts',
            query: {
                'limit': limit,
                'offset': offset,
                'cursor': cursor,
                'sort': sort,
                'order': order,
                'include_archived': includeArchived,
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
     * Criar conta
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Conta criada
     * @throws ApiError
     */
    public static postApiV1Accounts(
        requestBody: AccountCreate,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Account;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/accounts',
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
     * Buscar conta por id
     * @param id
     * @returns any Conta encontrada
     * @throws ApiError
     */
    public static getApiV1Accounts1(
        id: string,
    ): CancelablePromise<{
        data: Account;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/accounts/{id}',
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
     * Atualizar conta por id
     * @param id
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Conta atualizada
     * @throws ApiError
     */
    public static patchApiV1Accounts(
        id: string,
        requestBody: AccountPatch,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Account;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/accounts/{id}',
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
     * Excluir conta por id
     * @param id
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Conta excluída
     * @throws ApiError
     */
    public static deleteApiV1Accounts(
        id: string,
        idempotencyKey?: string,
    ): CancelablePromise<{
        deleted: boolean;
        id: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/accounts/{id}',
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
