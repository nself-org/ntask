'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBackend } from '@/lib/backend';
import { useAuth } from '@/lib/providers';
import type { AppRole, AppPermission } from '@/lib/types/backend';

interface RbacState {
  roles: AppRole[];
  permissions: string[];
  loading: boolean;
  highestLevel: number;
}

export function useRbac(): RbacState & {
  hasRole: (roleName: string) => boolean;
  hasPermission: (permissionName: string) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
  canAccess: (resource: string, action: string) => boolean;
  refetch: () => Promise<void>;
} {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRbac = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setPermissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const backend = getBackend();

      const rolesResult = await backend.db.query<{
        role_id: string;
        role: AppRole;
      }>('app_user_roles', {
        select: 'role_id, role:app_roles(*)',
        where: { user_id: user.id },
      });

      const userRoles: AppRole[] = [];
      if (rolesResult.data) {
        for (const ur of rolesResult.data) {
          if (ur.role) userRoles.push(ur.role);
        }
      }
      setRoles(userRoles);

      const roleIds = userRoles.map(r => r.id);
      const permNames: Set<string> = new Set();

      if (roleIds.length > 0) {
        const rpResult = await backend.db.query<{
          permission: AppPermission;
        }>('app_role_permissions', {
          select: 'permission:app_permissions(*)',
        });

        if (rpResult.data) {
          for (const rp of rpResult.data) {
            if (rp.permission) permNames.add(rp.permission.name);
          }
        }
      }

      const overrides = await backend.db.query<{
        granted: boolean;
        permission: AppPermission;
      }>('app_user_permissions', {
        select: 'granted, permission:app_permissions(*)',
        where: { user_id: user.id },
      });

      if (overrides.data) {
        for (const o of overrides.data) {
          if (!o.permission) continue;
          if (o.granted) {
            permNames.add(o.permission.name);
          } else {
            permNames.delete(o.permission.name);
          }
        }
      }

      setPermissions(Array.from(permNames));
    } catch {
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchRbac();
  }, [fetchRbac]);

  const highestLevel = useMemo(
    () => roles.reduce((max, r) => Math.max(max, r.level), 0),
    [roles]
  );

  const hasRole = useCallback(
    (roleName: string) => roles.some(r => r.name === roleName),
    [roles]
  );

  const hasPermission = useCallback(
    (permissionName: string) => permissions.includes(permissionName),
    [permissions]
  );

  const isOwner = useMemo(() => hasRole('owner'), [hasRole]);
  const isAdmin = useMemo(() => highestLevel >= 90, [highestLevel]);

  const canAccess = useCallback(
    (resource: string, action: string) => {
      if (isOwner) return true;
      return hasPermission(`${resource}.${action}`) || hasPermission(`${resource}.manage`);
    },
    [isOwner, hasPermission]
  );

  return {
    roles,
    permissions,
    loading,
    highestLevel,
    hasRole,
    hasPermission,
    isOwner,
    isAdmin,
    canAccess,
    refetch: fetchRbac,
  };
}
