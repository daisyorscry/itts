import { createContext, useContext } from 'react';
import type { WorkspaceTab } from './course-builder.shared';

interface CourseBuilderContextValue {
  courseId: string;
  selectedLessonId: string;
  selectedSectionId: string;
  setSelectedLessonId: (id: string) => void;
  setSelectedSectionId: (id: string) => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  workspaceTab: WorkspaceTab;
}

export const CourseBuilderContext = createContext<CourseBuilderContextValue | null>(null);

export function useCourseBuilderContext() {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilderContext must be used within CourseBuilderContext.Provider');
  }
  return context;
}
