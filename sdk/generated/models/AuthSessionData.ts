/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthSessionData = {
    access_token: string;
    refresh_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    user: {
        id: string | null;
        email: string | null;
    };
};

