/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Pagination = {
    limit: number;
    offset: number;
    total: number;
    sort: string;
    order: 'asc' | 'desc';
    has_more: boolean;
    next_cursor: string | null;
};

