/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GoalPatch = {
    name?: string;
    target_amount?: number;
    current_amount?: number;
    currency?: string;
    target_date?: string | null;
    status?: 'active' | 'achieved' | 'paused' | 'cancelled';
    notes?: string | null;
};

