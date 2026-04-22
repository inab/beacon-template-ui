import { useState, useEffect } from "react";
import { Box, TextField, Typography, List, ListItem, InputAdornment, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";

const HPO_SEARCH_URL = "https://ontology.jax.org/api/hp/search";

export default function HpoFilters() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { setSelectedFilter, setLoadingData, setResultData, setHasSearchResult } =
    useSelectedEntry();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      const normalizedQuery = /^hp:/i.test(query.trim())
        ? query.trim().toUpperCase()
        : /^\d+$/.test(query.trim())
        ? `HP:${query.trim()}`
        : query.trim();
      fetch(`${HPO_SEARCH_URL}?q=${encodeURIComponent(normalizedQuery)}&limit=20`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setResults(data.terms ?? []);
          setLoading(false);
        })
        .catch(() => {
          setError("Could not reach the HPO API. Check your connection.");
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (term) => {
    const item = {
      key: term.id,
      id: term.id,
      label: term.name,
      type: "ontology",
      scope: null,
      scopes: [],
      bgColor: "common",
    };

    setLoadingData(false);
    setResultData([]);
    setHasSearchResult(false);

    setSelectedFilter((prev) => {
      const isDuplicate = prev.some((f) => f.key === item.key && f.scope === item.scope);
      if (isDuplicate) {
        setMessage(COMMON_MESSAGES.doubleFilter);
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }
      return [...prev, item];
    });
  };

  const showEmpty = !loading && query.trim().length >= 2 && results.length === 0 && !error;
  const showHint = query.trim().length < 2;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {message && (
        <Box sx={{ mb: 1 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      <TextField
        fullWidth
        size="small"
        placeholder="Search by name or HP:XXXXXXX"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "#9E9E9E" }} />
            </InputAdornment>
          ),
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={14} />
            </InputAdornment>
          ) : null,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: '"Open Sans", sans-serif',
            backgroundColor: "#F5F5F5",
            "& fieldset": { borderColor: "#E0E0E0" },
            "&:hover fieldset": { borderColor: "#BDBDBD" },
            "&.Mui-focused fieldset": {
              borderColor: CONFIG.ui.colors.darkPrimary,
            },
          },
          "& input": {
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "13px",
          },
        }}
      />

      {showHint && (
        <Typography sx={{ fontSize: "12px", color: "#9E9E9E", pl: 0.5 }}>
          Type at least 2 characters to search HPO terms.
        </Typography>
      )}

      {error && (
        <Box sx={{ mt: 1 }}>
          <CommonMessage text={error} type="error" />
        </Box>
      )}

      {showEmpty && (
        <Box sx={{ mt: 1 }}>
          <CommonMessage text={COMMON_MESSAGES.noMatch} type="error" />
        </Box>
      )}

      {results.length > 0 && (
        <Box
          sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            overflow: "hidden",
            maxHeight: "240px",
            overflowY: "auto",
            backgroundColor: "white",
          }}
        >
          <List disablePadding>
            {results.map((term, index) => (
              <ListItem
                key={term.id}
                onClick={() => handleSelect(term)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom:
                    index !== results.length - 1 ? "1px solid #E0E0E0" : "none",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#F5F5F5",
                  },
                }}
              >
                <Box
                  sx={{
                    fontSize: "12px",
                    fontFamily: '"Open Sans", sans-serif',
                    color: "#000",
                    pr: 1,
                    flexShrink: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {term.name}
                </Box>
                <Box
                  sx={{
                    fontSize: "12px",
                    fontFamily: '"Open Sans", sans-serif',
                    color: "#666",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {term.id}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
