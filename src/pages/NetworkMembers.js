import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link, 
  Skeleton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import LaunchIcon from "@mui/icons-material/Launch";

export default function NetworkMembers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const primary = window.CONFIG?.ui?.colors?.primary || "#3176B1";
  const dark = window.CONFIG?.ui?.colors?.darkPrimary || "#173D5D";

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const baseUrl = window.CONFIG.beaconType === "networkBeacon" ? window.CONFIG.apiUrlNetwork : window.CONFIG.apiUrl;
        const res = await fetch(`${baseUrl}/info`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const arr = Array.isArray(json?.responses) ? json.responses : [];
        setItems(arr);
      } catch (e) {
        setErr(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const cards = useMemo(
    () =>
      items.map((obj, i) => {
        const meta = obj?.meta || {};
        const r = obj?.response || {};
        return {
          key: `${r.id || r.name || meta.beaconId || i}`,
          name: r.name || r.title || r.id || meta.beaconId || "Unnamed",
          description: r.description || "",
          website:
            r.welcomeUrl || r.homepage || r.url || r.alternativeUrl || null,
          org: r.organization?.name || null,
          env: r.environment || meta.environment || null,
          version: r.version || null,
          apiVersion: r.apiVersion || meta.apiVersion || null,
        };
      }),
    [items]
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={260} height={36} />
        <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: dark, mb: 2 }}>
        Network Members
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 2
        }}
      >
        {cards.map((m) => (
          <Card key={m.key} variant="outlined"  
            sx={{
              height: "100%",
              border: `1px solid ${alpha(primary, 0.15)}`,
              boxShadow: `0 8px 24px ${alpha(primary, 0.14)}, 0 2px 6px rgba(0,0,0,0.06)`,
              transition: "transform .2s ease, box-shadow .2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 12px 32px ${alpha(primary, 0.20)}, 0 4px 10px rgba(0,0,0,0.08)`,
              },
            }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{m.name}</Typography>

              {m.org && (
                <Typography sx={{ color: "#555" }}>{m.org}</Typography>
              )}

              <Typography sx={{ color: "#444", mb: 1 }}>
                {m.description || "—"}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
                {m.website && (
                  <Link
                    href={m.website}
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{ color: primary }}
                  >
                    Website <LaunchIcon sx={{ fontSize: 16, ml: 0.5 }} />
                  </Link>
                )}
                {m.env && (
                  <Typography sx={{ color: "#666" }}>env: {m.env}</Typography>
                )}
                {m.version && (
                  <Typography sx={{ color: "#666" }}>
                    version: {m.version}
                  </Typography>
                )}
                {m.apiVersion && (
                  <Typography sx={{ color: "#666" }}>
                    api: {m.apiVersion}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
