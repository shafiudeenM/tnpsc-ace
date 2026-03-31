# TNPSC Master - Advanced Quiz System Documentation

## Overview

The TNPSC Master quiz system is a production-grade, AI-powered learning platform that goes beyond traditional quiz apps. It implements advanced algorithms and analytics to solve real learning problems.

---

## Core Features

### 1. Spaced Repetition Algorithm (SM-2)

**What it solves:** Forgetting curve - students forget concepts over time

**Implementation:**
- Tracks each question with an "ease factor" (difficulty rating)
- Automatically schedules next review based on performance
- Adapts intervals based on answer quality (0-5 scale)
- Stores full history for learning curve analysis

**Algorithm Details:**
```
- First correct: Review again after 1 day
- Second correct: Review after 3 days
- Then: Interval = Previous Interval × Ease Factor
- Wrong answer: Reset to 1 day, reduce ease factor
```

**Database Tables:**
- `user_question_progress`: Current SM-2 state per user/question
- `spaced_repetition_log`: Historical tracking of all updates

**Key Files:**
- `src/services/spacedRepetition.ts`

---

### 2. Comprehensive Mistake Tracking

**What it solves:** Understanding why students fail - not just tracking failure

**Mistake Categories:**
1. **Concept Gap** - Didn't understand the topic
2. **Careless Mistake** - Silly error despite knowing the answer
3. **Time Pressure** - Ran out of time, answer was rushed

**How it Works:**
- Analyzes response timing vs average question time
- Tracks if student reviewed before submitting
- User can manually report mistake reason
- Categorizes mistakes automatically based on patterns

**Analytics Generated:**
- Subject-wise mistake distribution
- Weak areas that need concept review
- Questions where student consistently makes careless errors
- Time pressure identification

**Database Tables:**
- `quiz_answers`: Individual answer records with timing
- `mistake_categories`: Categorized mistake patterns
- `user_weak_areas`: Computed weak areas with accuracy by difficulty

**Key Files:**
- `src/services/mistakeTracking.ts`

---

### 3. Advanced Time Tracking & Speed Analytics

**What it solves:** Time management - key issue in competitive exams

**Metrics Tracked:**
- Time per question (granular - down to seconds)
- Questions answered in under 30 seconds
- Questions taking over 2 minutes
- Questions per minute (speed metric)
- Speed trends over time

**Insights Provided:**
- "You're spending too much time on hard questions"
- "Your speed needs improvement for exam success"
- "You're rushing through questions too fast"
- Comparison: Your speed vs benchmark

**Database Tables:**
- `quiz_answers.time_taken_seconds`: Per-answer timing
- `quiz_attempts.avg_time_per_question`: Session-level metrics
- `user_stats.avg_time_per_question`: Long-term tracking

**Key Files:**
- `src/services/analytics.ts` (getSpeedAnalysis)

---

### 4. Intelligent Weak Area Detection

**What it solves:** Identifying where to focus efforts

**Analysis Dimension:**
- By subject
- By difficulty level (Easy, Medium, Hard)
- By sub-topic
- Mistake frequency patterns

**Smart Prioritization:**
- Priority level: Critical, High, Medium, Low
- Based on: Accuracy % + mistake frequency
- Shows which topics need immediate attention

**Recommendations:**
Auto-generates actionable advice:
- "Your accuracy in Indian Polity is only 45% - focus on concept learning"
- "Careless mistakes dominate in Economy - review before submitting"
- "You struggle with Hard difficulty questions in History"

**Database Tables:**
- `user_weak_areas`: Computed weak areas with all metrics
- `mistake_categories`: Mistake analysis by subject

**Key Files:**
- `src/services/mistakeTracking.ts` (getWeakAreasAnalysis)

---

### 5. Spaced Repetition Quiz Selection

**What it solves:** Intelligent quiz generation based on student needs

**Quiz Types:**
1. **Daily Quiz** - Mix of spaced repetition + new questions
2. **Subject Quiz** - Focus on specific subject
3. **Spaced Repetition** - Only due questions
4. **Weak Areas** - Focus on priority weak areas

**Smart Selection:**
- Shows only questions due for review (next_review_date <= today)
- Prioritizes poorly-performing questions
- Removes mastered questions (5+ correct repetitions)
- Randomizes for better learning

**Key Files:**
- `src/services/quizEngine.ts` (createQuizSession)

---

### 6. Performance Analytics Dashboard

