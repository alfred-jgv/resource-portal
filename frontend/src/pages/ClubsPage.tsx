import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

const fields: FieldConfig[] = [
    { name: 'clubName', label: 'Club Name', type: 'text' },
    { name: 'universityName', label: 'University Name', type: 'text' },
    { name: 'clubType', label: 'Club Type', type: 'select', options: ['STUDENT_BUILDER_GROUP', 'LEARNING_CLUB'] },
    { name: 'establishmentDate', label: 'Establishment Date', type: 'date' },
    { name: 'memberCount', label: 'Member Count', type: 'number' },
    { name: 'islandGroup', label: 'Island Group', type: 'select', options: ['LUZON', 'VISAYAS', 'MINDANAO'] },
    { name: 'region', label: 'Region', type: 'text' },
    { name: 'province', label: 'Province', type: 'text' },
];

export default function ClubsPage() {
    return <ModuleForm title="Club Registry" endpoint="/clubs" fields={fields} />;
}
