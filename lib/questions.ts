/**
 * Controlled option lists + the onboarding question bank.
 *
 * Matching only ever runs over these controlled vocabularies (spec §8.1).
 * Free-text answers are displayed on the passport but never scored.
 *
 * Pure module — no React, no browser APIs.
 */

import type { MeetingPreference, ProjectRole, Question, QuestionKey } from "./types";

export const ACADEMIC_INTERESTS = [
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "Game Development",
  "Robotics",
  "Web Development",
  "Mobile Development",
  "Databases",
  "Sustainability",
  "Fintech",
  "Entrepreneurship",
  "Accessibility",
  "Education Technology",
  "Design Systems",
  "DevOps",
  "Computer Vision",
  "Networking",
  "Bioinformatics",
  "Quantum Computing",
] as const;

export const MOVIE_GENRES = [
  "Science Fiction",
  "Comedy",
  "Action",
  "Animation",
  "Drama",
] as const;

export const MUSIC_GENRES = [
  "Indie",
  "Pop",
  "Classical",
  "Hip Hop",
  "Jazz",
] as const;

export const SPORTS = [
  "Cricket",
  "Basketball",
  "Badminton",
  "Soccer",
  "Volleyball",
  "Running",
  "Swimming",
  "Tennis",
  "Hiking",
  "Cycling",
  "Table Tennis",
  "Gym & Fitness",
  "Yoga",
  "Formula 1",
  "Dance",
] as const;

export const HOBBIES = [
  "Photography",
  "Cooking",
  "Gaming",
  "Music",
  "Reading",
  "Drawing",
  "Poetry",
  "Strategy Games",
  "Chess",
  "Gardening",
  "Travel",
  "Podcasts",
  "Volunteering",
  "Coffee",
  "Film Making",
  "Crafts",
] as const;

/** One shared vocabulary so "offers X" and "wants X" can be compared directly. */
export const SKILLS = [
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
  "Python",
  "Machine Learning",
  "Databases",
  "Cloud Computing",
  "Public Speaking",
  "Presentation Skills",
  "Technical Writing",
  "Research",
  "Project Organization",
  "Data Visualization",
  "Hardware & Electronics",
  "Mobile Development",
  "Video Editing",
  "Pitching",
  "Cybersecurity",
  "Animation",
  "Game Design",
] as const;

export const PROJECT_ROLES = [
  "builder",
  "researcher",
  "designer",
  "organizer",
  "writer",
  "presenter",
] as const;

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  builder: "Builder",
  researcher: "Researcher",
  designer: "Designer",
  organizer: "Organizer",
  writer: "Writer",
  presenter: "Presenter",
};

export const PROJECT_ROLE_BLURBS: Record<ProjectRole, string> = {
  builder: "Happiest making the thing actually work",
  researcher: "Digs into the problem before anyone writes code",
  designer: "Cares how it looks and how it feels to use",
  organizer: "Keeps the plan, the timeline and the team on track",
  writer: "Turns the messy work into words people understand",
  presenter: "Comfortable standing up and telling the story",
};

export const MEETING_PREFERENCES = ["one_on_one", "small_group", "either"] as const;

export const MEETING_PREFERENCE_LABELS: Record<MeetingPreference, string> = {
  one_on_one: "One-on-one",
  small_group: "Small group",
  either: "Either is fine",
};

export const LANGUAGES = [
  "Spanish",
  "Hindi",
  "Gujarati",
  "Mandarin",
  "Arabic",
  "French",
  "Portuguese",
  "Tamil",
  "Korean",
  "Japanese",
  "German",
  "Russian",
  "Bengali",
  "Urdu",
  "Vietnamese",
] as const;

/**
 * The question bank. `core: true` marks the six questions in the fast demo
 * path; the rest are genuinely optional extras the student can skip in one tap.
 */
