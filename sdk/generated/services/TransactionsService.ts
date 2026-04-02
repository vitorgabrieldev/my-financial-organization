/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pagination } from '../models/Pagination';
import type { Transaction } from '../models/Transaction';
import type { TransactionCreate } from '../models/TransactionCreate';
import type { TransactionPatch } from '../models/TransactionPatch';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionsService {
    /**
     * Listar transações
     * @param limit
     * @param offset
     * @param cursor Cursor opaco retornado pela paginação anterior.
     * @param sort
     * @param order
     * @param from
     * @param to
     * @param type
     * @param accountId
     * @param categoryId
     * @param goalId
     * @param search
     * @returns any Lista de transações
     * @throws ApiError
     */
    public static getApiV1Transactions(
        limit: number = 100,
        offset?: number,
        cursor?: string,
        sort: 'occurs_on' | 'created_at' | 'amount_in_default_currency' | 'description' | 'type' = 'occurs_on',
        order: 'asc' | 'desc' = 'desc',
        from?: string,
        to?: string,
        type?: 'income' | 'expense' | 'transfer',
        accountId?: string,
        categoryId?: string,
        goalId?: string,
        search?: string,
    ): CancelablePromise<{
        data: Array<Transaction>;
        pagination: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/transactions',
            query: {
                'limit': limit,
                'offset': offset,
                'cursor': cursor,
                'sort': sort,
                'order': order,
                'from': from,
                'to': to,
                'type': type,
                'account_id': accountId,
                'category_id': categoryId,
                'goal_id': goalId,
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
     * Criar transação (com suporte a parcelas/recorrência)
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Transação(ões) criada(s)
     * @throws ApiError
     */
    public static postApiV1Transactions(
        requestBody: TransactionCreate,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Array<Transaction>;
        meta: {
            created_count: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/transactions',
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
     * Buscar transação por id
     * @param id
     * @returns any Transação encontrada
     * @throws ApiError
     */
    public static getApiV1Transactions1(
        id: string,
    ): CancelablePromise<{
        data: Transaction;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/transactions/{id}',
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
     * Atualizar transação por id
     * @param id
     * @param requestBody
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @returns any Transação atualizada
     * @throws ApiError
     */
    public static patchApiV1Transactions(
        id: string,
        requestBody: TransactionPatch,
        idempotencyKey?: string,
    ): CancelablePromise<{
        data: Transaction;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/transactions/{id}',
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
     * Excluir transação por id
     * @param id
     * @param idempotencyKey Chave opcional para tornar operações mutáveis idempotentes por usuário/método/rota.
     * @param scope
     * @returns any Transação excluída
     * @throws ApiError
     */
    public static deleteApiV1Transactions(
        id: string,
        idempotencyKey?: string,
        scope: 'single' | 'installment_group' = 'single',
    ): CancelablePromise<{
        deleted: boolean;
        deleted_count: number;
        scope: 'single' | 'installment_group';
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/transactions/{id}',
            path: {
                'id': id,
            },
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            query: {
                'scope': scope,
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
