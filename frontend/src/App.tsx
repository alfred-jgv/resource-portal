import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { TokenProvider } from './context/TokenContext';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './components/RootLayout';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import BudgetRequestsPage from './pages/BudgetRequestsPage';
import VenueRequestsPage from './pages/VenueRequestsPage';
import EventsPage from './pages/EventsPage';
import ClubsPage from './pages/ClubsPage';
import CaptainLeadsPage from './pages/CaptainLeadsPage';
import DepartmentExecutivesPage from './pages/DepartmentExecutivesPage';
import TasksPage from './pages/TasksPage';

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            // Public routes — sidebar shows only if a session exists
            { path: '/', element: <HomePage /> },
            { path: '/budget-requests', element: <BudgetRequestsPage /> },
            { path: '/venue-requests', element: <VenueRequestsPage /> },
            { path: '/login', element: <AuthPage /> },

            // Protected routes — still gated by ProtectedRoute for auth check
            {
                element: <ProtectedRoute />,
                children: [
                    { path: '/captain-leads', element: <CaptainLeadsPage /> },
                    { path: '/clubs', element: <ClubsPage /> },
                    { path: '/department-executives', element: <DepartmentExecutivesPage /> },
                    { path: '/tasks', element: <TasksPage /> },
                    { path: '/events', element: <EventsPage /> },
                ],
            },
        ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
    return (
        <TokenProvider>
            <RouterProvider router={router} />
        </TokenProvider>
    );
}