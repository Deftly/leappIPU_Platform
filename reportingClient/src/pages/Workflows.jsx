import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { DOCS_PER_PAGE } from "../utils/constants";
import { useElasticsearchWorkflows } from "../hooks/useWorkflows";
import WorkflowTableV2 from "../features/workflows/WorkflowTableV2";

import Heading from "../ui/Heading";
import SearchBar from "../ui/SearchBar";
import Pagination from "../ui/Pagination";
import Button from "../ui/Button";

const Workflows = () => {
  const navigate = useNavigate();
  const queryParams = useQueryParams();

  const [currentPage, setCurrentPage] = useState(
    parseInt(queryParams.page) || 1,
  );
  const [searchQuery, setSearchQuery] = useState(queryParams.search || "");

  const { isLoading, data } = useElasticsearchWorkflows(
    currentPage - 1,
    searchQuery,
  );

  const workflows = useMemo(() => data?.workflows || [], [data]);
  const totalHits = data?.totalHits || 0;

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

      <div className="flex items-center justify-between mb-8">
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
        <Button size="md" variation="primary">
          Export
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
    queryParams[key] = value;
  }
  return queryParams;
};

export default Workflows;
