import Cookies from "js-cookie";

import { backendURL, domain, path } from "../config";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useCallback, useRef } from "react";

interface XeroCredentials {
  accessToken: string | undefined;
  clientId: string | undefined;
  clientSecret: string | undefined;
  refreshToken: string | undefined;
  tenantId: string | undefined;
}

interface UseXeroReturn {
  connectXero: () => Promise<void>;
  getAccounts: () => Promise<XeroCredentials>;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useXero = (): UseXeroReturn => {
  const { isAuthenticated, loading, checkAuthStatus } = useAuth();
  const popupRef = useRef<Window | null>(null);

  const connectXero = async () => {
    const windowFeatures =
      "width=600,height=600,resizable=yes,scrollbars=yes,status=yes";

    try {
      popupRef.current = window.open(
        `${backendURL}/connect`,
        "Xero Authentication",
        windowFeatures
      );

      // Poll for popup closure
      const pollTimer = setInterval(() => {
        if (popupRef.current?.closed) {
          clearInterval(pollTimer);
          checkAuthStatus();
        }
      }, 500);
    } catch (err) {
      console.error("Failed to connect to Xero:", err);
      throw err;
    }
  };

  const getAccounts = useCallback(async (): Promise<XeroCredentials> => {
    try {
      Cookies.withAttributes({ domain: domain, path: path });

      const accessToken = Cookies.get("xeroAccessToken");
      const clientId = Cookies.get("xeroClientId");
      const clientSecret = Cookies.get("xeroClientSecret");
      const refreshToken = Cookies.get("xeroRefreshToken");
      const tenantId = Cookies.get("xeroTenantId");

      console.log({
        accessToken,
        clientId,
        clientSecret,
        refreshToken,
        tenantId,
      });

      return {
        accessToken,
        clientId,
        clientSecret,
        refreshToken,
        tenantId,
      };
    } catch (err) {
      console.error("Failed to get Xero accounts:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === backendURL) {
        if (event.data.type === "XERO_AUTH_SUCCESS") {
          // Close the popup window after successful authentication
          if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.close();
          }
          checkAuthStatus();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkAuthStatus]);

  return {
    connectXero,
    getAccounts,
    isAuthenticated,
    loading,
  };
};
