import { useAuth } from "react-oidc-context";
import {
  useLocation,
  useSearchParams,
  Navigate,
  Link as RouterLink,
} from "react-router-dom";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fade,
} from "@mui/material";

export default function Login() {
  const auth = useAuth();
  const location = useLocation();
  const [sp] = useSearchParams();

  const CFG = globalThis.CONFIG ?? {};
  const UI = CFG.ui ?? {};
  const LOGOS = UI.logos ?? {};
  const loginRequired = Boolean(CFG.loginRequired);

  const REDIRECT_URI = globalThis.OIDCCfg?.redirectUri || window.location.origin;

  const from = location.state?.from?.pathname || "/";
  const hasCallback = sp.has("code") || sp.has("error");
  const err = sp.get("error");
  const errDesc = sp.get("error_description");

  if (auth.isAuthenticated && !auth.user?.expired) {
    const to = sessionStorage.getItem("returnTo") || from || "/";
    sessionStorage.removeItem("returnTo");
    return <Navigate to={to} replace />;
  }

  const startLogin = () => {
    sessionStorage.setItem("returnTo", from);
    auth.signinRedirect({ redirect_uri: REDIRECT_URI });
  };

  const retry = () => {
    auth.signinRedirect({ redirect_uri: REDIRECT_URI });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        position: "relative",
      }}
    >
      <Fade in timeout={300}>
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 440,
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5 },
            borderRadius: 3,
            backdropFilter: "blur(6px)",
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            {LOGOS.mainSecondary ? (
              <Box
                component="img"
                alt="Logo"
                src={LOGOS.mainSecondary}
                sx={{ height: 54, objectFit: "contain" }}
              />
            ) : (
              <Typography variant="h5" fontWeight={700}>
                {UI.title || "Beacon Network"}
              </Typography>
            )}

            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>
                { loginRequired ? "Log In to continue": '' }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Log in with your account to enjoy all the features.
              </Typography>
            </Stack>

            {(hasCallback || auth.activeNavigator === "signinRedirect") && (
              <Stack spacing={2} sx={{ width: "100%", mt: 1 }}>
                {!err ? (
                  <Stack spacing={1} alignItems="center">
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Finishing sign-in…
                    </Typography>
                  </Stack>
                ) : (
                  <>
                    <Alert severity="error" sx={{ textAlign: "left" }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Login error
                      </Typography>
                      <Typography variant="body2">
                        {errDesc || err}
                      </Typography>
                    </Alert>
                    <Button
                      onClick={retry}
                      variant="contained"
                      size="large"
                      sx={{ textTransform: "none" }}
                    >
                      Retry
                    </Button>
                  </>
                )}
              </Stack>
            )}

            {!hasCallback && auth.activeNavigator !== "signinRedirect" && (
              <Stack spacing={2} sx={{ width: "100%", mt: 1 }}>
                <Button
                  onClick={startLogin}
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    textTransform: "none",
                    py: 1.25,
                    borderRadius: 2,
                  }}
                >
                  Log in
                </Button>
              </Stack>
            )}

            <Typography variant="caption" color="text.secondary">
              By continuing, you accept the organization's privacy policy.
            </Typography>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
}
