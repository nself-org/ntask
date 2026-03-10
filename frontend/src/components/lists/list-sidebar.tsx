'use client';

import { useState, useMemo } from 'react';
import { Plus, FolderOpen, MoreHorizontal, X } from 'lucide-react';
import { useLists } from '@/hooks/use-lists';
import { useGroups } from '@/hooks/use-groups';
import { ListItem } from './list-item';
import { CreateListDialog } from './create-list-dialog';
import { ManageGroupsDialog } from './manage-groups-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ListSidebarProps {
  activeListId?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ListSidebar({ activeListId, mobileOpen, onMobileClose }: ListSidebarProps) {
  const { lists, loading: listsLoading } = useLists();
  const { groups, loading: groupsLoading } = useGroups();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGroupsDialog, setShowGroupsDialog] = useState(false);

  const loading = listsLoading || groupsLoading;

  // Group lists by group_id
  const grouped = useMemo(() => {
    const ungrouped = lists.filter((l) => !l.group_id);
    const byGroup: Record<string, typeof lists> = {};
    for (const list of lists) {
      if (list.group_id) {
        byGroup[list.group_id] = byGroup[list.group_id] ?? [];
        byGroup[list.group_id].push(list);
      }
    }
    return { ungrouped, byGroup };
  }, [lists]);

  const sidebarBody = (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Lists</h2>
        <div className="flex items-center gap-1">
          {onMobileClose && (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={onMobileClose}
              className="md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setShowCreateDialog(true)}
            title="New list"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" type="button" title="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowGroupsDialog(true)}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Manage groups
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </>
          ) : lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <p className="text-sm text-muted-foreground">No lists yet</p>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create your first list
              </Button>
            </div>
          ) : (
            <>
              {/* Grouped lists */}
              {groups.map((group) => {
                const groupLists = grouped.byGroup[group.id] ?? [];
                if (groupLists.length === 0) return null;
                return (
                  <div key={group.id}>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.title}
                    </div>
                    {groupLists.map((list) => (
                      <ListItem
                        key={list.id}
                        list={list}
                        isActive={list.id === activeListId}
                        onClick={onMobileClose}
                      />
                    ))}
                  </div>
                );
              })}

              {/* Ungrouped lists */}
              {grouped.ungrouped.length > 0 && (
                <div>
                  {groups.length > 0 && (
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                      Other
                    </div>
                  )}
                  {grouped.ungrouped.map((list) => (
                    <ListItem
                      key={list.id}
                      list={list}
                      isActive={list.id === activeListId}
                      onClick={onMobileClose}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden h-full w-64 flex-col border-r bg-background md:flex">
        {sidebarBody}
      </div>

      {/* Mobile sidebar — slide-over overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Panel */}
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r bg-background shadow-xl">
            {sidebarBody}
          </div>
        </div>
      )}

      <CreateListDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      <ManageGroupsDialog
        open={showGroupsDialog}
        onOpenChange={setShowGroupsDialog}
      />
    </>
  );
}
