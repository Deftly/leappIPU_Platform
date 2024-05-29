import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import { DOCS_PER_PAGE } from "../utils/constants";
import { useElasticsearchWorkflows } from "../hooks/useWorkflows";
import WorkflowTableV2 from "../features/workflows/WorkflowTableV2";
import RegionFilter from "../features/workflows/RegionFilter";
import WorkflowTypeFilter from "../features/workflows/WorkflowTypeFilter";
import StatusFilter from "../features/workflows/StatusFilter";
import DateRangeFilter from "../features/workflows/DateRangeFilter";

import Heading from "../ui/Heading";
import SearchBar from "../ui/SearchBar";
import Pagination from "../ui/Pagination";
import Button from "../ui/Button";

const Workflows = () => {
  const navigate = useNavigate();
  const queryParams = useQueryParams();

  // State variables
  const [currentPage, setCurrentPage] = useState(
    parseInt(queryParams.page) || 1,
  );
  const [searchQuery, setSearchQuery] = useState(queryParams.search || "");
  const [regions, setRegions] = useState(
    queryParams.regions ? queryParams.regions.split(",") : [],
  );
  const [workflowTypes, setWorkflowTypes] = useState(
    queryParams.workflowTypes ? queryParams.workflowTypes.split(",") : [],
  );
  const [failed, setFailed] = useState(
    queryParams.failed === undefined ? null : queryParams.failed === "true",
  );
  const [startDate, setStartDate] = useState(queryParams.startDate || null);
  const [endDate, setEndDate] = useState(queryParams.endDate || null);

  console.log(startDate);
  console.log(endDate);

  const { isLoading, data } = useElasticsearchWorkflows({
    pageParam: currentPage - 1,
    searchQuery,
    regions,
    workflowTypes,
    failed,
    startDate,
    endDate,
  });

  const workflows = useMemo(() => data?.workflows || [], [data]);
  const totalHits = data?.totalHits || 0;

  // Handle functions
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const newSearchParams = new URLSearchParams(queryParams);
    newSearchParams.set("page", newPage);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  const handleSearch = (event) => {
    const newSearchQuery = event.target.value;
    setSearchQuery(newSearchQuery);
    updateQueryParams({ search: newSearchQuery });
  };

  const handleRegionChange = (selectedRegions) => {
    setRegions(selectedRegions);
    updateQueryParams({ regions: selectedRegions.join(",") });
  };

  const handleWorkflowTypeChange = (selectedWorkflowTypes) => {
    setWorkflowTypes(selectedWorkflowTypes);
    updateQueryParams({ workflowTypes: selectedWorkflowTypes.join(",") });
  };

  const handleFailedChange = (selectedStatus) => {
    setFailed(selectedStatus);
    updateQueryParams({ failed: selectedStatus });
  };

  const handleDateChange = ({ startDate, endDate }) => {
    setStartDate(startDate);
    setEndDate(endDate);
    const updatedQueryParams = {};
    if (
      startDate instanceof Date &&
      !isNaN(startDate) &&
      endDate instanceof Date &&
      !isNaN(endDate)
    ) {
      updatedQueryParams.startDate = startDate.toISOString();
      updatedQueryParams.endDate = endDate.toISOString();
    } else {
      updatedQueryParams.startDate = null;
      updatedQueryParams.endDate = null;
    }
    updateQueryParams(updatedQueryParams);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setRegions([]);
    setWorkflowTypes([]);
    setFailed(null);
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);

    updateQueryParams({
      search: null,
      regions: null,
      workflowTypes: null,
      failed: null,
      startDate: null,
      endDate: null,
      page: null,
    });
  };

  const updateQueryParams = (newParams) => {
    const newSearchParams = new URLSearchParams(queryParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    newSearchParams.set("page", "1");
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
    setCurrentPage(1);
  };

  return (
    <div className="mt-1">
      <div className="flex justify-between items-end mb-8">
        <Heading as="h1">Workflows</Heading>
      </div>

      <div className="flex items-center justify-between mb-2">
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
        <Button size="md" variation="primary">
          Export
        </Button>
      </div>
      <div className="flex items-center justify-start space-x-4 mb-8">
        <RegionFilter
          selectedRegions={regions}
          onRegionChange={handleRegionChange}
        />
        <WorkflowTypeFilter
          selectedWorkflowTypes={workflowTypes}
          onWorkflowTypeChange={handleWorkflowTypeChange}
        />
        <StatusFilter
          selectedStatus={failed}
          onStatusChange={handleFailedChange}
        />
        <DateRangeFilter
          onDateChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
        />
        <Button onClick={handleResetFilters} size="md">
          Reset Filters
        </Button>
      </div>

      <WorkflowTableV2 workflows={workflows} isLoading={isLoading} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalHits / DOCS_PER_PAGE)}
        onPageChange={handlePageChange}
        totalItems={totalHits}
        itemsPerPage={DOCS_PER_PAGE}
      />
    </div>
  );
};

const useQueryParams = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParams = {};
  for (const [key, value] of searchParams.entries()) {
    if (key === "startDate" || key === "endDate") {
      const date = moment(value);
      queryParams[key] = date.isValid() ? date.toDate() : null;
    } else {
      queryParams[key] = value;
    }
  }
  return queryParams;
};

export default Workflows;
