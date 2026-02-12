'use client';

import { useState, useEffect } from 'react';
import { getFauxAccounts, type FauxAccount } from '@/lib/faux-signin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Shield, Crown, Headphones, User } from 'lucide-react';

interface FauxSigninProps {
  onSignIn: (email: string, password: string) => Promise<void>;
}

const ROLE_CONFIG: Record<string, { Icon: typeof Shield; color: string }> = {
  owner: { Icon: Crown, color: 'text-amber-600 dark:text-amber-400' },
  admin: { Icon: Shield, color: 'text-sky-600 dark:text-sky-400' },
  support: { Icon: Headphones, color: 'text-teal-600 dark:text-teal-400' },
  user: { Icon: User, color: 'text-emerald-600 dark:text-emerald-400' },
};

export function FauxSignin({ onSignIn }: FauxSigninProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<FauxAccount[]>([]);

  useEffect(() => {
    setMounted(true);
    setAccounts(getFauxAccounts());
  }, []);

  if (!mounted || accounts.length === 0) {
    return null;
  }

  const handleQuickSignIn = async (account: FauxAccount) => {
    setLoading(account.email);
    try {
      await onSignIn(account.email, account.password);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100">
            Quick Sign In (Dev Only)
          </CardTitle>
        </div>
        <CardDescription className="text-emerald-700 dark:text-emerald-300">
          Click to instantly sign in with a test account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {accounts.map((account) => {
          const config = ROLE_CONFIG[account.role] || ROLE_CONFIG.user;
          const RoleIcon = config.Icon;

          return (
            <Button
              key={account.email}
              variant="outline"
              className="w-full justify-start h-auto py-3 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              onClick={() => handleQuickSignIn(account)}
              disabled={loading !== null}
            >
              {loading === account.email ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RoleIcon className={`h-4 w-4 mr-2 ${config.color}`} />
              )}
              <div className="flex flex-col items-start flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-emerald-900 dark:text-emerald-100">
                    {account.displayName}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {account.role}
                  </Badge>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {account.email}
                </span>
              </div>
            </Button>
          );
        })}
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
          These test accounts are only available in development mode
        </p>
      </CardContent>
    </Card>
  );
}
