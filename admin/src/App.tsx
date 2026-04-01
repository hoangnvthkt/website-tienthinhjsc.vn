import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import AuthGuard from '@/features/auth/AuthGuard'
import AdminLayout from '@/components/layout/AdminLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ProjectsListPage from '@/features/projects/ProjectsListPage'
import ProjectFormPage from '@/features/projects/ProjectFormPage'
import PostsListPage from '@/features/posts/PostsListPage'
import PostFormPage from '@/features/posts/PostFormPage'
import PagesListPage from '@/features/pages/PagesListPage'
import PageFormPage from '@/features/pages/PageFormPage'
import ContactsPage from '@/features/contacts/ContactsPage'
import MediaPage from '@/features/media/MediaPage'
import DocumentsPage from '@/features/documents/DocumentsPage'
import SettingsPage from '@/features/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthGuard>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<DashboardPage />} />
                {/* Projects */}
                <Route path="/projects" element={<ProjectsListPage />} />
                <Route path="/projects/new" element={<ProjectFormPage />} />
                <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
                {/* Posts */}
                <Route path="/posts" element={<PostsListPage />} />
                <Route path="/posts/new" element={<PostFormPage />} />
                <Route path="/posts/:id/edit" element={<PostFormPage />} />
                {/* Pages */}
                <Route path="/pages" element={<PagesListPage />} />
                <Route path="/pages/:id/edit" element={<PageFormPage />} />
                {/* Contacts */}
                <Route path="/contacts" element={<ContactsPage />} />
                {/* Documents & Media */}
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/media" element={<MediaPage />} />
                {/* Settings */}
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </AuthGuard>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
