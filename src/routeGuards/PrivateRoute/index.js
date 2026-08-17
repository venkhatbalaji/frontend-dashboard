import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { useSession, getSession } from "next-auth/react";
import StorageService from '../../services/storageService';
import { Router } from '@/utils/router';

const { publicRuntimeConfig } = getConfig();
const { KEYCLOAK_ENABLED, BASE_URL } = publicRuntimeConfig;

function Private({ children }) {
  const sessionObj = useSession();
  const { data: session, status } = sessionObj;
  const router = useRouter();
  const isAuthenticated = KEYCLOAK_ENABLED === 'true' ? status === 'authenticated' : Boolean(StorageService.get('authorization')?.access_token);
  const isSessionExpired = KEYCLOAK_ENABLED === 'true' ? !!session?.error : false;
  const isLoading = status === 'loading';
  function saveSessionToStorage(session) {
    StorageService.set('authorization', {
      access_token: session.accessToken,
      tokenParsed: session.tokenParsed,
    });
  }

  function removeSessionFromStorage() {
    if (KEYCLOAK_ENABLED === 'true') {
      const origin = window.location.origin;
      const baseUrl = `${origin}${BASE_URL}/login`;
      const queryString = router.asPath.split('?')[1];

      const redirectUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      router.push(`/api/auth/logout?redirectUrl=${encodeURIComponent(redirectUrl)}`);
    } else {
      // StorageService.removeAll()
      router.push('/login')
    }
  }
  useEffect(() => {
    if (KEYCLOAK_ENABLED === 'true' && session?.accessToken) {
      saveSessionToStorage(session)
      const tokenExpiresIn = (session?.expires_at * 1000 - Date.now())

      const timeoutRef = setTimeout(async () => {
        try {
          const _session = await getSession();
          saveSessionToStorage(_session);
        } catch (e) {
          removeSessionFromStorage()
        }
      }, tokenExpiresIn)

      
      return () => {
        clearTimeout(timeoutRef);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (((!isAuthenticated && !isLoading) || (isSessionExpired && !isLoading))) {
      removeSessionFromStorage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, isSessionExpired]);

  if (!isAuthenticated || isLoading || isSessionExpired) {
    return (
      <div style={{ maxWidth: "1920px" }} className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Router />
      {children}
    </>
  );
}

Private.propTypes = {
  children: PropTypes.element.isRequired
};

export default Private;