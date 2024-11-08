import AdminAuth from '../components/AdminAuth';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminPanel />
    </AdminAuth>
  );
}
