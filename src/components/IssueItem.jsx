import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { GoIssueOpened, GoIssueClosed, GoComment } from "react-icons/go";

import { relativeDate } from "../helpers/relativeDate";
import { useUserData } from "../hooks/useUserData";
import fetchWithError from "../helpers/fetchWithError";
import Label from "./Label";

const IssueItem = ({
  title,
  number,
  assignee,
  comments,
  createdBy,
  createdDate,
  labels,
  status,
}) => {
  const queryClient = useQueryClient();
  const assigneeUser = useUserData(assignee);
  const createdByUser = useUserData(createdBy);

  return (
    <li
      onMouseEnter={() => {
        queryClient.prefetchQuery(["issues", number.toString()], () =>
          fetchWithError(`/api/issues/${number}`)
        );
        queryClient.prefetchInfiniteQuery(
          ["issues", number.toString(), "comments"],
          () => fetchWithError(`/api/issues/${number}/comments?page=1`)
        );
      }}
    >
      <div>
        {status === "done" || status === "cancelled" ? (
          <GoIssueOpened style={{ color: "red" }} />
        ) : (
          <GoIssueClosed style={{ color: "green" }} />
        )}
      </div>
      <div className="issue-content">
        <span>
          {" "}
          <Link to={`/issue/${number}`}>{title}</Link>
          {labels.map((label) => (
            <Label key={label} label={label} />
          ))}
        </span>
        <small>
          #{number} opened {relativeDate(createdDate)}{" "}
          {createdByUser?.isSuccess ? `by ${createdByUser?.data?.name}` : ""}
          {createdByUser?.data?.name ?? "N/A"}
        </small>
      </div>
      {assignee ? (
        <img
          className="assigned-to"
          src={
            assigneeUser?.isSuccess
              ? `${assigneeUser?.data?.profilePictureUrl}`
              : ""
          }
          alt={assigneeUser?.isSuccess ? assigneeUser?.data?.name : "avatar"}
        />
      ) : null}
      <span className="comment-count">
        {comments.length > 0 ? (
          <>
            <GoComment />
            {comments.length}
          </>
        ) : null}
      </span>
    </li>
  );
};

export default IssueItem;