**Metrics Displayed:**
1. **Overall Accuracy** - Percentage correct
2. **Consistency Score** - How stable your performance is
3. **Learning Speed** - Questions per minute
4. **Improvement Rate** - Week-over-week accuracy change

**Charts & Visualizations:**
- Subject-wise accuracy bar chart
- Accuracy trend line (30 days)
- Speed analysis breakdown
- Question distribution by difficulty

**Learning Progress:**
- New questions (not yet seen)
- Learning questions (in progress)
- Mastered questions (5+ correct)
- Due for review (for spaced repetition)

**Key Files:**
- `src/services/analytics.ts` (all methods)
- `src/pages/QuizAnalyticsDashboard.tsx`

---

### 7. Automated Learning Insights

**What it solves:** Students don't know what to do next

**Insight Types:**
1. **Improvement Alert** - "You've improved 15% this week!"
2. **Declining Performance** - "Your accuracy dropped 8%"
3. **Critical Weakness** - "Indian Polity accuracy is 35%"
4. **Speed Issue** - "You're too slow for exams"
5. **Streak Milestone** - "7-day streak! Keep going!"
6. **Concept Gap** - "Review fundamentals in this area"

**Priority Levels:**
- High: Needs immediate attention
- Medium: Should address soon
- Low: Good to improve

**Recommendations Include:**
- Specific action items
- Priority level
- Rationale behind the insight

**Key Files:**
- `src/services/analytics.ts` (generateInsights, getRecommendations)

---

## Database Schema

### Key Tables

#### `questions`
Stores TNPSC questions with bilingual support
```sql
- id: UUID
- question_text, question_ta: Bilingual questions
- options: JSON array
- correct_answer: Integer index
- explanation, explanation_ta: Bilingual explanations
- subject, sub_topic, difficulty, year, is_pyq, tags
```

#### `user_question_progress`
Tracks SM-2 algorithm state per user/question
```sql
- user_id, question_id
- repetitions, ease_factor, interval, next_review_date
- times_correct, times_wrong, last_reviewed_at
```

#### `quiz_attempts`
Session-level quiz records
```sql
- user_id, quiz_type, subject
- started_at, completed_at, duration_seconds
- correct_answers, wrong_answers, skipped_answers, accuracy
- avg_time_per_question
```

#### `quiz_answers`
Individual answer records with timing
```sql
- quiz_attempt_id, user_id, question_id
- selected_answer, is_correct, time_taken_seconds
- flagged, reviewed_before_submit
- mistake_type, user_reported_reason
```

#### `mistake_categories`
Categorized mistake patterns
```sql
- user_id, question_id, mistake_type
- frequency, subject, last_made_at
```

#### `user_weak_areas`
Computed weak area analytics
```sql
- user_id, subject, sub_topic
- accuracy_percentage, mistake_count, correct_count, total_attempts
- easy_accuracy, medium_accuracy, hard_accuracy
- needs_improvement, last_updated_at
```

#### `user_stats`
Aggregated user statistics (updated after each quiz)
```sql
- user_id
- total_quizzes_attempted, total_questions_solved
- overall_accuracy, current_streak, longest_streak
- avg_time_per_question, correct/wrong totals
- subject_accuracy (JSON), last_quiz metrics
```

#### `spaced_repetition_log`
Historical tracking for SM-2 updates
```sql
- user_id, question_id
- previous/new: ease_factor, interval, repetitions
- response_quality (0-5), next_review_date
```

---

## API Services

### SpacedRepetitionService
```typescript
- calculateSM2(progress, responseQuality) - SM-2 algorithm
- getQuestionsForReview(userId, limit) - Due questions
- getNewQuestions(userId, subject?, limit) - New questions
- updateQuestionProgress(userId, questionId, isCorrect) - Update after answer
- getProgressStats(userId) - Learning progress overview
```

### QuizEngineService
```typescript
- createQuizSession(userId, config) - Generate quiz
- recordAnswer(session, index, answer, time, flagged) - Store answer
- saveQuizAttempt(session) - Save to database
- updateUserStats(userId, quizAttempt) - Update aggregates
- getQuizHistory(userId, limit) - Quiz records
- getQuizDetails(quizAttemptId) - Detailed review
```

### MistakeTrackingService
```typescript
- categorizeMistake(...) - Determine mistake type
- recordMistake(userId, questionId, subject, type, reason) - Store
- getUserMistakes(userId) - All mistakes
- getWeakAreasAnalysis(userId) - Detailed analysis
- updateWeakAreas(userId) - Recompute metrics
- getPriorityWeakAreas(userId, limit) - Top weak areas
```

