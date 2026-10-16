import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

// NOTE: this module uses file upload — confirm the "projectProfile"
// field name below matches your controller's interceptor config.
const fields: FieldConfig[] = [
    { name: 'clubId', label: 'Club', type: 'reference', refEndpoint: '/clubs', refLabelKeys: ['clubName'] },
    { name: 'clubHeadId', label: 'Club Head', type: 'reference', refEndpoint: '/captain-leads', refLabelKeys: ['firstName', 'lastName'] },
    { name: 'eventId', label: 'Event', type: 'reference', refEndpoint: '/events', refLabelKeys: ['eventName'] },
    { name: 'projectProfile', label: 'Project Profile (PDF)', type: 'file' },
    { name: 'reservationDate', label: 'Reservation Date', type: 'date' },
    { name: 'startTime', label: 'Start Time', type: 'datetime' },
    { name: 'endTime', label: 'End Time', type: 'datetime' },
    { name: 'floor', label: 'Floor', type: 'select', options: ['FLOOR_15', 'FLOOR_21'] },
    { name: 'numberOfPax', label: 'Number of Pax', type: 'number' },
];

export default function VenueRequestsPage() {
    return <ModuleForm title="Venue Requests" endpoint="/venue-requests" fields={fields} manageRoles={['WORKFORCE', 'ADMIN']} dashboardModule="venue-requests" />
}
