import * as Icons from 'lucide-react';
import * as DialogUI from '@components/ui/dialog';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import type { Permission } from '@feature/permission/types';
import { formatDate } from '@utility/date';

interface ViewPermissionModalProps {
  permission: Permission;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewPermissionModal({
  permission,
  isOpen,
  onClose,
}: ViewPermissionModalProps) {
  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={onClose}>
      <DialogUI.DialogContent
        className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]"
        style={{ maxHeight: '90vh' }}
      >
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row justify="between" align="start" gap="gap-4" className="max-sm:flex-col">
              <LayoutUI.Row align="center" gap="gap-3" className="min-w-0">
                <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                  <Icons.Shield className="size-5 text-[#04090C]" />
                </LayoutUI.Container>
                <LayoutUI.Column gap="gap-1" className="min-w-0">
                  <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                    Permission Details
                  </DialogUI.DialogTitle>
                  <DialogUI.DialogDescription className="break-words text-sm text-black/60">
                    Inspect how this permission is composed.
                  </DialogUI.DialogDescription>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <CardUI.Card tone="inverse">
              <CardUI.CardContent className="py-4">
                <LayoutUI.Column gap="gap-2">
                  <Text variant="muted-inverse" size="sm">
                    Permission Name
                  </Text>
                  <Text variant="inverse" className="break-words font-mono text-base font-semibold text-[#29E68C]">
                    {permission.name}
                  </Text>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>

            <CardUI.Card tone="inverse">
              <CardUI.CardContent className="py-4">
                <LayoutUI.Column gap="gap-2">
                  <Text variant="muted-inverse" size="sm">
                    Description
                  </Text>
                  <Text variant="inverse">
                    {permission.description}
                  </Text>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>

            <LayoutUI.Row gap="gap-4" className="grid grid-cols-1 md:grid-cols-2">
              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-3">
                    <Text variant="muted-inverse" size="sm">
                      Resource
                    </Text>
                    <Badge variant="secondary">
                      {permission.resource.name}
                    </Badge>
                    <Text variant="muted-inverse">
                      {permission.resource.description}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>

              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-3">
                    <Text variant="muted-inverse" size="sm">
                      Action
                    </Text>
                    <Badge variant="secondary">
                      {permission.action.name}
                    </Badge>
                    <Text variant="muted-inverse">
                      {permission.action.description}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>
            </LayoutUI.Row>

            <LayoutUI.Row gap="gap-4" className="grid grid-cols-1 md:grid-cols-2">
              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" size="sm">
                      Permission ID
                    </Text>
                    <Text variant="inverse" size="xs" className="font-mono">
                      {permission.id}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>

              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" size="sm">
                      Created At
                    </Text>
                    <Text variant="inverse" className="font-medium">
                      {formatDate(permission.created_at, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>
            </LayoutUI.Row>

            <LayoutUI.Row justify="end" gap="gap-4" className="border-t border-black/10 pt-6 max-sm:flex-col">
              <Button onClick={onClose} variant="accent" size="form">
                Close
              </Button>
            </LayoutUI.Row>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
