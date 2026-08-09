import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

const fields: FieldConfig[] = [
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'middleName', label: 'Middle Name (optional)', type: 'text' },
    { name: 'clubId', label: 'Club', type: 'reference', refEndpoint: '/clubs', refLabelKeys: ['clubName', 'universityName'] },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'contactNumber', label: 'Contact Number', type: 'text' },
    { name: 'birthdate', label: 'Birthdate', type: 'text', placeholder: '2001-03-12T00:00:00.000Z' },
    {
        name: 'department',
        label: 'Department',
        type: 'select',
        options: [
            'EXECUTIVES',
            'RESOURCE',
            'OPERATIONS',
            'TECHNOLOGY',
            'RELATIONS',
            'MULTIMEDIA',
            'LEARNING_CLUBS',
            'SKILL_BUILDERS',
            'BUILDHERS_PLUS',
        ],
    },
];

export default function DepartmentExecutivesPage() {
    return <ModuleForm title="Department Executives" endpoint="/department-executives" fields={fields} createRoles={['WORKFORCE', 'ADMIN']} />
}
