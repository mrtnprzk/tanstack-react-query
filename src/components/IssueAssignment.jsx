import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { GoGear } from "react-icons/go";
import { useUserData } from "../hooks/useUserData";

const IssueAssignment = ({ assignee, issueNumber }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useUserData(assignee);
  const usersQuery = useQuery(["users"], () =>
    fetch("/api/users").then((res) => res.json())
  );

  const queryClient = useQueryClient();

  const setAssignment = useMutation(
    (assignee) => {
      return fetch(`/api/issues/${issueNumber}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ assignee }),
      }).then((res) => res.json());
    },
    {
      onMutate: (assignee) => {
        const oldAssignee = queryClient.getQueryData([
          "issues",
          issueNumber,
        ]).assignee;
        queryClient.setQueryData(["issues", issueNumber], (data) => ({
          ...data,
          assignee,
        }));

        return function rollback() {
          queryClient.setQueryData(["issues", issueNumber], (data) => ({
            ...data,
            assignee: oldAssignee,
          }));
        };
      },
      onError: (error, variables, rollback) => {
        rollback();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["issues", issueNumber], { exact: true });
      },
    }
  );

  return (
    <div className="issue-options">
      <div>
        <span>Assignment</span>
        {user?.isSuccess && (
          <div>
            <img src={user?.data?.profilePictureUrl} />
            {user?.data?.name}
          </div>
        )}
      </div>
      <GoGear onClick={() => !usersQuery.isLoading && setMenuOpen(prev => !prev)} />
      {menuOpen && (
        <div className="picker-menu">
          {usersQuery?.data?.map((user) => (
            <div key={user.id} onClick={() => setAssignment.mutate(user.id)}>
              <img src={user.profilePictureUrl} />
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueAssignment;
