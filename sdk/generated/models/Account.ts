/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Account = {
    id: string;
    user_id: string;
    name: string;
    type: 'checking' | 'savings' | 'cash' | 'credit' | 'investment' | 'other';
    currency: string;
    initial_balance: number;
    logo_path?: string | null;
    is_archived: boolean;
    created_at?: string;
};

