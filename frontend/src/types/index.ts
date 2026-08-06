/*
 * DOCU: Shared types for the API tester — field config for module
 * forms, saved auth tokens, and the normalized shape every API
 * request resolves to.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'file' | 'date' | 'datetime';
    options?: string[];
    placeholder?: string;
}

export interface SavedToken {
    label: string;
    token: string;
}

export interface ApiResult {
    status: number;
    data: any;
}
