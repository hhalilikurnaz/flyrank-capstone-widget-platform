import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { WidgetsPage } from "@/pages/WidgetsPage";
import { NewWidgetPage } from "@/pages/NewWidgetPage";
import { WidgetDetailPage } from "@/pages/WidgetDetailPage";
import { TemplatesPage } from "@/pages/TemplatesPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/widgets" element={<WidgetsPage />} />
              <Route path="/widgets/new" element={<NewWidgetPage />} />
              <Route path="/widgets/:id" element={<WidgetDetailPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
