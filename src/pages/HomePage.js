import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Founders from "../components/Founders";
import FiltersContainer from "../components/filters/FiltersContainer";
import Search from "../components/Search";
import AllFilteringTermsComponent from "../components/filters/AllFilteringTermsComponent";
import ResultsContainer from "../components/results/ResultsContainer";
import BeaconTypeBanner from "../components/homepageBanner/BeaconTypeBanner";
import { useSelectedEntry } from "../components/context/SelectedEntryContext";

export default function HomePage({ selectedTool, setSelectedTool }) {
  const [searchHeight, setSearchHeight] = useState(null);

  const { hasSearchBeenTriggered } = useSelectedEntry();

  const hasGenomicAnnotationsConfig =
    !!CONFIG.ui?.genomicAnnotations?.visibleGenomicCategories;

  const hasCommonFiltersConfig =
    !!CONFIG.ui?.commonFilters?.filterCategories?.length &&
    !!CONFIG.ui?.commonFilters?.filterLabels &&
    Object.keys(CONFIG.ui.commonFilters.filterLabels).length > 0;

  const hasOMOPFilters = CONFIG.omop;
  const hasHPOFilters = CONFIG.hpo;

  useEffect(() => {
    if (hasOMOPFilters) setSearchHeight(420);
  }, [hasOMOPFilters]);

  const shouldShowFilters =
    hasGenomicAnnotationsConfig || hasCommonFiltersConfig || hasHPOFilters;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { lg: 4, md: 4, sm: 0 },
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            flexGrow: { xs: 0, md: 1 },
            display: "flex",
            flexDirection: "column",
            width: { lg: "60%", md: "60%" },
          }}
        >
          <Founders />
          <Search
            onHeightChange={(h) => {
              const n =
                typeof h === "number"
                  ? h
                  : Number(h?.height ?? h?.lg ?? h?.md ?? h?.value);
              if (Number.isFinite(n)) setSearchHeight(n);
            }}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
          />
        </Box>

        {shouldShowFilters && (
          <Box
            sx={{
              width: { xs: "100%", sm: "100%", md: "340px", lg: "400px" },
              flexShrink: 0,
              mt: { xs: "0px", md: "42px" },
              mb: { xs: "25px", lg: "0px" },
              alignSelf: "flex-start",
              height: hasOMOPFilters ? 480 : "auto",
              p: 0,
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <FiltersContainer
              searchHeight={hasOMOPFilters ? 410 : searchHeight}
              hasCommonFiltersConfig={hasCommonFiltersConfig}
              hasGenomicAnnotationsConfig={hasGenomicAnnotationsConfig}
              hasOMOPFilters={hasOMOPFilters}
              hasHPOFilters={hasHPOFilters}
            />
          </Box>
        )}
        {!hasSearchBeenTriggered && selectedTool !== "allFilteringTerms" && (
          <BeaconTypeBanner />
        )}
      </Box>
      <Box>
        {selectedTool === "allFilteringTerms" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginTop: { lg: "-40px", md: "-40px", sm: "20px", xs: "20px" },
              marginBottom: { lg: "30px", md: "30px", sm: "30px", xs: "30px" },
            }}
          >
            <AllFilteringTermsComponent />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          marginTop: { lg: hasOMOPFilters ? "10px" :"-30px", md: hasOMOPFilters ? "10px" :"-30px", sm: hasOMOPFilters ? "10px" :"200px", xs: hasOMOPFilters ? "10px" :"20px" },
          marginBottom: "30px",
        }}
      >
        <ResultsContainer />
      </Box>
    </>
  );
}
