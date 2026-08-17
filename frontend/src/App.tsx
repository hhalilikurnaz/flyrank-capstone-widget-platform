import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { WidgetsPage } from "@/pages/WidgetsPage";
import { NewWidgetPage } from "@/pages/NewWidgetPage";
import { WidgetDetailPage } from "@/pages/WidgetDetailPage";
import { SubmissionsPage } from "@/pages/SubmissionsPage";
import { TemplatesPage } from "@/pages/TemplatesPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ApiKeysPage } from "@/pages/ApiKeysPage";
import { AuditLogsPage } from "@/pages/AuditLogsPage";
import { WebhooksPage } from "@/pages/WebhooksPage";
import { LandingPage } from "@/pages/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/widgets" element={<WidgetsPage />} />
                  <Route path="/widgets/new" element={<NewWidgetPage />} />
                  <Route path="/widgets/:id" element={<WidgetDetailPage />} />
                  <Route path="/submissions" element={<SubmissionsPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/api-keys" element={<ApiKeysPage />} />
                  <Route path="/webhooks" element={<WebhooksPage />} />
                  <Route path="/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
