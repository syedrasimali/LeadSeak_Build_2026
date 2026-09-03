"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { deleteAccountAction } from "@/app/actions/profile";

function DeleteWorkspaceDialog({ workspaceName }: { workspaceName: string }) {
  const router = useRouter();
  const [typed, setTyped] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const matches = typed.trim() === workspaceName;

  async function handleDelete() {
    if (!matches || deleting) return;
    setDeleting(true);
    const { error, redirect } = await deleteAccountAction();
    setDeleting(false);

    if (error) {
      toast.error("Deletion failed", { description: error });
      return;
    }

    if (redirect) {
      toast.success("Workspace deleted", {
        description: "Your account and all data have been permanently removed.",
      });
      router.push("/");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">
          <Trash2 />
          Delete workspace
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this workspace?</DialogTitle>
          <DialogDescription>
            This removes every campaign, prospect, and pipeline record. There is
            no recovery path.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <Field
            label="Type the workspace name to confirm"
            htmlFor="confirm-name"
            hint={workspaceName}
          >
            <Input
              id="confirm-name"
              placeholder={workspaceName}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={deleting}
            />
          </Field>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={deleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="danger"
            disabled={!matches || deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteWorkspaceDialog };
