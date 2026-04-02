/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionPatch = {
    account_id?: string;
    transfer_account_id?: string | null;
    category_id?: string | null;
    goal_id?: string | null;
    type?: 'income' | 'expense' | 'transfer';
    description?: string;
    notes?: string | null;
    amount?: number;
    currency?: string;
    default_currency?: string;
    exchange_rate?: number;
    occurs_on?: string;
    attachment_path?: string | null;
    recurrence_frequency?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_interval?: number;
    recurrence_end_date?: string | null;
};

