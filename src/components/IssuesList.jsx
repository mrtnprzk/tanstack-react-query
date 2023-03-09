import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import fetchWithError from "../helpers/fetchWithError";
import IssueItem from "./IssueItem";
import Loader from "./Loader";

export default function IssuesList({ labels, status, pageNum, setPageNum }) {
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  const searchQuery = useQuery(
    ["issues", "search", searchValue],
    ({ signal }) =>
      fetch(`/api/search/issues?q=${searchValue}`, { signal }).then((res) =>
        res.json()
      ),
    { enabled: searchValue.length > 0 }
  );

  const issuesQuery = useQuery(
    ["issues", { labels, status, pageNum }],
    async ({ signal }) => {
      const statusString = status ? `&status=${status}` : "";
      const labelsString = labels.map((label) => `labels[]=${label}`).join("&");
      const paginationString = pageNum ? `&page=${pageNum}` : "";

      const results = await fetchWithError(
        `/api/issues?${labelsString}${statusString}${paginationString}`,
        {
          signal,
        }
      );

      results.forEach((issue) => {
        queryClient.setQueryData(["issues", issue.number.toString()], issue);
      });

      return results;
    },
    {
      keepPreviousData: true,
    }
  );

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchValue(e.target.search.value);
        }}
      >
        <label htmlFor="search">Search Issues</label>
        <input
          type="search"
          placeholder="Search..."
          name="search"
          id="search"
          onChange={(e) => {
            if (e.target.value.length === 0) {
              setSearchValue("");
            }
          }}
        />
      </form>
      <h2>Issues List {issuesQuery.isFetching ? <Loader /> : null}</h2>
      {issuesQuery.isLoading ? (
        <p>Loading...</p>
      ) : issuesQuery.isError ? (
        <p>{issuesQuery.error.message}</p>
      ) : searchQuery.fetchStatus === "idle" &&
        searchQuery.isLoading === true ? (
        <>
          <ul className="issues-list">
            {issuesQuery?.data?.map((issue) => (
              <IssueItem key={issue.id} {...issue} />
            ))}
          </ul>
          <div className="pagination">
            <button
              disabled={pageNum === 1 || issuesQuery.isPreviousData}
              onClick={() => setPageNum((prev) => prev - 1)}
            >
              Prev
            </button>
            <p>
              Page {pageNum}
              {issuesQuery.isFetching ? "..." : ""}
            </p>
            <button
              disabled={
                issuesQuery.data.length === 0 || issuesQuery.isPreviousData
              }
              onClick={() => setPageNum((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Search Results</h2>
          {searchQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>{searchQuery.data.count} Results</p>
              <ul className="issues-list">
                {searchQuery.data.items.map((issue) => (
                  <IssueItem key={issue.id} {...issue} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
