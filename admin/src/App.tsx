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
import CategoriesPage from '@/features/categories/CategoriesPage'
import PageBuilderPage from '@/features/page-builder/PageBuilderPage'
import NavigationPage from '@/features/navigation/NavigationPage'
import ContactsPage from '@/features/contacts/ContactsPage'
import MediaPage from '@/features/media/MediaPage'
import DocumentsPage from '@/features/documents/DocumentsPage'
import SettingsPage from '@/features/settings/SettingsPage'
import UsersPage from '@/features/users/UsersPage'
import ActivityLogPage from '@/features/activity/ActivityLogPage'
import ChatAnalyticsPage from '@/features/chat-analytics/ChatAnalyticsPage'
import HistoryMilestonesPage from '@/features/history-milestones/HistoryMilestonesPage'

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
                <Route path="/pages/new" element={<PageFormPage />} />
                <Route path="/pages/:id/edit" element={<PageFormPage />} />
                <Route path="/pages/:id/builder" element={<PageBuilderPage />} />
                {/* Categories */}
                <Route path="/categories" element={<CategoriesPage />} />
                {/* Navigation */}
                <Route path="/navigation" element={<NavigationPage />} />
                {/* Contacts */}
                <Route path="/contacts" element={<ContactsPage />} />
                {/* Documents & Media */}
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/media" element={<MediaPage />} />
                {/* Users */}
                <Route path="/users" element={<UsersPage />} />
                {/* Activity Log */}
                <Route path="/activity" element={<ActivityLogPage />} />
                {/* Chat Analytics */}
                <Route path="/chat-analytics" element={<ChatAnalyticsPage />} />
                {/* History 3D Milestones */}
                <Route path="/history-milestones" element={<HistoryMilestonesPage />} />
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
