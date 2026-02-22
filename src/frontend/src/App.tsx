import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from './pages/LandingPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import StaffAppointmentsPage from './pages/StaffAppointmentsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StaffManagementPage from './pages/StaffManagementPage';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

const queryClient = new QueryClient();

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const bookRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/book',
  component: BookAppointmentPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/confirmation',
  component: BookingConfirmationPage,
});

const staffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff',
  component: StaffAppointmentsPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-dashboard',
  component: AdminDashboardPage,
});

const staffManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff-management',
  component: StaffManagementPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  bookRoute,
  confirmationRoute,
  staffRoute,
  adminLoginRoute,
  adminDashboardRoute,
  staffManagementRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
