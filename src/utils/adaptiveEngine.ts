import { StudentProgress, AdaptiveRecommendation } from '../types/index.js';

export function getAdaptiveRecommendation(progress: StudentProgress): AdaptiveRecommendation {
  // If no attempts recorded yet, show transparent starter recommendation
  if (progress.questionsAttempted === 0 && progress.quizTotalQuestions === 0) {
    return {
      topic: 'Variables and data types',
      difficulty: 'easy',
      reason: 'No learning history recorded yet in browser storage. Starting with foundational types, operators, and memory representation builds confidence.',
      suggestedAction: 'Try the "Swap Two Variables Using Pointers" practice problem or analyze a basic code example in the AI Debugger.',
      basedOn: 'Default cold-start heuristic (0 questions attempted).',
    };
  }

  // Find lowest accuracy topic with at least 1 attempt
  let lowestAccuracy = 1.1;
  let lowestTopic: string | null = null;
  let lowestAttempts = 0;

  for (const [topic, stats] of Object.entries(progress.topicStats)) {
    if (stats.attempted > 0) {
      const acc = stats.correct / stats.attempted;
      if (acc < lowestAccuracy) {
        lowestAccuracy = acc;
        lowestTopic = topic;
        lowestAttempts = stats.attempted;
      }
    }
  }

  // Check top error categories
  const topErrorEntry = Object.entries(progress.errorCategoryCounts).sort((a, b) => b[1] - a[1])[0];
  const topErrorCategory = topErrorEntry && topErrorEntry[1] > 0 ? topErrorEntry[0] : null;

  if (lowestTopic && lowestAccuracy < 0.65) {
    const pct = Math.round(lowestAccuracy * 100);
    return {
      topic: lowestTopic,
      difficulty: lowestAccuracy < 0.4 ? 'easy' : 'medium',
      reason: `Your recorded accuracy on "${lowestTopic}" is currently ${pct}% across ${lowestAttempts} question(s). Re-evaluating core invariants here will strengthen your foundation.`,
      suggestedAction: `Focus on ${lowestTopic} problems and read the Hinglish step-by-step breakdown.`,
      basedOn: `Recorded topic quiz performance (${pct}% accuracy).`,
    };
  }

  if (topErrorCategory && ['memory', 'runtime', 'syntax'].includes(topErrorCategory)) {
    const errorTopicMap: Record<string, string> = {
      memory: 'Pointers',
      runtime: 'Basic Data Structures',
      syntax: 'Strings',
      logic: 'Recursion',
    };
    const mappedTopic = errorTopicMap[topErrorCategory] || progress.lastPracticedTopic || 'Loops';

    return {
      topic: mappedTopic,
      difficulty: 'medium',
      reason: `You have encountered ${topErrorEntry[1]} repeated "${topErrorCategory}" issue(s) during debugging sessions.`,
      suggestedAction: `Review memory safety and pointer bounds in ${mappedTopic}.`,
      basedOn: `Frequent error category detection (${topErrorCategory}: ${topErrorEntry[1]} occurrences).`,
    };
  }

  // If high accuracy overall, recommend progressing
  return {
    topic: progress.lastPracticedTopic || 'Recursion',
    difficulty: 'hard',
    reason: `Great progress! With an overall quiz accuracy of ${
      progress.quizTotalQuestions > 0
        ? Math.round((progress.quizCorrectAnswers / progress.quizTotalQuestions) * 100)
        : 100
    }%, you are ready to tackle deeper algorithmic challenges.`,
    suggestedAction: `Advance to harder questions or generate custom problems via the Practice Arena.`,
    basedOn: `High overall quiz accuracy across recorded sessions.`,
  };
}
