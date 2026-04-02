import { useEffect, useState } from 'react';
import { z } from 'zod';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateQuiz, useDeleteQuiz, useQuiz, useUpdateQuiz } from '@feature/learning/hooks';
import { quizFormSchema, type CreateQuizRequest, type QuizFormData, type UpdateQuizRequest } from '@feature/learning/types';
import { useSelectedLesson } from './course-builder.hooks';
import { buildDefaultQuizDraft, questionTypeOptions } from './course-builder.shared';

function getFirstErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form fields.';
}

export function QuizBuilderPanel() {
  const { selectedLesson } = useSelectedLesson();
  const { mutate: createQuiz, isPending: isCreatingQuiz } = useCreateQuiz();
  const { mutate: updateQuiz, isPending: isUpdatingQuiz } = useUpdateQuiz();
  const { mutate: deleteQuiz, isPending: isDeletingQuiz } = useDeleteQuiz();
  const { data: quiz } = useQuiz(selectedLesson?.quiz_id ?? '', Boolean(selectedLesson?.quiz_id));
  const [quizDraft, setQuizDraft] = useState<QuizFormData>(buildDefaultQuizDraft());

  useEffect(() => {
    if (!quiz) {
      setQuizDraft(buildDefaultQuizDraft());
      return;
    }

    setQuizDraft({
      title: quiz.title,
      description: quiz.description ?? '',
      pass_score: quiz.pass_score,
      time_limit_minutes: quiz.time_limit_minutes ?? undefined,
      max_attempts: quiz.max_attempts ?? undefined,
      is_active: quiz.is_active,
      questions: quiz.questions.map((question, questionIndex) => ({
        question_text: question.question_text,
        question_type: question.question_type,
        explanation: question.explanation ?? '',
        points: question.points,
        sort_order: question.sort_order ?? questionIndex,
        options: question.options.map((option, optionIndex) => ({
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order ?? optionIndex,
        })),
      })),
    });
  }, [quiz]);

  const handleSaveQuiz = () => {
    if (!selectedLesson) {
      return;
    }

    const parsed = quizFormSchema.safeParse(quizDraft);
    if (!parsed.success) {
      toast.error(getFirstErrorMessage(parsed.error));
      return;
    }

    const payload: CreateQuizRequest | UpdateQuizRequest = {
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      pass_score: parsed.data.pass_score,
      time_limit_minutes: parsed.data.time_limit_minutes || undefined,
      max_attempts: parsed.data.max_attempts || undefined,
      is_active: parsed.data.is_active,
      questions: parsed.data.questions.map((question) => ({
        question_text: question.question_text,
        question_type: question.question_type,
        explanation: question.explanation || undefined,
        points: question.points,
        sort_order: question.sort_order,
        options: question.options.map((option) => ({
          option_text: option.option_text,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        })),
      })),
    };

    if (selectedLesson.quiz_id) {
      updateQuiz({ id: selectedLesson.quiz_id, payload: payload as UpdateQuizRequest });
      return;
    }

    createQuiz({ lessonId: selectedLesson.id, payload: payload as CreateQuizRequest });
  };

  if (!selectedLesson || (selectedLesson.lesson_type !== 'quiz' && !selectedLesson.quiz_id)) {
    return null;
  }

  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent spacing="lg">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
          <LayoutUI.Column gap="gap-2">
            <Text variant="inverse" className="font-medium">
              Quiz builder
            </Text>
            <Text variant="muted-inverse" size="sm">
              Keep the quiz attached to this lesson instead of managing it on a separate page.
            </Text>
          </LayoutUI.Column>
          {selectedLesson.quiz_id ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeletingQuiz}
              onClick={() => {
                if (!selectedLesson.quiz_id || !window.confirm('Delete this quiz?')) {
                  return;
                }
                deleteQuiz(selectedLesson.quiz_id);
              }}
            >
              <Icons.Trash2 size={16} />
              {isDeletingQuiz ? 'Deleting...' : 'Delete quiz'}
            </Button>
          ) : null}
        </LayoutUI.Row>

        <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormUI.FormField id="quiz-title" label="Quiz title" tone="inverse">
            <Input id="quiz-title" value={quizDraft.title} onChange={(event) => setQuizDraft((current) => ({ ...current, title: event.target.value }))} tone="inverse" />
          </FormUI.FormField>
          <FormUI.FormField id="quiz-pass-score" label="Pass score" tone="inverse">
            <Input id="quiz-pass-score" type="number" value={quizDraft.pass_score} onChange={(event) => setQuizDraft((current) => ({ ...current, pass_score: Number(event.target.value || 0) }))} tone="inverse" />
          </FormUI.FormField>
        </LayoutUI.Container>

        <FormUI.FormField id="quiz-description" label="Description" tone="inverse">
          <Textarea id="quiz-description" value={quizDraft.description} onChange={(event) => setQuizDraft((current) => ({ ...current, description: event.target.value }))} rows={3} />
        </FormUI.FormField>

        <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormUI.FormField id="quiz-time-limit" label="Time limit (minutes)" tone="inverse">
            <Input id="quiz-time-limit" type="number" value={quizDraft.time_limit_minutes ?? ''} onChange={(event) => setQuizDraft((current) => ({ ...current, time_limit_minutes: event.target.value ? Number(event.target.value) : undefined }))} tone="inverse" />
          </FormUI.FormField>
          <FormUI.FormField id="quiz-max-attempts" label="Max attempts" tone="inverse">
            <Input id="quiz-max-attempts" type="number" value={quizDraft.max_attempts ?? ''} onChange={(event) => setQuizDraft((current) => ({ ...current, max_attempts: event.target.value ? Number(event.target.value) : undefined }))} tone="inverse" />
          </FormUI.FormField>
        </LayoutUI.Container>

        <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
          <Switch checked={quizDraft.is_active} onCheckedChange={(checked) => setQuizDraft((current) => ({ ...current, is_active: Boolean(checked) }))} />
          <LayoutUI.Column className="flex-1" gap="gap-1">
            <Text variant="inverse" size="sm" className="font-medium">
              Active quiz
            </Text>
            <Text variant="muted-inverse" size="xs">
              Turn this off if you want to hide the quiz without deleting it.
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>

        <LayoutUI.Column gap="gap-4">
          {quizDraft.questions.map((question, questionIndex) => (
            <div key={`${questionIndex}-${question.sort_order}`} className="rounded-3xl border border-black/10 bg-black/[0.03] p-4">
              <LayoutUI.Column gap="gap-4">
                <LayoutUI.Row justify="justify-between" align="items-center" className="gap-3">
                  <Text variant="inverse" className="font-medium">
                    Question {questionIndex + 1}
                  </Text>
                  <Button
                    type="button"
                    variant="ghost-inverse"
                    size="sm"
                    onClick={() => setQuizDraft((current) => ({ ...current, questions: current.questions.filter((_, index) => index !== questionIndex) }))}
                    disabled={quizDraft.questions.length === 1}
                  >
                    Remove
                  </Button>
                </LayoutUI.Row>

                <FormUI.FormField id={`question-${questionIndex}`} label="Question text" tone="inverse">
                  <Textarea
                    id={`question-${questionIndex}`}
                    value={question.question_text}
                    onChange={(event) =>
                      setQuizDraft((current) => ({
                        ...current,
                        questions: current.questions.map((item, index) => (index === questionIndex ? { ...item, question_text: event.target.value } : item)),
                      }))
                    }
                    rows={3}
                  />
                </FormUI.FormField>

                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormUI.FormField id={`question-type-${questionIndex}`} label="Type" tone="inverse">
                    <SelectUI.Select
                      value={question.question_type}
                      onValueChange={(value) =>
                        setQuizDraft((current) => ({
                          ...current,
                          questions: current.questions.map((item, index) =>
                            index === questionIndex
                              ? {
                                  ...item,
                                  question_type: value as QuizFormData['questions'][number]['question_type'],
                                  options:
                                    value === 'short_answer'
                                      ? []
                                      : item.options.length
                                        ? item.options
                                        : [
                                            { option_text: '', is_correct: true, sort_order: 0 },
                                            { option_text: '', is_correct: false, sort_order: 1 },
                                          ],
                                }
                              : item,
                          ),
                        }))
                      }
                    >
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select type" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {questionTypeOptions.map((option) => (
                          <SelectUI.SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  </FormUI.FormField>
                  <FormUI.FormField id={`question-points-${questionIndex}`} label="Points" tone="inverse">
                    <Input id={`question-points-${questionIndex}`} type="number" value={question.points} onChange={(event) => setQuizDraft((current) => ({ ...current, questions: current.questions.map((item, index) => (index === questionIndex ? { ...item, points: Number(event.target.value || 1) } : item)) }))} tone="inverse" />
                  </FormUI.FormField>
                  <FormUI.FormField id={`question-order-${questionIndex}`} label="Sort order" tone="inverse">
                    <Input id={`question-order-${questionIndex}`} type="number" value={question.sort_order} onChange={(event) => setQuizDraft((current) => ({ ...current, questions: current.questions.map((item, index) => (index === questionIndex ? { ...item, sort_order: Number(event.target.value || 0) } : item)) }))} tone="inverse" />
                  </FormUI.FormField>
                </LayoutUI.Container>

                <FormUI.FormField id={`question-explanation-${questionIndex}`} label="Explanation" tone="inverse">
                  <Textarea id={`question-explanation-${questionIndex}`} value={question.explanation} onChange={(event) => setQuizDraft((current) => ({ ...current, questions: current.questions.map((item, index) => (index === questionIndex ? { ...item, explanation: event.target.value } : item)) }))} rows={2} />
                </FormUI.FormField>

                {question.question_type !== 'short_answer' ? (
                  <LayoutUI.Column gap="gap-3">
                    {question.options.map((option, optionIndex) => (
                      <LayoutUI.Row key={`${optionIndex}-${option.sort_order}`} align="items-center" gap="gap-3" className="rounded-2xl border border-black/10 bg-black/[0.04] p-3">
                        <Switch
                          checked={option.is_correct}
                          onCheckedChange={(checked) =>
                            setQuizDraft((current) => ({
                              ...current,
                              questions: current.questions.map((item, index) => {
                                if (index !== questionIndex) {
                                  return item;
                                }
                                return {
                                  ...item,
                                  options: item.options.map((entry, entryIndex) => {
                                    if (item.question_type === 'single_choice') {
                                      return { ...entry, is_correct: entryIndex === optionIndex ? Boolean(checked) : false };
                                    }
                                    return entryIndex === optionIndex ? { ...entry, is_correct: Boolean(checked) } : entry;
                                  }),
                                };
                              }),
                            }))
                          }
                        />
                        <Input value={option.option_text} onChange={(event) => setQuizDraft((current) => ({ ...current, questions: current.questions.map((item, index) => (index === questionIndex ? { ...item, options: item.options.map((entry, entryIndex) => (entryIndex === optionIndex ? { ...entry, option_text: event.target.value } : entry)) } : item)) }))} tone="inverse" placeholder={`Option ${optionIndex + 1}`} />
                        <Button type="button" variant="ghost-inverse" size="sm" onClick={() => setQuizDraft((current) => ({ ...current, questions: current.questions.map((item, index) => (index === questionIndex ? { ...item, options: item.options.filter((_, entryIndex) => entryIndex !== optionIndex) } : item)) }))} disabled={question.options.length <= 2}>
                          Remove
                        </Button>
                      </LayoutUI.Row>
                    ))}
                    <Button
                      type="button"
                      variant="soft-action"
                      size="sm"
                      onClick={() =>
                        setQuizDraft((current) => ({
                          ...current,
                          questions: current.questions.map((item, index) =>
                            index === questionIndex
                              ? { ...item, options: [...item.options, { option_text: '', is_correct: false, sort_order: item.options.length }] }
                              : item,
                          ),
                        }))
                      }
                    >
                      <Icons.Plus size={16} />
                      Add option
                    </Button>
                  </LayoutUI.Column>
                ) : null}
              </LayoutUI.Column>
            </div>
          ))}
        </LayoutUI.Column>

        <LayoutUI.Row justify="justify-between" className="gap-3 max-md:flex-col">
          <Button
            type="button"
            variant="soft-action"
            size="sm"
            onClick={() =>
              setQuizDraft((current) => ({
                ...current,
                questions: [
                  ...current.questions,
                  {
                    question_text: '',
                    question_type: 'single_choice',
                    explanation: '',
                    points: 1,
                    sort_order: current.questions.length,
                    options: [
                      { option_text: '', is_correct: true, sort_order: 0 },
                      { option_text: '', is_correct: false, sort_order: 1 },
                    ],
                  },
                ],
              }))
            }
          >
            <Icons.Plus size={16} />
            Add question
          </Button>
          <Button type="button" variant="accent" size="form" disabled={isCreatingQuiz || isUpdatingQuiz} onClick={handleSaveQuiz}>
            <Icons.Save size={18} />
            {isCreatingQuiz || isUpdatingQuiz ? 'Saving...' : 'Save quiz'}
          </Button>
        </LayoutUI.Row>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