### AnalyticsService
```typescript
- getPerformanceMetrics(userId) - Overall stats
- getSubjectPerformance(userId) - Per-subject accuracy
- getSpeedAnalysis(userId) - Timing metrics
- getAccuracyTrend(userId, days) - Historical trend
- generateInsights(userId) - Learning insights
- getRecommendations(userId) - Action items
```

---

## Key Differentiators (Beyond Normal Quiz Apps)

### 1. **Spaced Repetition**
- Not just: Practice questions
- But: Scientifically schedule reviews using SM-2 algorithm

### 2. **Mistake Analysis**
- Not just: Show correct/wrong
- But: Categorize WHY wrong (concept vs careless vs time pressure)

### 3. **Weak Area Detection**
- Not just: Show accuracy by subject
- But: Identify difficulty-level patterns, mistake causes, priority ranking

### 4. **Speed Metrics**
- Not just: Show average time
- But: Track speed trends, identify rushing vs overthinking

### 5. **Intelligent Recommendations**
- Not just: Generic advice
- But: Data-driven insights specific to student's patterns

### 6. **Progress Tracking**
- Not just: Overall accuracy
- But: Consistency score, improvement rate, learning curve analysis

---

## Data Flow

### Quiz Completion Flow
```
1. Student starts quiz
   → createQuizSession() fetches questions

2. Student answers questions
   → recordAnswer() stores in memory

3. Student finishes quiz
   → saveQuizAttempt() saves to DB:
     - quiz_attempts record created
     - Each quiz_answers record created
     - SM-2 progress updated for each question
     - spaced_repetition_log entries added

4. Post-quiz processing
   → updateUserStats() aggregates stats
   → updateWeakAreas() recomputes weak areas
   → Dashboard shows updated metrics
```

### Analytics Generation
```
1. User views dashboard/analytics
   → Parallel API calls:
     - getPerformanceMetrics()
     - getSubjectPerformance()
     - getSpeedAnalysis()
     - getAccuracyTrend()
     - generateInsights()
     - getProgressStats()

2. Results aggregated and displayed
   → Charts, insights, recommendations shown
```

---

## Future Enhancements

### Phase 2
- AI-powered doubt resolution
- Video explanations for mistakes
- Peer comparison & leaderboards
- Study scheduling recommendations

### Phase 3
- Adaptive difficulty (easy → hard based on performance)
- Predictive score modeling
- Mock test simulations
- Question bank expansion (10k+ questions)

---

## Production Checklist

- [x] Database schema with RLS security
- [x] SM-2 algorithm implementation
- [x] Mistake tracking & categorization
- [x] Time tracking & analysis
- [x] Weak area detection
- [x] Quiz engine with question selection
- [x] Analytics dashboard
- [x] Insight generation
- [x] Build optimization
- [ ] Load testing (100+ concurrent users)
- [ ] Error handling & recovery
- [ ] Rate limiting
- [ ] API documentation
- [ ] Mobile optimization

---

## Files Structure

```
src/
├── services/
│   ├── spacedRepetition.ts    # SM-2 algorithm
│   ├── quizEngine.ts          # Quiz creation & saving
│   ├── mistakeTracking.ts     # Mistake analysis
│   └── analytics.ts           # Analytics & insights
├── hooks/
│   └── useAuth.tsx            # Authentication hook
├── lib/
│   └── supabase.ts            # Supabase client & types
└── pages/
    ├── QuizPage.tsx           # Quiz UI
    ├── QuizAnalyticsDashboard.tsx  # Analytics UI
    └── Dashboard.tsx          # Main dashboard
```

---

## Testing Recommendations

1. **Spaced Repetition**: Verify SM-2 calculations with sample data
2. **Mistake Tracking**: Test categorization with various timings
3. **Weak Areas**: Verify accuracy calculations across difficulties
4. **Analytics**: Ensure data aggregation is correct
5. **Edge Cases**: Test with users having no quiz history

---

## Security Notes

- All queries use RLS (Row Level Security) - users see only their data
- Authentication via Supabase Auth
- No secrets exposed in client code
- Database enforces data isolation at row level
- Sensitive operations limited to authenticated users

---

**Version:** 1.0
**Last Updated:** March 31, 2026
