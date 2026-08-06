import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

// NOTE: this module uses file upload (FileFieldsInterceptor on the backend).
// Confirm the exact field names below match your controller's interceptor
// config — if they don't match exactly, the file gets silently dropped.
const fields: FieldConfig[] = [
    { name: 'requesteeType', label: 'Requestee Type', type: 'select', options: ['CLUB', 'NON_CLUB'] },
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'clubId', label: 'Club ID (leave blank if NON_CLUB)', type: 'text' },
    { name: 'nonClubOrgName', label: 'Non-Club Org Name (leave blank if CLUB)', type: 'text' },
    { name: 'eventId', label: 'Event ID', type: 'text', placeholder: 'paste a real event id' },
    { name: 'participantTier', label: 'Participant Tier', type: 'select', options: ['S', 'A', 'B', 'C'] },
    { name: 'requestedAmount', label: 'Requested Amount (PHP)', type: 'number' },
    { name: 'budgetBreakdown', label: 'Budget Breakdown (PDF)', type: 'file' },
    { name: 'officialRequest', label: 'Official Request (PDF)', type: 'file' },
    { name: 'eventPrimer', label: 'Event Primer (PDF)', type: 'file' },
];

export default function BudgetRequestsPage() {
    return <ModuleForm title="Budget Request" endpoint="/budget-requests" fields={fields} multipart />;
}
