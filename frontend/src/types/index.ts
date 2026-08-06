/*
 * DOCU: Shared types for the API tester — field config for module
 * forms, saved auth tokens, and the normalized shape every API
 * request resolves to.
 *
 * Last Updated: 2026-08-06
 * Author: Alfred
 * Last Updated By: Alfred
 */
export interface AuthUser {
    email: string;
    role: string;
}

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'file' | 'date' | 'datetime' | 'reference';
    options?: string[];
    placeholder?: string;
    refEndpoint?: string;     // e.g. '/clubs' — only used when type is 'reference'
    refLabelKeys?: string[];  // which fields to show in the picker, e.g. ['clubName', 'universityName']
}

export interface SavedToken {
    label: string;
    token: string;
}

export interface ApiResult {
    status: number;
    data: any;
}
