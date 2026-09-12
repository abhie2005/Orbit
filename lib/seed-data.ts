/**
 * The seeded demo classroom (spec §16).
 *
 * All twelve students are fictional. One of them (Aisha) is deliberately built
 * with almost nothing in common with the class, so "Bridge the Class" has a
 * visible job to do. She is NEVER labelled as isolated in student-facing UI —
 * only the grouping algorithm knows, and only privately.
 *
 * Pure module — no React, no browser APIs.
 */

import { deriveFeatures } from "./privacy";
import type {
  Classroom,
  MeetingPreference,
  ProfileAnswer,
  ProjectRole,
  QuestionKey,
  Student,
  StudentFeatures,
} from "./types";

export const DEMO_CLASSROOM: Classroom = {
  id: "class_demo",
  name: "Human-Centered Computing",
  courseCode: "CS 2340",
  instructorName: "Prof. Rivera",
  joinCode: "ORBIT7",
  semester: "Fall 2026",
  welcomeMessage:
    "Welcome. You will work with almost everyone in this room at some point. Let's make that less awkward.",
  approxSize: 24,
  createdAt: "2026-09-01T09:00:00.000Z",
};

type SeedInput = {
  id: string;
  displayName: string;
  pronouns?: string;
  home: string;
  conversationStarter: string;
  academicInterests: string[];
  movieGenres: string[];
  sports: string[];
  hobbies: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  projectRole: ProjectRole;
  meetingPreference: MeetingPreference;
  languages: string[];
};

const SEED_INPUT: SeedInput[] = [
  {
    id: "stu_abhi",
    displayName: "Abhi",
    pronouns: "he/him",
    home: "Ahmedabad, India",
    conversationStarter: "Ask me about the site I shipped at 4am and immediately broke.",
    academicInterests: ["Cloud Computing", "Entrepreneurship", "Web Development"],
    movieGenres: ["Science Fiction", "Action"],
    sports: ["Cricket"],
    hobbies: ["Coffee", "Travel"],
    skillsOffered: ["Frontend Development", "UI/UX Design", "Cloud Computing"],
    skillsWanted: ["Backend Development", "Machine Learning"],
    projectRole: "builder",
    meetingPreference: "either",
    languages: ["Hindi", "Gujarati"],
  },
  {
    id: "stu_maya",
    displayName: "Maya",
    pronouns: "she/her",
    home: "Seattle, USA",
    conversationStarter: "Ask me which science-fiction gadget I would actually try to build.",
    academicInterests: ["Machine Learning", "Data Science"],
    movieGenres: ["Science Fiction", "Documentary"],
    sports: ["Running"],
    hobbies: ["Photography", "Coffee"],
    skillsOffered: ["Backend Development", "Python", "Machine Learning"],
    skillsWanted: ["UI/UX Design", "Frontend Development"],
    projectRole: "builder",
    meetingPreference: "one_on_one",
    languages: [],
  },
  {
    id: "stu_jordan",
    displayName: "Jordan",
    pronouns: "they/them",
    home: "Chicago, USA",
    conversationStarter: "Ask me about the CTF my team almost won.",
    academicInterests: ["Cybersecurity", "Networking"],
    movieGenres: ["Thriller", "Action"],
    sports: ["Basketball"],
    hobbies: ["Gaming", "Chess"],
    skillsOffered: ["Public Speaking", "Cybersecurity"],
    skillsWanted: ["Python", "Machine Learning"],
    projectRole: "presenter",
    meetingPreference: "small_group",
    languages: [],
  },
  {
    id: "stu_elena",
    displayName: "Elena",
    pronouns: "she/her",
    home: "Valencia, Spain",
    conversationStarter: "Ask me what to cook when you have twenty minutes and no plan.",
    academicInterests: ["Data Science", "Bioinformatics"],
    movieGenres: ["Drama", "Documentary"],
    sports: ["Badminton"],
    hobbies: ["Cooking", "Travel"],
    skillsOffered: ["Python", "Data Visualization"],
    skillsWanted: ["Presentation Skills", "Public Speaking"],
    projectRole: "researcher",
    meetingPreference: "one_on_one",
    languages: ["Spanish"],
  },
  {
    id: "stu_sam",
    displayName: "Sam",
    pronouns: "he/him",
    home: "Portland, USA",
    conversationStarter: "Ask me about the compost project nobody asked me to start.",
    academicInterests: ["Sustainability", "Data Science"],
    movieGenres: ["Documentary", "Drama"],
    sports: ["Hiking", "Cycling"],
    hobbies: ["Gardening", "Volunteering"],
    skillsOffered: ["Research", "Technical Writing"],
    skillsWanted: ["Frontend Development", "Mobile Development"],
    projectRole: "researcher",
    meetingPreference: "small_group",
    languages: [],
  },
  {
    id: "stu_priya",
    displayName: "Priya",
    pronouns: "she/her",
    home: "Toronto, Canada",
    conversationStarter: "Ask me why I have four different to-do apps and still forget things.",
    academicInterests: ["Fintech", "Entrepreneurship"],
    movieGenres: ["Comedy", "Romance"],
    sports: ["Dance"],
    hobbies: ["Podcasts", "Coffee"],
    skillsOffered: ["Project Organization", "Pitching"],
    skillsWanted: ["Cloud Computing", "Backend Development"],
    projectRole: "organizer",
    meetingPreference: "either",
    languages: ["Hindi"],
  },
  {
    id: "stu_leo",
    displayName: "Leo",
    pronouns: "he/him",
    home: "São Paulo, Brazil",
    conversationStarter: "Ask me about the game jam that cost me a weekend of sleep.",
    academicInterests: ["Game Development", "Computer Vision"],
    movieGenres: ["Animation", "Fantasy"],
    sports: ["Soccer"],
    hobbies: ["Drawing", "Gaming"],
    skillsOffered: ["Game Design", "Animation", "UI/UX Design"],
    skillsWanted: ["Databases", "Backend Development"],
    projectRole: "designer",
    meetingPreference: "small_group",
    languages: ["Portuguese"],
  },
  {
    id: "stu_noor",
    displayName: "Noor",
    pronouns: "she/her",
    home: "Amman, Jordan",
    conversationStarter: "Ask me about the worst website I have ever tried to use with a screen reader.",
    academicInterests: ["Accessibility", "Design Systems"],
    movieGenres: ["Mystery", "Drama"],
    sports: ["Yoga"],
    hobbies: ["Reading", "Strategy Games"],
    skillsOffered: ["Research", "UI/UX Design"],
    skillsWanted: ["Frontend Development", "Mobile Development"],
    projectRole: "researcher",
    meetingPreference: "one_on_one",
    languages: ["Arabic"],
  },
  {
    id: "stu_daniel",
    displayName: "Daniel",
    pronouns: "he/him",
    home: "Munich, Germany",
    conversationStarter: "Ask me about the robot arm that worked exactly once.",
    academicInterests: ["Robotics", "Computer Vision"],
    movieGenres: ["Action", "Thriller"],
    sports: ["Formula 1", "Gym & Fitness"],
    hobbies: ["Crafts", "Podcasts"],
    skillsOffered: ["Hardware & Electronics", "Python"],
    skillsWanted: ["Machine Learning", "Data Visualization"],
    projectRole: "builder",
    meetingPreference: "small_group",
    languages: ["German"],
  },
  {
    id: "stu_sofia",
    displayName: "Sofia",
    pronouns: "she/her",
    home: "Bogotá, Colombia",
    conversationStarter: "Ask me about the pitch competition I entered on a dare.",
    academicInterests: ["Entrepreneurship", "Fintech"],
    movieGenres: ["Comedy", "Drama"],
    sports: ["Volleyball"],
    hobbies: ["Music", "Travel"],
    skillsOffered: ["Pitching", "Presentation Skills"],
    skillsWanted: ["UI/UX Design", "Frontend Development"],
    projectRole: "presenter",
    meetingPreference: "either",
    languages: ["Spanish"],
  },
  {
    id: "stu_marcus",
    displayName: "Marcus",
    pronouns: "he/him",
    home: "Atlanta, USA",
    conversationStarter: "Ask me which anime opening is objectively the best. I am correct.",
    academicInterests: ["Databases", "DevOps"],
    movieGenres: ["Anime", "Action"],
    sports: ["Running"],
    hobbies: ["Gaming", "Music"],
    skillsOffered: ["Databases", "Backend Development"],
    skillsWanted: ["Public Speaking", "Presentation Skills"],
    projectRole: "builder",
    meetingPreference: "one_on_one",
    languages: [],
  },
  {
    // Deliberately sparse. Exactly one match before Bridge the Class runs.
    id: "stu_aisha",
    displayName: "Aisha",
    pronouns: "she/her",
    home: "Nairobi, Kenya",
    conversationStarter: "Ask me about the poem I read at open mic and immediately regretted.",
    academicInterests: ["Education Technology"],
    movieGenres: [],
    sports: ["Badminton"],
    hobbies: ["Poetry"],
    skillsOffered: ["Research"],
    skillsWanted: ["Data Visualization"],
    projectRole: "writer",
    meetingPreference: "one_on_one",
    languages: [],
  },
];

