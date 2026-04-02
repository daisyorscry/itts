import { useMemo } from 'react';
import { useAdminCourse } from '@feature/learning/hooks';
import { useCourseBuilderContext } from './course-builder.context';
import { sortLessons, sortSections } from './course-builder.shared';

export function useCourseBuilderCourse() {
  const { courseId } = useCourseBuilderContext();
  const query = useAdminCourse(courseId, Boolean(courseId));
  const sections = useMemo(() => sortSections(query.data?.sections ?? []), [query.data?.sections]);

  return {
    ...query,
    course: query.data,
    sections,
  };
}

export function useSelectedSection() {
  const { selectedSectionId } = useCourseBuilderContext();
  const { course, sections, ...rest } = useCourseBuilderCourse();

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null,
    [sections, selectedSectionId],
  );

  return {
    ...rest,
    course,
    sections,
    selectedSection,
  };
}

export function useSelectedLesson() {
  const { selectedLessonId } = useCourseBuilderContext();
  const { course, sections, selectedSection, ...rest } = useSelectedSection();

  const selectedSectionLessons = useMemo(() => sortLessons(selectedSection?.lessons ?? []), [selectedSection?.lessons]);
  const selectedLesson = useMemo(
    () => selectedSectionLessons.find((lesson) => lesson.id === selectedLessonId) ?? selectedSectionLessons[0] ?? null,
    [selectedLessonId, selectedSectionLessons],
  );

  const allLessons = useMemo(
    () =>
      sections.flatMap((section) =>
        sortLessons(section.lessons ?? []).map((lesson) => ({
          ...lesson,
          section_title: section.title,
        })),
      ),
    [sections],
  );

  const prerequisiteOptions = useMemo(
    () => allLessons.filter((lesson) => lesson.id !== selectedLesson?.id),
    [allLessons, selectedLesson?.id],
  );

  return {
    ...rest,
    course,
    sections,
    selectedSection,
    selectedSectionLessons,
    selectedLesson,
    prerequisiteOptions,
  };
}
