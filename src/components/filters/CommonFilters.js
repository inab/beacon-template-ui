import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import { useSelectedEntry } from "./../context/SelectedEntryContext";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";
import { getDisplayLabelAndScope } from "../common/filteringTermsHelpers";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";

function GenderSelect({ item, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const primary = globalThis.CONFIG?.ui?.colors?.primary || "#1976d2";
  const bg = alpha(primary, 0.05);
  const hoverBg = alpha(primary, 0.15);

  return (
    <>
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          height: 32,
          padding: "4px 12px",
          borderRadius: "8px",
          border: "1px solid black",
          backgroundColor: bg,
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          "&:hover": { backgroundColor: hoverBg },
        }}
      >
        <Typography sx={{ fontSize: "14px" }}>{item.label}</Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 16,
            opacity: 0.7,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "8px",
            border: "1px solid black",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            mt: 0.5,
          },
        }}
      >
        {item.options.map((opt) => (
          <MenuItem
            key={opt.key}
            onClick={() => {
              onSelect({ key: opt.key, label: opt.label, type: "ontology" });
              setAnchorEl(null);
            }}
            sx={{ fontSize: "14px", py: 0.75 }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function CommonFilters() {
  const filterCategories = CONFIG.ui.commonFilters.filterCategories;
  const filterLabels = CONFIG.ui.commonFilters.filterLabels;
  const {
    setSelectedFilter,
    setExtraFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult,
    selectedPathSegment,
  } = useSelectedEntry();

  const getValidLabels = (topic) =>
    (filterLabels[topic] ?? []).filter((item) => {
      const label = item.label?.trim();
      if (!label || /^(item.label)\d*$/i.test(label)) return false;

      const { selectedScope } = getDisplayLabelAndScope(
        item,
        selectedPathSegment
      );
      return selectedScope !== null || !item.scopes || item.scopes.length === 0;
    });

  const [message, setMessage] = useState(null);
  const [expanded, setExpanded] = useState(() => {
    const initialState = {};
    let firstSet = false;
    filterCategories.forEach((topic) => {
      const validLabels = getValidLabels(topic);
      if (validLabels.length > 0 && !firstSet) {
        initialState[topic] = true;
        firstSet = true;
      } else {
        initialState[topic] = false;
      }
    });
    return initialState;
  });

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded({ [panel]: isExpanded });
  };

  const handleCommonFilterChange = (item) => {
    setLoadingData(false);
    setResultData([]);
    setHasSearchResult(false);

    if (item.type === "alphanumeric") {
      setExtraFilter(item);
    } else {
      setSelectedFilter((prevFilters) => {
        const isDuplicate = prevFilters.some(
          (filter) => filter.key === item.key && filter.scope === item.scope
        );

        if (isDuplicate) {
          setMessage(COMMON_MESSAGES.doubleFilter);
          setTimeout(() => setMessage(null), 3000);
          return prevFilters;
        }

        return [...prevFilters, item];
      });
    }
  };

  const summarySx = {
    px: 0,
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginLeft: "auto",
      transition: "transform 0.2s ease-in-out",
    },
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": {
      mr: 1,
    },
  };

  return (
    <>
      {message && (
        <Box sx={{ mt: 2 }}>
          <CommonMessage text={COMMON_MESSAGES.doubleFilter} type="error" />
        </Box>
      )}
      <Box>
        {filterCategories.map((topic) => {
          const validLabels = getValidLabels(topic);
          if (validLabels.length === 0) return null;

          return (
            <Accordion
              key={topic}
              expanded={!!expanded[topic]}
              onChange={handleChange(topic)}
              disableGutters
              elevation={0}
              sx={{
                backgroundColor: "transparent",
                boxShadow: "none",
                "&::before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<KeyboardArrowRightIcon />}
                sx={summarySx}
              >
                <Typography
                  translate="no"
                  sx={{ fontStyle: "italic", fontSize: "14px" }}
                >
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {validLabels.map((item) => {
                    if (item.type === "gender-select") {
                      return (
                        <GenderSelect
                          key={item.label}
                          item={item}
                          onSelect={handleCommonFilterChange}
                        />
                      );
                    }

                    const { selectedScope, allScopes } =
                      getDisplayLabelAndScope(item, selectedPathSegment);

                    return (
                      <FilterLabelRemovable
                        variant="simple"
                        key={item.label}
                        label={item.label}
                        onClick={() =>
                          handleCommonFilterChange({
                            ...item,
                            scope: selectedScope || allScopes?.[0] || null,
                            scopes: allScopes ?? [],
                          })
                        }
                        bgColor="common"
                      />
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </>
  );
}
