'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/lib/i18n-context';

export default function Home() {
  const { data: session, isPending: loading } = authClient.useSession();
  const isAuthenticated = !!session;
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/LOGO-SOUSS-MASSA-1033x308px-removebg-preview.png"
                alt="Société Régionale Multiservices SOUSS MASSA"
                width={150}
                height={45}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button>{t('landing.hero.accessDashboard')}</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-in">
                    <Button variant="outline">{t('landing.hero.signIn')}</Button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <Button>{t('landing.hero.createAccount')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('landing.hero.title')}
              <span className="block text-blue-600">{t('landing.hero.subtitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('landing.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-3">
                    {t('landing.hero.accessDashboard')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="text-lg px-8 py-3">
                      {t('landing.hero.createAccount')}
                    </Button>
                  </Link>
                  <Link href="/auth/sign-in">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                      {t('landing.hero.signIn')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing.features.interventions.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.interventions.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing.features.reclamations.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.reclamations.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing.features.reports.title')}</h3>
              <p className="text-gray-600">
                {t('landing.features.reports.description')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/LOGO-SOUSS-MASSA-1033x308px-removebg-preview.png"
            alt="Société Régionale Multiservices SOUSS MASSA"
            width={120}
            height={36}
            className="h-9 w-auto mx-auto mb-4"
          />
          <p className="text-gray-400">
            {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
