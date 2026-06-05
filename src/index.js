import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadConfig, loadOIDCConfig } from "./configLoader";
import { AuthProvider } from "react-oidc-context";

(async () => {
  const root = createRoot(document.getElementById('root'));
  try {
    const cfg = await loadConfig();
    const OIDCCfg = await loadOIDCConfig();
    
    window.CONFIG  = cfg;
    globalThis.CONFIG = cfg; 

    window.OIDCCfg  = OIDCCfg;
    globalThis.OIDCCfg = OIDCCfg;

    const appOrigin = OIDCCfg.redirectUri || window.location.origin;
    const oidcConfig = {
      authority: `${OIDCCfg.oidcUrl}`,
      client_id: `${OIDCCfg.oidcClientId}`,
      client_secret: `${OIDCCfg.oidcClientSecret}`,
      redirect_uri: appOrigin,
      post_logout_redirect_uri: appOrigin,
      response_type: "code",
      scope: "openid profile email ga4gh_passport_v1",
      automaticSilentRenew: false,
      onSigninCallback: () => {
        const to = sessionStorage.getItem("returnTo") || "/";
        sessionStorage.removeItem("returnTo");
        window.history.replaceState({}, document.title, to);
      },
    };

    root.render(
      <AuthProvider {...oidcConfig}>
        <App />
      </AuthProvider>
    );

  } catch (err) {
    createRoot(document.getElementById("root")).render(
      <div style={{ padding: 16, color: "crimson" }}>
        Cannot load config: {err && err.message ? err.message : String(err)}
      </div>
    );
  }
})();