// ============ AUTH TYPES ============
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'INFORMATION' | 'WORKFORCE' | 'ALLOCATION';
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    role: User['role'];
}

// ============ API ERROR TYPES ============
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

// ============ CLUB TYPES ============
export interface Club {
    id: string;
    clubName: string;
    universityName: string;
    clubType: 'STUDENT_BUILDER_GROUP' | 'CLOUD_CLUB' | 'AI_CLUB' | 'DEVOPS_CLUB';
    establishmentDate: string;
    memberCount: number;
    islandGroup: 'LUZON' | 'VISAYAS' | 'MINDANAO';
    region: string;
    province: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClubData {
    clubName: string;
    universityName: string;
    clubType: Club['clubType'];
    establishmentDate: string;
    memberCount: number;
    islandGroup: Club['islandGroup'];
    region: string;
    province: string;
}

// ============ CAPTAIN LEAD TYPES ============
export interface CaptainLead {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string;
    clubId: string;
    linkedinUrl?: string;
    credlyUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCaptainLeadData {
    lastName: string;
    firstName: string;
    middleName: string;
    clubId: string;
    linkedinUrl?: string;
    credlyUrl?: string;
}

// ============ EVENT TYPES ============
export interface Event {
    id: string;
    eventName: string;
    startDate: string;
    endDate: string;
    eventType: 'TECHNICAL' | 'SOCIAL' | 'WORKSHOP' | 'HACKATHON' | 'SEMINAR';
    expectedParticipants: number;
    location: string;
    eventLink?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventData {
    eventName: string;
    startDate: string;
    endDate: string;
    eventType: Event['eventType'];
    expectedParticipants: number;
    location: string;
    eventLink?: string;
}

// ============ DEPARTMENT EXECUTIVE TYPES ============
export interface DepartmentExecutive {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string;
    clubId: string;
    email: string;
    contactNumber: string;
    birthdate: string;
    department: 'EXECUTIVES' | 'MARKETING' | 'TECHNICAL' | 'OPERATIONS' | 'FINANCE';
    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentExecutiveData {
    lastName: string;
    firstName: string;
    middleName: string;
    clubId: string;
    email: string;
    contactNumber: string;
    birthdate: string;
    department: DepartmentExecutive['department'];
}

// ============ BUDGET REQUEST TYPES ============
export interface BudgetRequest {
    id: string;
    requesteeType: 'CLUB' | 'NON_CLUB';
    fullName: string;
    clubId?: string;
    nonClubOrgName?: string;
    eventId: string;
    participantTier: 'S' | 'A' | 'B' | 'C';
    requestedAmount: number;
    budgetBreakdown: string;
    officialRequest: string;
    eventPrimer: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    createdAt: string;
    updatedAt: string;
}

export interface CreateBudgetRequestData {
    requesteeType: 'CLUB' | 'NON_CLUB';
    fullName: string;
    clubId?: string;
    nonClubOrgName?: string;
    eventId: string;
    participantTier: 'S' | 'A' | 'B' | 'C';
    requestedAmount: string;
    budgetBreakdown: File;
    officialRequest: File;
    eventPrimer: File;
}

// ============ VENUE REQUEST TYPES ============
export interface VenueRequest {
    id: string;
    clubId: string;
    clubHeadId: string;
    eventId: string;
    reservationDate: string;
    startTime: string;
    endTime: string;
    floor: 'FLOOR_15' | 'FLOOR_21';
    numberOfPax: number;
    projectProfile: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
    createdAt: string;
    updatedAt: string;
}

export interface CreateVenueRequestData {
    clubId: string;
    clubHeadId: string;
    eventId: string;
    reservationDate: string;
    startTime: string;
    endTime: string;
    floor: 'FLOOR_15' | 'FLOOR_21';
    numberOfPax: number;
    projectProfile: File;
}

// ============ TASK TYPES ============
export interface Task {
    id: string;
    taskName: string;
    taskDetails: string;
    assignedDate: string;
    deadline: string;
    assignedOffice: 'ADMIN' | 'INFORMATION' | 'WORKFORCE' | 'ALLOCATION';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskData {
    taskName: string;
    taskDetails: string;
    assignedDate: string;
    deadline: string;
    assignedOffice: Task['assignedOffice'];
    status: Task['status'];
}

export interface UpdateTaskData {
    taskName?: string;
    taskDetails?: string;
    assignedDate?: string;
    deadline?: string;
    assignedOffice?: Task['assignedOffice'];
    status?: Task['status'];
}

// ============ PAGINATION TYPES ============
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============ FILTER TYPES ============
export interface ClubFilters extends PaginationParams {
    clubName?: string;
    universityName?: string;
    clubType?: Club['clubType'];
    islandGroup?: Club['islandGroup'];
}

export interface EventFilters extends PaginationParams {
    eventName?: string;
    eventType?: Event['eventType'];
    startDate?: string;
    endDate?: string;
}

export interface TaskFilters extends PaginationParams {
    taskName?: string;
    status?: Task['status'];
    assignedOffice?: Task['assignedOffice'];
}