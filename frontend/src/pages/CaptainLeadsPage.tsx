import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

const fields: FieldConfig[] = [
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'middleName', label: 'Middle Name (optional)', type: 'text' },
    { name: 'clubId', label: 'Club', type: 'reference', refEndpoint: '/clubs', refLabelKeys: ['clubName', 'universityName'] },
    { name: 'linkedinUrl', label: 'LinkedIn URL (optional)', type: 'text' },
    { name: 'credlyUrl', label: 'Credly URL (optional)', type: 'text' },
];

export default function CaptainLeadsPage() {
    return <ModuleForm title="Captain & Leads" endpoint="/captain-leads" fields={fields} createRoles={['INFORMATION', 'ADMIN']} dashboardModule="captain-leads" />
}
