import * as Icons from 'lucide-react';
import * as DialogUI from '@components/ui/dialog';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { useRolePermissions } from '@feature/role/hooks';
import type { Role } from '@feature/role/types';
import { formatDate } from '@utility/date';

interface ViewRoleModalProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function ViewRoleModal({ role, isOpen, onClose, onEdit }: ViewRoleModalProps) {
  const { data: permissions, isLoading } = useRolePermissions(role.id, isOpen);

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={onClose}>
      <DialogUI.DialogContent
        className="overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]"
        style={{ maxHeight: '90vh', maxWidth: '48rem' }}
      >
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row justify="between" align="start" gap="gap-6" className="max-sm:flex-col">
              <LayoutUI.Row align="center" gap="gap-4" className="min-w-0">
                <LayoutUI.Container
                  surface={role.is_system ? 'accent' : 'panel'}
                  radius="xl"
                  className="flex h-14 w-14 items-center justify-center"
                >
                  {role.is_system ? (
                    <Icons.Lock className="size-7 text-[#04090C]" />
                  ) : (
                    <Icons.Shield className="size-7 text-black/70" />
                  )}
                </LayoutUI.Container>

                <LayoutUI.Column gap="gap-2" className="min-w-0">
                  <LayoutUI.Column gap="gap-1">
                    <DialogUI.DialogTitle className="break-words font-['Sora'] text-xl font-bold text-[#04090C] sm:text-2xl">
                      {role.name}
                    </DialogUI.DialogTitle>
                    <DialogUI.DialogDescription className="break-words text-sm text-black/60">
                      {role.description}
                    </DialogUI.DialogDescription>
                  </LayoutUI.Column>

                  <LayoutUI.Row align="center" gap="gap-2" className="flex-wrap">
                    {role.is_system ? <Badge variant="success">System Role</Badge> : null}
                  </LayoutUI.Row>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <LayoutUI.Row gap="gap-4" className="grid grid-cols-1 md:grid-cols-2">
              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-2">
                    <LayoutUI.Row align="center" gap="gap-2">
                      <Icons.Calendar className="size-4 text-black/60" />
                      <Text variant="muted-inverse">Created</Text>
                    </LayoutUI.Row>
                    <Text variant="inverse" className="font-medium">
                      {formatDate(role.created_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>

              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-2">
                    <LayoutUI.Row align="center" gap="gap-2">
                      <Icons.Calendar className="size-4 text-black/60" />
                      <Text variant="muted-inverse">Last Updated</Text>
                    </LayoutUI.Row>
                    <Text variant="inverse" className="font-medium">
                      {formatDate(role.updated_at, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>
            </LayoutUI.Row>

            <CardUI.Card tone="inverse">
              <CardUI.CardContent className="py-4">
                <LayoutUI.Column gap="gap-1">
                  <Text variant="muted-inverse" size="sm">
                    Role ID
                  </Text>
                  <Text variant="inverse" size="xs" className="font-mono">
                    {role.id}
                  </Text>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>

            <CardUI.Card tone="inverse">
              <CardUI.CardHeader className="border-b border-black/10 pb-5">
                <LayoutUI.Row align="center" gap="gap-2">
                  <Icons.KeyRound className="size-5 text-[#29E68C]" />
                  <Text as="h3" variant="inverse" size="lg" className="font-semibold">
                    Permissions ({permissions?.length || 0})
                  </Text>
                </LayoutUI.Row>
              </CardUI.CardHeader>

              <CardUI.CardContent className="py-4">
                {isLoading ? (
                  <LayoutUI.Column gap="gap-3" className="py-4 text-center">
                    <div className="mx-auto inline-block size-6 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
                    <Text variant="muted-inverse">Loading permissions...</Text>
                  </LayoutUI.Column>
                ) : !permissions || permissions.length === 0 ? (
                  <LayoutUI.Column gap="gap-3" className="py-4 text-center">
                    <Icons.Shield className="size-10 text-black/20" />
                    <Text variant="muted-inverse">No permissions assigned</Text>
                  </LayoutUI.Column>
                ) : (
                  <LayoutUI.Column gap="gap-3">
                    {permissions.map((permission) => (
                      <CardUI.Card key={permission.id} tone="inverse">
                        <CardUI.CardContent className="py-4">
                          <LayoutUI.Row justify="between" align="start" gap="gap-4" className="max-sm:flex-col">
                            <LayoutUI.Column gap="gap-1" className="min-w-0">
                              <Text as="h4" variant="inverse" className="font-medium">
                                {permission.name}
                              </Text>
                              <Text variant="muted-inverse" className="break-words">{permission.description}</Text>
                            </LayoutUI.Column>

                            <LayoutUI.Row gap="gap-2" className="flex-wrap justify-end max-sm:justify-start">
                              <Badge variant="success">{permission.resource.name}</Badge>
                              <Badge className="border border-black/10 bg-black/5 text-black/70">
                                {permission.action.name}
                              </Badge>
                            </LayoutUI.Row>
                          </LayoutUI.Row>
                        </CardUI.CardContent>
                      </CardUI.Card>
                    ))}
                  </LayoutUI.Column>
                )}
              </CardUI.CardContent>
            </CardUI.Card>

            <LayoutUI.Row justify="end" gap="gap-4" className="border-t border-black/10 pt-6 max-sm:flex-col">
              <Button onClick={onClose} variant="ghost-inverse" size="form">
                Close
              </Button>
              {!role.is_system ? (
                <Button onClick={onEdit} variant="accent" size="form">
                  <Icons.Edit />
                  Edit Role
                </Button>
              ) : null}
            </LayoutUI.Row>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
