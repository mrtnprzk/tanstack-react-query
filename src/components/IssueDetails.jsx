import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useScrollToBottomAction from "../hooks/useScrollToBottomAction";
import Comment from "./Comment";
import IssueAssignment from "./IssueAssignment";
import IssueHeader from "./IssueHeader";
import IssueLabels from "./IssueLabels";
import IssueStatus from "./IssueStatus";
import Loader from "./Loader";

function useIssueData(issueNumber) {
  return useQuery(["issues", issueNumber.toString()], async ({ signal }) => {
    return fetch(`/api/issues/${issueNumber}`, { signal }).then((res) =>
      res.json()
    );
  });
}

function useIssueComments(issueNumber) {
  const commentsQuery = useInfiniteQuery(
    ["issues", issueNumber.toString(), "comments"],
    async ({ signal, pageParam = 1 }) => {
      return fetch(`/api/issues/${issueNumber}/comments?page=${pageParam}`, {
        signal,
      }).then((res) => res.json());
    },
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) return;
        return pages.length + 1;
      },
    }
  );
  console.log(commentsQuery);
  return commentsQuery;
}

export default function IssueDetails() {
  const { number } = useParams();
  const issueQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);

  useScrollToBottomAction(document, commentsQuery.fetchNextPage, 100);

  return (
    <div className="issue-details">
      {issueQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <IssueHeader {...issueQuery.data} />

          <main>
            <section>
              {commentsQuery.isLoading ? (
                <p>Loading...</p>
              ) : (
                commentsQuery.data?.pages?.map((commentPage) =>
                  commentPage?.map((comment) => (
                    <Comment key={comment.id} {...comment} />
                  ))
                )
              )}
              {commentsQuery.isFetching && <Loader />}
            </section>
            <aside>
              <IssueStatus
                status={issueQuery?.data?.status}
                issueNumber={issueQuery?.data?.number?.toString()}
              />
              <IssueAssignment
                assignee={issueQuery?.data?.assignee}
                issueNumber={issueQuery?.data?.number?.toString()}
              />
              <IssueLabels
                labels={issueQuery?.data?.labels}
                issueNumber={issueQuery?.data?.number?.toString()}
              />
            </aside>
          </main>
        </>
      )}
    </div>
  );
}
