import Fuse from "fuse.js";
import { COMMON_MESSAGES } from "../common/CommonMessage";

const KNOWN_VOCABULARIES = ["SNOMED", "LOINC", "Gender", "Race", "RxNorm"];

export function ensureColonSeparator(id) {
  if (!id || id.includes(":")) return id;
  // HPO: vocabulary_id='HPO' + concept_code='HP_XXXXXXX' → 'HPOHP_XXXXXXX'
  if (id.startsWith("HPOHP_")) {
    return id.slice("HPO".length); // 'HP_XXXXXXX'
  }
  // HP: vocabulary_id='HP' + concept_code='XXXXXXX' → 'HPXXXXXXX' (needs underscore, not colon)
  if (id.startsWith("HP") && !id.includes("_")) {
    return "HP_" + id.slice(2);
  }
  const vocab = KNOWN_VOCABULARIES.find((v) => id.startsWith(v));
  return vocab ? `${vocab}:${id.slice(vocab.length)}` : id;
}

export function assignDefaultScopesToTerms(
  terms,
  defaultScope,
  scopeAlias = {}
) {
  if (!terms || terms.length === 0 || !defaultScope) return {};

  const normalized = scopeAlias[defaultScope] || defaultScope;
  const defaults = {};

  terms.forEach((term) => {
    const match = term.scopes?.find(
      (scope) => scope.toLowerCase() === normalized.toLowerCase()
    );

    if (match) {
      defaults[term.id] = match;
    } else if (term.scopes?.length > 0) {
      defaults[term.id] = term.scopes[0];
    }
  });

  return defaults;
}

export function searchFilteringTerms(terms, searchInput) {
  if (!terms || terms.length === 0 || !searchInput) return [];

  const fuse = new Fuse(terms, {
    keys: ["label", "id"],
    threshold: 0.3,
  });

  return fuse.search(searchInput).map((r) => r.item);
}

export function handleFilterSelection({
  item,
  prevFilters,
  setMessage,
  onSuccess = () => {},
}) {
  const isDuplicate = prevFilters.some(
    (filter) => filter.key === item.key && filter.scope === item.scope
  );

  if (isDuplicate) {
    setMessage(COMMON_MESSAGES.doubleFilter);
    setTimeout(() => setMessage(null), 3000);
    return prevFilters;
  }

  onSuccess();
  return [...prevFilters, item];
}

export function getDisplayLabelAndScope(term, selectedEntryType) {
  const scopes = term.scopes || [];

  if (!selectedEntryType) selectedEntryType = "";

  const aliasMap = {
    individuals: "individual",
    biosamples: "biosample",
    cohorts: "cohort",
    datasets: "dataset",
    runs: "run",
    analyses: "analysis",
    g_variants: "genomic_variant",
  };

  const normalizedEntryType =
    aliasMap[selectedEntryType.toLowerCase()] ||
    selectedEntryType.toLowerCase();

  if (scopes.length === 0) {
    return {
      displayLabel: term.label,
      selectedScope: null,
      allScopes: [],
      needsSelection: false,
    };
  }

  if (scopes.length === 1) {
    return {
      displayLabel: term.label,
      selectedScope: scopes[0],
      allScopes: scopes,
      needsSelection: false,
    };
  }

  const preselected =
    scopes.find(
      (scope) => scope.toLowerCase() === normalizedEntryType.toLowerCase()
    ) || scopes[0];

  return {
    displayLabel: term.label,
    selectedScope: preselected,
    allScopes: scopes,
    needsSelection: true,
  };
}
