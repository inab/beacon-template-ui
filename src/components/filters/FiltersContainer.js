import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CommonFilters from "./CommonFilters";
import GenomicAnnotations from "../genomic/GenomicAnnotations";
import OmopFilters from './OmopFilters.js'
import HpoFilters from './HpoFilters.js'
import { useSelectedEntry } from "../context/SelectedEntryContext";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  {
    /* This is the main container for the common filters and genomic annotation */
  }
  return (
    <div
      role="tabpanel"
      className="tabpanel"
      hidden={value !== index}
      id={`filter-tabpanel-${index}`}
      aria-labelledby={`filter-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function FiltersContainer({
  searchHeight,
  hasGenomicAnnotationsConfig,
  hasCommonFiltersConfig,
  hasOMOPFilters,
  hasHPOFilters,
}) {
  const { selectedPathSegment, entryTypes } = useSelectedEntry();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    setTabValue(0);
  }, [selectedPathSegment]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const hasGenomic = entryTypes.some(
    (entry) => entry.pathSegment === "g_variants"
  );

  const isGenomicSelected = selectedPathSegment === "g_variants";

  const isOmopSelected = hasOMOPFilters;


  let tabs = [];

  if (hasGenomic && isGenomicSelected) {
    tabs = [
      ...(hasGenomicAnnotationsConfig
        ? [
            {
              label: "Genomic Annotations",
              component: <GenomicAnnotations />,
              title: "Genomic Annotations",
            },
          ]
        : []),
      ...(hasCommonFiltersConfig
        ? [
            {
              label: "Common Filters",
              component: <CommonFilters />,
              title: "Most Common Filters",
            },
          ]
        : []),
    ];
  } else {
    tabs = [];

    if (hasCommonFiltersConfig) {
      tabs.push({
        label: "Common Filters",
        component: <CommonFilters />,
        title: "Most Common Filters",
      });
    }

    if (hasGenomic && hasGenomicAnnotationsConfig) {
      tabs.push({
        label: "Genomic Annotations",
        component: <GenomicAnnotations />,
        title: "Genomic Annotations",
      });
    }
  }

  if (isOmopSelected) {
    tabs.unshift({
      key: "omop",
      label: "OMOP Filters",
      component: <OmopFilters />,
      title: "OMOP Filters",
    });
  }

  if (hasHPOFilters) {
    tabs.push({
      key: "hpo",
      label: "HPO Filters",
      component: <HpoFilters />,
      title: "HPO Filters",
    });
  }

  if (tabs.length === 0) return null;


  return (
    <Box>
      {/* This is the tabs container for: Common Filters and Genomic Annotations. The top part only */}
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="Filter tabs"
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "0px",
          padding: "4px",
          width: { md: "340px", lg: "400px" },
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTabs-flexContainer": {
            justifyContent: {
              xs: "flex-start",
              md: "center",
              lg: "center",
            },
          },
        }}
      >
        {/* This is for the labels only */}
        {tabs.map((tab, i) => (
          <Tab
            key={tab.label}
            label={tab.label}
            disableRipple
            sx={{
              textTransform: "none",
              paddingX: { xs: "12px", md: "9.5px", lg: "12px" },
              fontSize: "13px",
              borderRadius: "8px 8px 0 0",
              fontWeight: tabValue === i ? "bold" : "normal",
              minHeight: "unset",
              minWidth: "auto",
              color: tabValue === i ? "#000" : "#9E9E9E",
              marginRight: i !== tabs.length - 1 ? 1.5 : 0,
              backgroundColor: tabValue === i ? "#fff" : "transparent",
              boxShadow:
                tabValue === i ? "0px 1px 3px rgba(0,0,0,0.1)" : "none",
              "&:hover": {
                backgroundColor: tabValue === i ? "#fff" : "#e0e0e0",
              },
              "&.Mui-selected": {
                color: "#000",
              },
            }}
          />
        ))}
      </Tabs>
      <Box
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          backgroundColor: "white",
          mt: "-4px",
          overflow: "hidden",
          height: {
            lg: `${searchHeight}px`,
            md: `${searchHeight}px`,
            sm: "350px",
            xs: "350px",
          },
        }}
      >
        {tabs.map((tab, i) => (
          <TabPanel value={tabValue} index={i} key={tab.label}>
            <Box sx={{ padding: "20px" }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  lineHeight: "19px",
                  mb: 0.5,
                  color: "black",
                }}
              >
                {tab.title}
              </Typography>
              {tab.component}
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
