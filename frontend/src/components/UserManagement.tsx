import React, { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useUserRegistry, useAssignRoleWithAutoId, useRevokeRole } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { UserRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, Loader2, UserPlus, Trash2, Users } from 'lucide-react';

function RoleBadge({ role }: { role: UserRole }) {
  const roleStyles: Record<UserRole, string> = {
    [UserRole.admin]: 'bg-blue-900 text-blue-100 border-blue-700',
    [UserRole.user]: 'bg-teal-700 text-teal-100 border-teal-500',
    [UserRole.guest]: 'bg-gray-600 text-gray-100 border-gray-500',
  };

  const roleLabels: Record<UserRole, string> = {
    [UserRole.admin]: 'Admin',
    [UserRole.user]: 'User',
    [UserRole.guest]: 'Guest',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${roleStyles[role] ?? 'bg-gray-600 text-gray-100 border-gray-500'}`}>
      {roleLabels[role] ?? role}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      title={copied ? t.dashboard.copied : t.dashboard.copyPrincipal}
    >
      {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
      <span>{copied ? t.dashboard.copied : t.dashboard.copyPrincipal}</span>
    </button>
  );
}

export default function UserManagement() {
  const { t } = useTranslation();
  const { data: registry = [], isLoading: registryLoading } = useUserRegistry();
  const assignRole = useAssignRoleWithAutoId();
  const revokeRole = useRevokeRole();

  const [principalInput, setPrincipalInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!principalInput.trim() || !selectedRole) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    let principal: Principal;
    try {
      principal = Principal.fromText(principalInput.trim());
    } catch {
      setErrorMessage('Invalid Principal ID format. Please check and try again.');
      return;
    }

    try {
      const autoId = await assignRole.mutateAsync({ principal, role: selectedRole as UserRole });
      setSuccessMessage(`${t.dashboard.assignSuccess}${autoId}`);
      setPrincipalInput('');
      setSelectedRole('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign role.';
      setErrorMessage(msg);
    }
  };

  const handleRevoke = async (principalStr: string) => {
    setRevokingId(principalStr);
    try {
      const principal = Principal.fromText(principalStr);
      await revokeRole.mutateAsync(principal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to revoke role.';
      setErrorMessage(msg);
    } finally {
      setRevokingId(null);
    }
  };

  const truncatePrincipal = (p: string) =>
    p.length > 20 ? `${p.slice(0, 10)}...${p.slice(-5)}` : p;

  return (
    <div className="space-y-6">
      {/* Assign Role Form */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-4 py-2.5 flex items-center gap-2">
          <UserPlus size={14} className="text-news-blue-light" />
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
            {t.dashboard.assignRole}
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {successMessage && (
            <Alert className="border-green-500/30 bg-green-500/10">
              <AlertDescription className="text-green-700 dark:text-green-400 text-sm font-semibold">
                ✓ {successMessage}
              </AlertDescription>
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t.dashboard.principalLabel}
              </Label>
              <Input
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                placeholder={t.dashboard.principalPlaceholder}
                className="text-xs font-mono h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t.dashboard.roleLabel}
              </Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t.dashboard.rolePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.admin} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-700 inline-block" />
                      {t.dashboard.roleAdmin}
                    </span>
                  </SelectItem>
                  <SelectItem value={UserRole.user} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
                      {t.dashboard.roleUser}
                    </span>
                  </SelectItem>
                  <SelectItem value={UserRole.guest} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
                      {t.dashboard.roleGuest}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAssign}
            disabled={!principalInput.trim() || !selectedRole || assignRole.isPending}
            className="bg-news-blue hover:bg-news-blue-dark text-white text-xs font-bold h-9"
          >
            {assignRole.isPending ? (
              <>
                <Loader2 size={12} className="animate-spin mr-1.5" />
                {t.dashboard.assigning}
              </>
            ) : (
              <>
                <UserPlus size={12} className="mr-1.5" />
                {t.dashboard.assignBtn}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* User Registry Table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-news-blue-light" />
            <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
              {t.dashboard.roleRegistry}
            </h3>
          </div>
          <span className="text-white/60 text-xs">{registry.length} users</span>
        </div>

        {registryLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : registry.length === 0 ? (
          <div className="py-10 text-center">
            <Users size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.dashboard.emptyRegistry}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">
                    {t.dashboard.autoGeneratedId}
                  </th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">
                    {t.dashboard.principalId}
                  </th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {registry.map((entry) => {
                  const principalStr = entry.principal.toText();
                  const isRevoking = revokingId === principalStr;
                  return (
                    <tr key={principalStr} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2">
                        <span className="font-mono font-bold text-news-blue">{entry.autoId}</span>
                      </td>
                      <td className="px-3 py-2">
                        <RoleBadge role={entry.role} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground" title={principalStr}>
                            {truncatePrincipal(principalStr)}
                          </span>
                          <CopyButton text={principalStr} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] border-red-400/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-2"
                          onClick={() => handleRevoke(principalStr)}
                          disabled={isRevoking}
                        >
                          {isRevoking ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <>
                              <Trash2 size={10} className="mr-1" />
                              {t.dashboard.revokeRole}
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
