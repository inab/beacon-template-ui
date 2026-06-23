import {
  BEACON_NETWORK_COLUMNS,
  BEACON_SINGLE_COLUMNS,
} from "../../lib/constants";
import React, { lazy, Suspense } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

import { useSelectedEntry } from "../context/SelectedEntryContext";
import { lighten } from "@mui/system";
import { useState } from "react";
import ResultsTableRow from "./ResultsTableRow";
const ResultsTableModal = lazy(() => import("./modal/ResultsTableModal"));

export default function ResultsTable() {
  const { resultData, beaconsInfo } = useSelectedEntry();
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const headerCellStyle = {
    backgroundColor: CONFIG.ui.colors.primary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: lighten(CONFIG.ui.colors.primary, 0.1),
    },
  };

  const rowKey = (item) => item?.beaconId ?? item?.id;

  const handleRowClick = (item) => {
    if (expandedRow && rowKey(expandedRow) === rowKey(item)) {
      setExpandedRow(null);
    } else {
      setExpandedRow(item);
    }
  };

  let tableColumns =
    CONFIG.beaconType === "singleBeacon"
      ? BEACON_SINGLE_COLUMNS
      : BEACON_NETWORK_COLUMNS;

  const selectedBgColor = lighten(CONFIG.ui.colors.primary, 0.9);

  const handleRowClicked = (item) => {
    setSelectedSubRow(item);
  };

  const handleOpenModal = (subRow) => {
    setSelectedSubRow(subRow);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // 401/403 are expected, resolvable states (login/permissions) — treated as
  // warnings (amber). Everything else is a real beacon/network failure (red).
  const RESPONSE_STATUS = {
    0:   { severity: "error",   short: "Connection failed", long: "Could not connect to the beacon. It may be down or unreachable." },
    400: { severity: "error",   short: "Bad request",       long: "Bad request — the query could not be processed by the beacon." },
    401: { severity: "warning", short: "Login required",    long: "Authentication required — please log in to access this data." },
    403: { severity: "warning", short: "Access denied",     long: "Access denied — you don't have permission to query this beacon." },
    404: { severity: "error",   short: "Not supported",     long: "Endpoint not found in this beacon." },
    500: { severity: "error",   short: "Beacon error",      long: "The beacon encountered an internal error." },
    503: { severity: "error",   short: "Unavailable",       long: "Beacon temporarily unavailable. Try again later." },
  };

  const SEVERITY_COLORS = {
    error:   { text: "#d32f2f", bg: "#fff5f5", bgHover: "#ffe5e5" },
    warning: { text: "#b45309", bg: "#fff8e1", bgHover: "#ffecb3" },
  };

  const getResponseStatus = (data) => {
    if (!data?.error) return null;
    const code = data.error.errorCode;
    const status = RESPONSE_STATUS[code] ?? { severity: "error", short: "Unexpected error", long: "Unexpected error from the beacon." };
    // the raw errorMessage from beacons/aggregators often leaks internal
    // hostnames/implementation details — not shown to the end user.
    return { ...status, long: `${status.long} (${code})` };
  };

  const findBeaconEnvironment = (beaconId) => {
    let beacon = {};
    if (CONFIG.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }
    if (!beacon) return null;
    const environment = beacon.response
      ? beacon.response?.environment
      : beacon.environment;
    return environment ?? null;
  };

  const findBeaconIcon = (beaconId) => {
    let beacon = {};
    if (CONFIG.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }

    if (!beacon) return null;
    const logo = beacon.response
      ? beacon.response?.organization?.logoUrl
      : beacon.organization?.logoUrl;
    return logo ?? null;
  };

  const findBeaconEmail = (beaconId) => {
    let beacon = {};
    if (CONFIG.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }
    if (!beacon) return null;
    const email = beacon.response
      ? beacon.response?.organization?.contactUrl
      : beacon.organization?.contactUrl;
    return email ?? null;
  };

  const handleEmail = (email) => {
    const address = email.replace(/^mailto:/i, "");
    window.location.href = `mailto:${address}`;
  };

  return (
    <Box>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: "none",
          borderRadius: 0,
        }}
      >
        <TableContainer>
          <Table stickyHeader aria-label="Results table">
            <TableHead>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ width: column.width }}
                    sx={{
                      ...headerCellStyle,
                      width: column.width,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData.map((item, index) => {
                const iconUrl = findBeaconIcon(item.beaconId);
                const itemEmail = findBeaconEmail(item.beaconId);
                const environment = findBeaconEnvironment(item.beaconId);
                const status = item.info ? getResponseStatus(item.info) : null;
                const hasError = Boolean(status);
                const colors = status ? SEVERITY_COLORS[status.severity] : null;

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      key={index}
                      onClick={() => handleRowClick(item)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: hasError ? colors.bg : "inherit",
                        "&:hover": {
                          backgroundColor: hasError ? colors.bgHover : selectedBgColor,
                        },
                        "&.MuiTableRow-root": {
                          transition: "background-color 0.2s ease",
                        },
                        "& td": {
                          borderBottom: "1px solid rgba(224, 224, 224, 1)",
                          py: 1.5,
                        },
                        fontWeight: "bold",
                      }}>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[0].width }}>
                        <Box display="flex"  justifyContent="flex-start" alignItems="center" gap={1}>
                          { item.description &&
                            <Tooltip title={ item.description	 ? item.description	: item.name }>
                              <IconButton>
                                <InfoIcon sx={{ color: CONFIG.ui.colors.primary }} />
                              </IconButton>
                            </Tooltip>
                          }
                          { (item.items.length>0 || status) && rowKey(item) && (
                              expandedRow && rowKey(expandedRow) === rowKey(item) ? (
                              <KeyboardArrowDownIcon />
                            ) : (
                              <KeyboardArrowUpIcon />
                            ))}
                          {iconUrl && (
                            <img
                              className="table-icon"
                              src={iconUrl}
                              alt="Beacon logo"
                            />
                          )}
                          <span>{ item.beaconId ? item.beaconId : item.id }</span>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[1].width }}>
                        {environment ? environment.charAt(0).toUpperCase() + environment.slice(1) : "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[2].width }}>{item.items.length>0 ?  item.items.length + " Datasets" : "-"}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: BEACON_NETWORK_COLUMNS[3].width }}>
                        { hasError
                          ? <span style={{ color: colors.text }}>{status.short}</span>
                          : item.totalResultsCount > 0
                            ? new Intl.NumberFormat(navigator.language, { useGrouping: true }).format(Number(item.totalResultsCount))
                            : 0
                        }
                      </TableCell>
                      <TableCell
                        style={{ 
                          width: BEACON_NETWORK_COLUMNS[4].width,
                          align: BEACON_NETWORK_COLUMNS[4].align,
                        }}
                        align={ 
                          BEACON_NETWORK_COLUMNS[4].align
                        }
                        >
                          { itemEmail && (
                              <Button
                                variant="text"
                                startIcon={<MailOutlineIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmail(itemEmail);
                                }}
                                sx={{
                                  textTransform: "none",
                                  fontSize: "14px",
                                  fontWeight: 400,
                                  fontFamily: '"Open Sans", sans-serif',
                                  backgroundColor: "transparent",
                                  color: "gray",
                                  minWidth: 0,
                                  height: "30px",
                                  padding: "0 6px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  transition: 'all 0.3s ease',
                                  "&:hover": {
                                    color: CONFIG.ui.colors.primary,
                                  },
                                }}
                                >
                                  {itemEmail.replace(/^mailto:/i, "")}
                              </Button>
                          )}
                        </TableCell>
                    </TableRow>

                    {expandedRow &&
                      rowKey(expandedRow) &&
                      rowKey(expandedRow) === rowKey(item) && (
                        <ResultsTableRow
                          item={expandedRow}
                          status={status}
                          colors={colors}
                          handleRowClicked={handleRowClicked}
                          handleOpenModal={() => handleOpenModal(expandedRow)}
                        />
                      )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {selectedSubRow && (
        <Suspense fallback={<div>Loading...</div>}>
          <ResultsTableModal
            subRow={selectedSubRow}
            handleRowClicked={handleRowClicked}
            open={modalOpen}
            onClose={() => handleCloseModal()}
          />
        </Suspense>
      )}
    </Box>
  );
}
