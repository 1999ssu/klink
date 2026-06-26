// src/app/(admin)/admin/layout.tsx
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
