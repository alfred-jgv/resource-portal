import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

const fields: FieldConfig[] = [
    { name: 'eventName', label: 'Event Name', type: 'text' },
    { name: 'startDate', label: 'Start Date', type: 'date' },
    { name: 'endDate', label: 'End Date', type: 'date' },
    {
        name: 'eventType',
        label: 'Event Type',
        type: 'select',
        options: ['TECHNICAL', 'LEADERSHIP', 'SUSTAINABILITY', 'CAREER_GROWTH', 'DIVERSITY'],
    },
    { name: 'expectedParticipants', label: 'Expected Participants', type: 'number' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'eventLink', label: 'Event Link (optional)', type: 'text' },
];

export default function EventsPage() {
    return <ModuleForm title="Events" endpoint="/events" fields={fields} createRoles={['WORKFORCE', 'ADMIN']} dashboardModule="events" />
}
