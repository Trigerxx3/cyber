import { LiveDashboard } from '@/components/live-dashboard';

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <LiveDashboard />
      </div>
    </main>
  );
}
