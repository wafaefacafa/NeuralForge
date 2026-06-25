import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import DashboardPage from "@/pages/DashboardPage/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage/ProjectsPage";
import CreateProjectPage from "@/pages/CreateProjectPage/CreateProjectPage";
import DatasetsPage from "@/pages/DatasetsPage/DatasetsPage";
import TrainingConfigPage from "@/pages/TrainingConfigPage/TrainingConfigPage";
import TrainingMonitorPage from "@/pages/TrainingMonitorPage/TrainingMonitorPage";
import ModelVersionsPage from "@/pages/ModelVersionsPage/ModelVersionsPage";
import ModelEvalPage from "@/pages/ModelEvalPage/ModelEvalPage";
import DeployConfigPage from "@/pages/DeployConfigPage/DeployConfigPage";
import DeployInstancesPage from "@/pages/DeployInstancesPage/DeployInstancesPage";
import ApiDocsPage from "@/pages/ApiDocsPage/ApiDocsPage";
import ResourceMonitorPage from "@/pages/ResourceMonitorPage/ResourceMonitorPage";
import TeamPage from "@/pages/TeamPage/TeamPage";
import SettingsPage from "@/pages/SettingsPage/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="training/config/:projectId" element={<TrainingConfigPage />} />
        <Route path="training/monitor/:jobId" element={<TrainingMonitorPage />} />
        <Route path="models" element={<ModelVersionsPage />} />
        <Route path="models/eval/:versionId" element={<ModelEvalPage />} />
        <Route path="deploy/config/:versionId" element={<DeployConfigPage />} />
        <Route path="deploy/instances" element={<DeployInstancesPage />} />
        <Route path="api-docs" element={<ApiDocsPage />} />
        <Route path="resources" element={<ResourceMonitorPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
