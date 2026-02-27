import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import AppInitializer from './components/AppInitializer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CitizenNewsPage from './pages/CitizenNewsPage';
import CitizenPostDetailPage from './pages/CitizenPostDetailPage';
import MultimediaPage from './pages/MultimediaPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Root route with Layout wrapper
const rootRoute = createRootRoute({
  component: () => (
    <LanguageProvider>
      {/* AppInitializer calls actor.initialize() to bootstrap admin & seed data */}
      <AppInitializer />
      <Layout />
    </LanguageProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/category/$categoryName',
  component: CategoryPage,
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/article/$id',
  component: ArticleDetailPage,
});

const citizenNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/citizen-news',
  component: CitizenNewsPage,
});

const citizenPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/citizen-post/$id',
  component: CitizenPostDetailPage,
});

const multimediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/multimedia',
  component: MultimediaPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPolicyPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsOfServicePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  categoryRoute,
  articleRoute,
  citizenNewsRoute,
  citizenPostRoute,
  multimediaRoute,
  adminRoute,
  dashboardRoute,
  aboutRoute,
  privacyRoute,
  termsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
