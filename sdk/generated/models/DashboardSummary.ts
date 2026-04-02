/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Transaction } from './Transaction';
export type DashboardSummary = {
    period: {
        from: string;
        to: string;
    };
    totals: {
        income: number;
        expense: number;
        transfer_volume: number;
        net: number;
    };
    accounts: {
        total: number;
        active: number;
        archived: number;
        initial_balance_total: number;
    };
    goals: {
        total: number;
        active: number;
        achieved: number;
        target_total: number;
        current_total: number;
    };
    transactions: {
        total_in_period: number;
        latest: Array<Transaction>;
        largest_income: (Transaction | null);
        largest_expense: (Transaction | null);
    };
};

