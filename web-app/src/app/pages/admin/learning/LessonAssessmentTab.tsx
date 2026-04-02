import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import { QueryStatePanel } from '@components/query-state-panel';
import { AssignmentBuilderPanel } from './AssignmentBuilderPanel';
import { QuizBuilderPanel } from './QuizBuilderPanel';
import { useSelectedLesson } from './course-builder.hooks';

export function LessonAssessmentTab() {
  const { selectedLesson } = useSelectedLesson();
  const canManageQuiz = selectedLesson?.lesson_type === 'quiz' || Boolean(selectedLesson?.quiz_id);
  const canManageAssignment = selectedLesson?.lesson_type === 'assignment' || Boolean(selectedLesson?.assignment_id);

  if (!canManageQuiz && !canManageAssignment) {
    return (
      <CardUI.Card tone="inverse" border={false}>
        <CardUI.CardContent padding="auth">
          <QueryStatePanel
            icon={Icons.BookOpenCheck}
            title="No assessment needed here"
            description="Switch the lesson type to quiz or assignment if this lesson should evaluate the learner."
          />
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  return (
    <>
      <QuizBuilderPanel />
      <AssignmentBuilderPanel />
    </>
  );
}
