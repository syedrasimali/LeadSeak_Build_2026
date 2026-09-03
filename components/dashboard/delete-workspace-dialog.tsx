"use client";

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

function DeleteWorkspaceDialog() {
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
            hint="Northwind Studio"
          >
            <Input id="confirm-name" placeholder="Northwind Studio" />
          </Field>
        </DialogBody>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="danger"
            onClick={() =>
              toast.error("Nothing was deleted", {
                description:
                  "This is a visual-only confirmation flow in Phase 1.",
              })
            }
          >
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteWorkspaceDialog };
