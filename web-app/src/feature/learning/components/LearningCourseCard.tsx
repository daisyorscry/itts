import * as Icons from 'lucide-react';
import { Link } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { resolveAssetUrl } from '@utility/asset';
import type { LearningCourse } from '../types';

interface LearningCourseCardProps {
  course: LearningCourse;
  href: string;
  actionLabel?: string;
}

export function LearningCourseCard({
  course,
  href,
  actionLabel = 'Open course',
}: LearningCourseCardProps) {
  const thumbnail = resolveAssetUrl(course.thumbnail_url);
  const lessonCount = course.sections.reduce((total, section) => total + section.lessons.length, 0);

  return (
    <CardUI.Card tone="paper" className="overflow-hidden">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={course.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <LayoutUI.Row
          className="h-48 w-full bg-[radial-gradient(circle_at_top_left,_rgba(41,230,140,0.35),_transparent_45%),linear-gradient(135deg,_#111111,_#202020)] px-6 text-white"
          justify="justify-between"
          align="items-end"
        >
          <LayoutUI.Column gap="gap-2" className="pb-6">
            <Badge variant="success">{course.level}</Badge>
            <Text className="font-['Sora'] text-2xl font-semibold text-white">{course.title}</Text>
          </LayoutUI.Column>
          <Icons.GraduationCap className="mb-6 size-12 text-[#29E68C]" />
        </LayoutUI.Row>
      )}

      <CardUI.CardContent padding="auth" spacing="lg">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-3">
          <LayoutUI.Column gap="gap-2" className="min-w-0">
            <Text as="h3" variant="inverse" className="font-['Sora'] text-xl font-semibold">
              {course.title}
            </Text>
            {course.subtitle ? <Text variant="muted-inverse">{course.subtitle}</Text> : null}
          </LayoutUI.Column>
          <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>{course.status}</Badge>
        </LayoutUI.Row>

        <Text variant="muted-inverse" className="line-clamp-3">
          {course.description || 'No course description yet.'}
        </Text>

        <LayoutUI.Row className="flex-wrap" gap="gap-2">
          {course.program ? <Badge variant="outline">{course.program}</Badge> : null}
          <Badge variant="outline">{lessonCount} lessons</Badge>
          <Badge variant="outline">{course.estimated_minutes} mins</Badge>
          {course.is_featured ? <Badge variant="success">Featured</Badge> : null}
        </LayoutUI.Row>

        <Button asChild variant="accent" size="form">
          <Link to={href}>
            <Icons.ArrowRight size={18} />
            {actionLabel}
          </Link>
        </Button>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
