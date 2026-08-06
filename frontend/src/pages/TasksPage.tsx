import ModuleForm from '../components/ModuleForm';
import type { FieldConfig } from '../types';

// NOTE: create/delete should be ADMIN-only. GET all is expected to be
// scoped per office (each role only sees its own assignedOffice tasks,
// except ADMIN who sees everything) — check the raw response body
// below to confirm that filtering is actually happening, not just the
// status code.
const fields: FieldConfig[] = [
    { name: 'taskName', label: 'Task Name', type: 'text' },
    { name: 'taskDetails', label: 'Task Details', type: 'text' },
    { name: 'assignedDate', label: 'Assigned Date', type: 'date' },
    { name: 'deadline', label: 'Deadline', type: 'date' },
    {
        name: 'assignedOffice',
        label: 'Assigned Office',
        type: 'select',
        options: ['INFORMATION', 'ALLOCATION', 'WORKFORCE', 'ADMIN'],
    },
];

export default function TasksPage() {
    return <ModuleForm title="Task Manager" endpoint="/tasks" fields={fields} supportsDelete={false} />;
}
