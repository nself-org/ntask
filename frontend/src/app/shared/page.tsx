'use client';

import { useLists } from '@/hooks/use-lists';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Eye, Edit, Crown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SharedListsPage() {
  const { lists, loading } = useLists();

  // Filter for lists shared with me (not owned by me)
  const sharedLists = lists.filter((list) => {
    // In a real implementation, you'd check if the current user is the owner
    // For now, we'll show all lists - update this when auth context has user ID
    return true;
  });

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'owner':
        return <Crown className="h-3 w-3" />;
      case 'editor':
        return <Edit className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'editor':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default:
        return '';
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Shared Lists</h1>
        <p className="text-muted-foreground mt-2">
          <Users className="inline h-4 w-4 mr-1" />
          Lists that have been shared with you
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : sharedLists.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No shared lists yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              When someone shares a list with you, it will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sharedLists.map((list) => (
            <Link key={list.id} href={`/lists/${list.id}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: list.color + '20' }}
                      >
                        {list.icon || '📋'}
                      </div>
                      <CardTitle className="text-lg truncate">{list.title}</CardTitle>
                    </div>

                    {/* Permission badge - in real app, get from list_shares */}
                    <Badge variant="secondary" className={`shrink-0 ${getPermissionColor('viewer')}`}>
                      {getPermissionIcon('viewer')}
                      <span className="ml-1">Viewer</span>
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {list.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{list.todo_count || 0} tasks</span>
                      {list.share_count && list.share_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {list.share_count}
                        </span>
                      )}
                    </div>
                    {list.location_name && (
                      <span className="text-xs truncate max-w-[120px]">
                        📍 {list.location_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated {format(new Date(list.updated_at), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