export const QUESTIONS: readonly Question[] = [
  {
    key: "academicInterests",
    prompt: "Which subjects or technologies interest you?",
    helper: "Pick anything you would happily nerd out about.",
    type: "chips",
    options: ACADEMIC_INTERESTS,
    usedForMatching: true,
    optional: true,
    maxSelections: 5,
    core: true,
  },
  {
    key: "skillsOffered",
    prompt: "What skills can you help classmates with?",
    helper: "You do not need to be an expert. Enough to unblock someone counts.",
    type: "chips",
    options: SKILLS,
    usedForMatching: true,
    optional: true,
    maxSelections: 4,
    core: true,
  },
  {
    key: "skillsWanted",
    prompt: "What skills do you want to learn?",
    helper: "This is how Orbit finds people who can actually help you.",
    type: "chips",
    options: SKILLS,
    usedForMatching: true,
    optional: true,
    maxSelections: 4,
    core: true,
  },
  {
    key: "hobbies",
    prompt: "What do you do outside school?",
    helper: "The stuff that makes you easy to talk to.",
    type: "chips",
    options: HOBBIES,
    usedForMatching: true,
    optional: true,
    maxSelections: 5,
    core: true,
  },
  {
    key: "projectRoles",
    prompt: "Which project role feels most natural?",
    helper: "Used to build balanced teams, never to rank anyone.",
    type: "single",
    options: PROJECT_ROLES,
    usedForMatching: true,
    optional: true,
    core: true,
  },
  {
    key: "meetingPreference",
    prompt: "How do you prefer to meet people?",
    helper: "Orbit will respect this when it suggests connections.",
    type: "single",
    options: MEETING_PREFERENCES,
    usedForMatching: true,
    optional: true,
    core: true,
  },
  {
    key: "movieGenres",
    prompt: "What movie genre do you like?",
    helper: "Pick up to 3 genres you enjoy watching.",
    type: "chips",
    options: MOVIE_GENRES,
    usedForMatching: true,
    optional: true,
    maxSelections: 3,
    core: false,
  },
  {
    key: "musicGenres",
    prompt: "What music do you like?",
    helper: "Pick up to 3 music styles you usually enjoy.",
    type: "chips",
    options: MUSIC_GENRES,
    usedForMatching: true,
    optional: true,
    maxSelections: 3,
    core: false,
  },
  {
    key: "sports",
    prompt: "Any sports or physical activities?",
    helper: "Watching counts as much as playing.",
    type: "chips",
    options: SPORTS,
    usedForMatching: true,
    optional: true,
    maxSelections: 4,
    core: false,
  },
  {
    key: "languages",
    prompt: "Which other languages do you speak?",
    helper: "Besides the language this class is taught in. Entirely optional.",
    type: "chips",
    options: LANGUAGES,
    usedForMatching: true,
    optional: true,
    maxSelections: 4,
    core: false,
  },
  {
    key: "home",
    prompt: "Where do you call home?",
    helper: "City, state or country — never an exact address.",
    type: "text",
    usedForMatching: false,
    optional: true,
    placeholder: "e.g. Ahmedabad, India",
    core: false,
  },
  {
    key: "conversationStarter",
    prompt: "Give classmates something to ask you about.",
    helper: "One line. It goes on the back of your passport.",
    type: "text",
    usedForMatching: false,
    optional: true,
    placeholder: "Ask me about the time I shipped a site at 4am.",
    core: false,
  },
];

export const CORE_QUESTIONS = QUESTIONS.filter((q) => q.core);
export const BONUS_QUESTIONS = QUESTIONS.filter((q) => !q.core);

export const QUESTION_BY_KEY: Record<QuestionKey, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.key, q]),
) as Record<QuestionKey, Question>;

/** Labels for chips whose stored value is a slug rather than display text. */
export function optionLabel(key: QuestionKey, value: string): string {
  if (key === "projectRoles") {
    return PROJECT_ROLE_LABELS[value as ProjectRole] ?? value;
  }
  if (key === "meetingPreference") {
    return MEETING_PREFERENCE_LABELS[value as MeetingPreference] ?? value;
  }
  return value;
}