function answer(
  studentId: string,
  questionKey: QuestionKey,
  values: string[],
): ProfileAnswer {
  return {
    id: `ans_${studentId}_${questionKey}`,
    studentId,
    questionKey,
    values,
    visibility: "public",
  };
}

export type StudentRecord = {
  student: Student;
  answers: ProfileAnswer[];
};

function toRecord(input: SeedInput): StudentRecord {
  const student: Student = {
    id: input.id,
    classroomId: DEMO_CLASSROOM.id,
    displayName: input.displayName,
    pronouns: input.pronouns,
    avatarSeed: input.id,
    meetingPreference: input.meetingPreference,
    isSeed: true,
    createdAt: DEMO_CLASSROOM.createdAt,
  };

  const answers: ProfileAnswer[] = [
    answer(input.id, "academicInterests", input.academicInterests),
    answer(input.id, "skillsOffered", input.skillsOffered),
    answer(input.id, "skillsWanted", input.skillsWanted),
    answer(input.id, "hobbies", input.hobbies),
    answer(input.id, "projectRoles", [input.projectRole]),
    answer(input.id, "meetingPreference", [input.meetingPreference]),
    answer(input.id, "movieGenres", input.movieGenres),
    answer(input.id, "sports", input.sports),
    answer(input.id, "languages", input.languages),
    answer(input.id, "home", [input.home]),
    answer(input.id, "conversationStarter", [input.conversationStarter]),
  ].filter((a) => a.values.length > 0);

  return { student, answers };
}

export const SEED_STUDENTS: StudentRecord[] = SEED_INPUT.map(toRecord);

export function seedFeatures(): { id: string; features: StudentFeatures }[] {
  return SEED_STUDENTS.map((record) => ({
    id: record.student.id,
    features: deriveFeatures(record.answers),
  }));
}

/** Anonymous belonging-pulse responses collected before the activity (spec §10). */
export const SEED_PULSE_BEFORE: (1 | 2 | 3 | 4 | 5)[] = [
  2, 1, 3, 2, 2, 4, 1, 3, 2, 2, 3, 1,
];
