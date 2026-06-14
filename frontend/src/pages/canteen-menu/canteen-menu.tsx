import { menuItemColumns } from "@/components/columns/menu-item";
import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { DataTables } from "@/components/TableComponent/Table";
import { useDataTable } from "@/hooks";
import { Plus, UtensilsCrossed } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import CreateMenuItem from "./create";
import UpdateMenuItem from "./update";

export default function CanteenMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: rawData, isLoading, refetch } = useDataTable({
    path: "/api/canteen/menu",
    queryKey: "canteen-menu",
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenUpdate = useCallback((data: any) => {
    setDialogMode("update");
    setSelectedItem(data);
    setIsDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => menuItemColumns(refetch, handleOpenUpdate),
    [refetch, handleOpenUpdate]
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Canteen Menu"
        description="Manage menu items, prices, and availability"
        icon={<UtensilsCrossed className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Item
          </Button>
        }
      />
      {isLoading && !rawData ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={(rawData as any)?.menuItems || []}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta={(rawData as any)?.meta}
          tableHeading="Menu Items"
          sortingName="createdAt"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add Menu Item" : "Update Menu Item"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Create a new menu item for the canteen."
                : "Edit this menu item's details."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {dialogMode === "create" ? (
              <CreateMenuItem
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedItem && (
                <UpdateMenuItem
                  id={selectedItem._id}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    refetch();
                  }}
                  onCancel={() => setIsDialogOpen(false)}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
