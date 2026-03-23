import { Search } from 'lucide-react';
import { Input } from '@components/ui/input';
import { Container } from '@components/ui/layout';

export function AdminHeaderSearch() {
  return (
    <Container className="min-w-0 flex-1 max-md:w-full md:max-w-xl">
      <Input
        type="text"
        placeholder="Search..."
        icon={<Search size={20} />}
        iconPosition="left"
        className="h-10 w-full"
      />
    </Container>
  );
}
