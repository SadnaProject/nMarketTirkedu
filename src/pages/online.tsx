import { useGuestRedirect } from "utils/paths";
import Layout from "./_layout";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import { RemoveIcon } from "components/icons";
import { Modal } from "components/modal";
import Button from "components/button";

export default function Home() {
  useGuestRedirect();
  const { data: connectedUser } = api.auth.getAllLoggedInMembersIds.useQuery(
    undefined,
    { ...cachedQueryOptions, refetchInterval: 3000 }
  );
  const { data: unconnectedUser } = api.auth.getAllLoggedOutMembersIds.useQuery(
    undefined,
    { ...cachedQueryOptions, refetchInterval: 3000 }
  );
  const { mutate: removeMember } =
    api.users.removeMember.useMutation(cachedQueryOptions);

  return (
    <Layout>
      <h1>Connected Members</h1>
      {connectedUser?.map((id) => (
        <div key={id} className="flex gap-2">
          {id}
          <button data-hs-overlay={`#hs-modal-remove-${id}`}>
            <RemoveIcon />
          </button>
          <Modal
            id={`hs-modal-remove-${id}`}
            title="Confirm deletion"
            content={"Are you sure you want to remove this member?"}
            footer={
              <Button
                onClick={() => removeMember({ memberIdToRemove: id })}
                data-hs-overlay={`#hs-modal-remove-${id}`}
              >
                Apply changes
              </Button>
            }
          />
        </div>
      ))}
      <h1>Logged Out Members</h1>
      {unconnectedUser?.map((id) => (
        <div key={id} className="flex gap-2">
          {id}
          <button data-hs-overlay={`#hs-modal-remove-${id}`}>
            <RemoveIcon />
          </button>
          <Modal
            id={`hs-modal-remove-${id}`}
            title="Confirm deletion"
            content={"Are you sure you want to remove this member?"}
            footer={
              <Button
                onClick={() => removeMember({ memberIdToRemove: id })}
                data-hs-overlay={`#hs-modal-remove-${id}`}
              >
                Apply changes
              </Button>
            }
          />
        </div>
      ))}
    </Layout>
  );
}
