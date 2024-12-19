import Cookies from "js-cookie";

import { backendURL, domain, path } from "../config";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useCallback } from "react";

interface XeroCredentials {
  accessToken: string | undefined;
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

  const connectXero = async () => {
    const windowFeatures =
      "width=600,height=600,resizable=yes,scrollbars=yes,status=yes";

    try {
      const popup = window.open(
        `${backendURL}/connect`,
        "Xero Authentication",
        windowFeatures
      );

      // Poll for popup closure
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
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
      // Configure Cookies to work with your domain
      Cookies.withAttributes({ domain: domain, path: path });

      const accessToken = Cookies.get("xeroAccessToken");
      const refreshToken = Cookies.get("xeroRefreshToken");
      const tenantId = Cookies.get("xeroTenantId");

      console.log({
        accessToken,
        refreshToken,
        tenantId,
      });

      return {
        accessToken,
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