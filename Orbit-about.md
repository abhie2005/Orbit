# Orbit

> Turn a room full of strangers into a classroom community.

## 1. Project Summary

Orbit is a first-day classroom connection experience. A professor creates a private class space and shares a join code. Students answer a short set of optional, friendly questions about their interests, background, skills, goals, and collaboration preferences. Orbit turns those answers into a collectible digital passport and places every student inside an interactive classroom constellation.

Students can explore meaningful points of connection, receive low-pressure conversation prompts, and complete short connection missions. Professors can see whether students are becoming connected without exposing sensitive individual information or ranking anyone by popularity.

Orbit is not a dating app, social-media feed, personality test, or AI friend. It is a classroom belonging tool designed to help real students begin real conversations.

## 2. One-Line Pitch

Orbit creates interactive student passports and a living classroom constellation so every student can find common ground and nobody remains invisible.

## 3. The Problem

On the first day of class, students are often placed in a room with dozens of strangers and asked to introduce themselves in a rushed, awkward format. Standard icebreakers create a few temporary conversations but do not help students remember names, discover useful connections, or include quieter students.

This problem continues throughout the semester:

- Students sit near the same people but never meet the rest of the class.
- New, shy, international, commuting, and transfer students can remain isolated.
- Students form project teams based only on existing friendships or physical proximity.
- Professors cannot easily see who lacks classroom connections.
- Traditional student profiles feel formal and transactional.
- Typical matching systems maximize similarity and can reinforce cliques.

Orbit makes the social structure of a class visible and gives students a practical reason to cross it.

## 4. Product Principles

1. **Connection, not popularity.** Never show follower counts, connection totals, rankings, likes, or public isolation scores.
2. **Choice, not forced disclosure.** Every profile question except display name is skippable. Students control what is visible and what may be used privately for matching.
3. **Common ground plus discovery.** Matches should contain at least one comfortable similarity and, when possible, one complementary or different trait.
4. **Teacher-supported, student-owned.** Professors create the space and activities, but they do not receive unrestricted access to private student answers.
5. **Explainable matching.** Every suggested connection explains why it was suggested.
6. **Real-world action.** The goal is not browsing profiles. The goal is a real conversation, study connection, or balanced project team.
7. **No AI mysticism.** Use deterministic matching for core connections. AI may generate safe conversation prompts, but it must not infer protected or sensitive traits.

## 5. Primary Users

### Student

A student joins a class, creates a passport, explores the constellation, receives connection missions, and updates their passport throughout the semester.

### Professor

A professor creates a classroom, selects onboarding questions, starts connection activities, and views privacy-preserving class-level insights.

## 6. Core User Story

It is the first day of a computer science course. The professor displays an Orbit join code. Abhi joins from his phone and answers eight short questions. Orbit creates a space-themed passport showing his interests in cloud computing, startups, cricket, science-fiction movies, and design.

His node enters the classroom constellation. Orbit highlights three useful connections:

- Maya also likes science fiction and wants to learn machine learning.
- Jordan knows backend development, while Abhi enjoys frontend design.
- Elena is also new to the campus and enjoys badminton.

Orbit gives Abhi a mission: “Meet Maya. Ask which science-fiction technology she would actually build.” After both students confirm the conversation, their shared edge becomes active. The network does not treat this as a follower or popularity metric. It records that one real classroom bridge was created.

## 7. Main Experience

### 7.1 Professor Creates a Class

The professor enters:

- Class name
- Course code
- Instructor name
- Semester
- Approximate class size
- Optional welcome message
- Selected onboarding questions
- Whether students can explore immediately or after a scheduled reveal

Orbit generates:

- A six-character join code
- A QR code
- A professor dashboard
- A private class constellation

### 7.2 Student Joins

The student:

1. Opens Orbit.
2. Enters the class code or scans the QR code.
3. Enters a display name and optional pronouns.
4. Reviews a short privacy explanation.
5. Answers six to ten questions.
6. Selects visibility for each answer.
7. Receives a generated passport.
8. Enters the constellation.

No long account-registration flow is required for the hackathon prototype.

### 7.3 Passport Questions

Questions should be quick, positive, and easy to answer. Use chips, cards, sliders, and short text instead of a long form.

Recommended MVP questions:

1. Where do you call home? Optional free text.
2. Which subjects or technologies interest you?
3. Which movie genres do you enjoy?
4. Which sports or physical activities do you enjoy?
5. What hobbies do you have outside school?
6. What is one skill you can help classmates with?
7. What is one skill you want to learn?
8. Which project role feels most natural: builder, researcher, designer, organizer, writer, or presenter?
9. How do you prefer to meet people: one-on-one, small group, or either?
10. Add one optional conversation starter about yourself.

Avoid mandatory questions about race, religion, disability, sexuality, citizenship, finances, political beliefs, or mental health.

### 7.4 Visibility Controls

Each response has one of three states:

- **Public:** visible on the passport and usable for matching.
- **Match only:** hidden from the passport but usable by the matching engine.
- **Private:** stored only for the student or not stored at all.

For the MVP, support Public and Skip if three-level privacy is too expensive to implement correctly.

### 7.5 Passport Generation

The passport is a designed visual artifact, not a plain profile card. It should contain:

- Student display name
- Initials or generated avatar
- A unique orbital pattern
- Interest stamps
- Skill badges
- “Can help with” and “Wants to learn” sections
- Preferred collaboration role
- A conversation-starter card
- Optional home location at city, state, or country level

The visual style should feel like a mixture of a passport, space mission card, and collectible game card. Avoid flags as the dominant visual because nationality should not define the student.

### 7.6 Classroom Constellation

Every student is represented as a node. An edge exists when the matching engine finds a meaningful connection.

Edge categories:

- Blue: shared academic or career interest
- Orange: shared hobby, sport, music, or movie preference
- Purple: complementary skills
- Green: shared language or voluntarily disclosed background
- Dashed: suggested connection not yet acknowledged
- Solid: both students confirmed that they met

Graph behavior:

- Selecting a student centers their node and reveals only directly relevant edges.
- Selecting an edge explains the connection in plain language.
- Filters allow users to explore skills, hobbies, goals, and project roles.
- The default view must not show connection counts.
- Node size must remain equal for everyone.
- Students with fewer edges must never be publicly labeled.
- The interface must work without the graph through a list-based accessible view.

### 7.7 Connection Missions

Orbit generates small, low-pressure actions. Examples:

- Find someone who shares one interest with you.
- Meet someone who can teach a skill you want to learn.
- Meet someone who enjoys something you have never tried.
- Form a group containing a builder, organizer, and presenter.
- Introduce two classmates who could help each other.
- Find someone outside your current network and discover one unexpected similarity.

A mission contains:

- The suggested classmate or small group
- An explanation of why the match was made
- One conversation starter
- A “Met them” confirmation
- A “Suggest someone else” option with no penalty

### 7.8 Bridge the Class

This is the professor’s signature action. Orbit recommends temporary groups designed to avoid isolation and fixed cliques.

Group formation should optimize for:

- At least one shared interest per student
- Complementary project roles
- Preference for students with fewer confirmed connections
- Avoiding repeated pairings
- Preferred group size
- Student opt-outs or accessibility needs

The professor sees the reason behind each proposed group and can manually change it before publishing.

## 8. Matching System

The core matching logic should be deterministic and explainable. Do not ask an LLM to invent compatibility scores.

### 8.1 Normalized Profile Features

Convert selected answers into normalized tags:

```ts
type StudentFeatures = {
  academicInterests: string[];
  movieGenres: string[];
  sports: string[];
  hobbies: string[];
  skillsOffered: string[];
  skillsWanted: string[];
  projectRoles: string[];
  languages: string[];
  meetingPreference: "one_on_one" | "small_group" | "either";
};
```

Use controlled option lists for most tags. Free-text answers may be displayed but should not affect matching during the MVP unless safely normalized.

### 8.2 Pair Score

Suggested scoring model:

```text
pairScore =
  3.0 * sharedAcademicInterests
+ 2.0 * sharedHobbies
+ 1.5 * sharedMoviesOrSports
+ 3.5 * complementarySkills
+ 1.0 * sharedLanguages
+ 1.0 * compatibleMeetingPreference
+ 2.5 * lowConnectionBoost
- 2.0 * repeatedPairingPenalty
```

Where:

- `complementarySkills` increases when one student offers a skill the other wants.
- `lowConnectionBoost` helps students with fewer confirmed connections receive useful suggestions.
- `repeatedPairingPenalty` encourages students to expand their circle.

Do not match based on hidden demographic inferences.

### 8.3 Edge Explanation

Every edge must be created from an explicit reason object:

```ts
type MatchReason = {
  category: "academic" | "social" | "complementary_skill" | "language";
  label: string;
  weight: number;
};
```

Example:

```json
{
  "studentA": "abhi",
  "studentB": "maya",
  "score": 9.5,
  "reasons": [
    { "category": "academic", "label": "Machine Learning", "weight": 3 },
    { "category": "social", "label": "Science Fiction", "weight": 1.5 },
    { "category": "complementary_skill", "label": "Design ↔ Backend", "weight": 3.5 }
  ]
}
```

### 8.4 Group Formation

For the hackathon, use a greedy algorithm:

1. Sort students by ascending confirmed-connection count.
2. Start a group with the least-connected unmatched student.
3. Add the highest-scoring compatible student not recently paired with them.
4. Add students whose skills or roles improve group diversity.
5. Continue until the selected group size is reached.
6. Give the professor an explanation and manual override.

Do not claim this produces mathematically optimal or scientifically perfect groups.

## 9. AI Features

AI should enhance the experience without controlling high-stakes decisions.

Acceptable AI uses:

- Generate a friendly conversation starter from explicit shared interests.
- Summarize the class’s non-sensitive interests for the professor.
- Suggest a class activity using popular interests.
- Rewrite free-text introductions for clarity only after student approval.
- Moderate obviously unsafe public profile text.

AI must not:

- Infer protected traits.
- Diagnose personality, mental health, intelligence, or social ability.
- Rank students.
- Label someone as lonely, unpopular, incompatible, or risky.
- Automatically report private responses to the professor.
- fabricate a connection not supported by explicit answers.

The application must work with templated prompts if no model API is configured.

## 10. Professor Dashboard

The professor dashboard contains privacy-preserving aggregate information:

- Number of students who completed passports
- Number of confirmed classroom introductions
- Percentage of students with at least one confirmed connection
- Most common non-sensitive interests
- Skills students offer and want to learn
- Distribution of preferred project roles
- Suggested group configurations
- Connection activity completion
- Optional anonymous belonging pulse

Do not expose a public or downloadable list of “isolated students.” If individual support is included later, access must be limited, carefully worded, and based on explicit consent.

### Belonging Pulse

Before and after the activity, students may anonymously answer:

> “I can identify at least one person in this class whom I would feel comfortable asking for help.”

Response scale: strongly disagree to strongly agree.

Show only aggregate before-and-after results. This gives the demo a measurable educational outcome without pretending that network density equals friendship.

## 11. Required Screens

### MVP Screens

1. Landing page
2. Role selection: professor or student
3. Professor class-creation page
4. Student join-code page
5. Passport-question flow
6. Passport reveal page
7. Classroom constellation
8. Connection mission panel
9. Professor dashboard

### Landing Page Copy

**Headline:** Find your people in the room.

**Subheading:** Orbit transforms first-day introductions into student passports and a living classroom constellation.

**Primary action:** Join a class

**Secondary action:** Create a class

### Empty-State Copy

> “Your constellation is still forming. Invite classmates with the class code.”

### Match Copy

> “You and Maya both enjoy science fiction. Maya wants to learn frontend development, a skill you can help with.”

### Mission Copy

> “Meet Maya and ask: If you could build one science-fiction technology, what would it be?”

## 12. Visual Direction

Orbit should feel warm, modern, and slightly playful rather than childish.

Suggested palette:

- Background: `#090B14`
- Surface: `#13182A`
- Primary violet: `#8B5CF6`
- Orbit blue: `#38BDF8`
- Warm accent: `#F59E0B`
- Connection green: `#34D399`
- Primary text: `#F8FAFC`
- Secondary text: `#AAB4CB`

Design elements:

- Soft radial gradients
- Subtle stars and orbital lines
- Equal-sized circular student nodes
- Animated passport stamps
- Smooth node-entry animation
- Edge glow only on hover or selection
- High-contrast text and visible focus states

Avoid excessive glassmorphism, tiny text, or a constantly moving background. Respect reduced-motion preferences.

## 13. Technical Architecture

### Recommended Hackathon Stack

- Next.js with TypeScript
- Tailwind CSS
- React Flow or Cytoscape.js for the network
- Supabase for database and optional anonymous authentication
- Server actions or API routes for matching and optional AI prompts
- Zod for validation
- Framer Motion for controlled passport and node animations

If speed matters more than backend completeness, use local seed data and local storage while keeping repository interfaces ready for Supabase.

### Suggested Application Structure

```text
orbit/
├── app/
│   ├── page.tsx
│   ├── join/page.tsx
│   ├── onboarding/page.tsx
│   ├── passport/page.tsx
│   ├── constellation/page.tsx
│   ├── professor/create/page.tsx
│   └── professor/dashboard/page.tsx
├── components/
│   ├── passport/
│   ├── constellation/
│   ├── onboarding/
│   ├── missions/
│   └── dashboard/
├── lib/
│   ├── matching.ts
│   ├── grouping.ts
│   ├── seed-data.ts
│   ├── privacy.ts
│   └── types.ts
└── public/
```

## 14. Data Model

```ts
type Classroom = {
  id: string;
  name: string;
  courseCode: string;
  instructorName: string;
  joinCode: string;
  semester: string;
  createdAt: string;
};

type Student = {
  id: string;
  classroomId: string;
  displayName: string;
  pronouns?: string;
  avatarSeed: string;
  meetingPreference: "one_on_one" | "small_group" | "either";
  createdAt: string;
};

type ProfileAnswer = {
  id: string;
  studentId: string;
  questionKey: string;
  values: string[];
  visibility: "public" | "match_only" | "private";
};

type Connection = {
  id: string;
  classroomId: string;
  studentAId: string;
  studentBId: string;
  score: number;
  reasons: MatchReason[];
  status: "suggested" | "confirmed" | "dismissed";
};

type Mission = {
  id: string;
  classroomId: string;
  participantIds: string[];
  title: string;
  prompt: string;
  reason: string;
  status: "active" | "completed" | "skipped";
};

type BelongingPulse = {
  id: string;
  classroomId: string;
  phase: "before" | "after";
  score: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
};
```

## 15. API Design

Suggested endpoints:

```text
POST /api/classes
POST /api/classes/join
GET  /api/classes/:id
POST /api/students
POST /api/students/:id/answers
GET  /api/students/:id/passport
POST /api/classes/:id/build-constellation
GET  /api/classes/:id/constellation
POST /api/connections/:id/confirm
POST /api/connections/:id/dismiss
POST /api/classes/:id/missions
POST /api/missions/:id/complete
GET  /api/classes/:id/insights
POST /api/classes/:id/belonging-pulse
```

For a front-end-only prototype, implement these operations as typed service functions over seed data.

## 16. Seed Demo Class

Preload 12 fictional students. Include overlapping and complementary traits so the graph has a clear structure.

Suggested students:

- Abhi: cloud, startups, cricket, science fiction, frontend; wants backend
- Maya: machine learning, science fiction, photography, backend; wants design
- Jordan: cybersecurity, basketball, gaming, public speaking; wants Python
- Elena: data science, badminton, cooking, Python; wants presentation skills
- Sam: sustainability, hiking, documentaries, research; wants web development
- Priya: fintech, dance, comedy, organization; wants cloud computing
- Leo: game development, soccer, animation, design; wants databases
- Noor: accessibility, books, strategy games, UX research; wants frontend
- Daniel: robotics, Formula 1, action movies, hardware; wants machine learning
- Sofia: entrepreneurship, volleyball, music, pitching; wants design
- Marcus: databases, anime, running, backend; wants public speaking
- Aisha: education technology, poetry, badminton, research; wants data visualization

Create one student with only one initial match so the Bridge the Class feature visibly improves inclusion. Never label that student as isolated in the public UI.

## 17. Hackathon MVP Scope

### Must Build

- Join-code flow
- Six-question onboarding
- Generated visual passport
- Interactive constellation with 12 seeded students
- Explainable edges
- One connection mission
- Professor aggregate dashboard
- Before-and-after belonging result using demo data

### Nice to Have

- QR code
- Passport download or sharing
- AI-generated conversation prompts
- Professor group builder
- Real-time class updates
- Anonymous student authentication

### Do Not Build During the Hackathon

- Messaging or social feed
- Friend requests
- Likes, comments, followers, or rankings
- Full learning-management-system integration
- Complex role permissions
- Facial recognition
- AI personality profiling
- Geographic maps using exact home locations
- Production-grade institutional analytics

## 18. Demo Script

### 0:00–0:25 — Problem

“Students can spend an entire semester in the same classroom and still remain strangers. First-day icebreakers are awkward, temporary, and easy for quieter students to disappear inside.”

### 0:25–1:05 — Create the Passport

Join the demo class as a new student. Answer six quick questions. Reveal the generated Orbit passport with animated stamps.

### 1:05–1:55 — Enter the Constellation

The new node enters the network. Select two edges and show exact shared or complementary connections. Filter the constellation by skills or interests.

### 1:55–2:25 — Complete a Mission

Open the suggested connection mission and show the generated conversation prompt. Confirm the meeting and animate the edge from dashed to solid.

### 2:25–2:45 — Bridge the Class

Switch to the professor dashboard. Show privacy-preserving aggregate insights and a suggested mixed group that includes students with fewer connections.

### 2:45–3:00 — Outcome

Show the anonymous belonging pulse increasing after the activity.

Closing line:

> “Orbit does not ask students to become more social. It gives every student a safer, more meaningful place to begin.”

## 19. Success Metrics

For the prototype:

- Passport completion rate
- Percentage of students with at least one confirmed introduction
- Number of new cross-group connections
- Mission completion rate
- Anonymous change in belonging-pulse score

Do not use total connections as a measure of student value or popularity.

## 20. Privacy, Safety, and Accessibility

- Collect the minimum information needed.
- Make personal questions optional.
- Explain visibility before collecting answers.
- Do not publicly expose connection counts.
- Do not use sensitive attributes for automatic matching.
- Allow students to hide or delete their passport.
- Allow students to dismiss any suggested connection without explanation.
- Do not provide private one-to-one messaging in the MVP.
- Use fictional data for the demonstration.
- Provide a keyboard-accessible list alternative to the graph.
- Do not communicate meaning through color alone.
- Respect reduced-motion settings.
- Keep passport text readable on mobile devices.

For a production version involving minors or institutional adoption, obtain formal privacy, security, FERPA, and child-safety review. Do not claim the hackathon prototype is production compliant.

## 21. Key Risks and Honest Responses

### Risk: Orbit could reinforce cliques

Similarity is used only as an entry point. Missions and group formation deliberately encourage complementary and cross-network connections.

### Risk: It could become a popularity graph

All nodes remain equal in size. Connection totals and rankings are hidden. Recommendations prioritize students with fewer confirmed connections without publicly identifying them.

### Risk: Students may feel forced to disclose personal information

All personal questions are optional, visibility is controlled per answer, and students may use only academic interests and skills.

### Risk: A graph does not prove friendship or belonging

Orbit measures introductions and anonymous self-reported belonging. It does not claim that an edge represents friendship.

### Risk: Professors could misuse individual data

The dashboard defaults to aggregate insights. Sensitive individual social analytics are not part of the MVP.

### Risk: The product is only useful on the first day

Passports can evolve with new skills, project needs, study groups, and rotating missions. The hackathon demo should remain focused on first-day activation.

## 22. Future Roadmap

### Phase 1: First-Day Connection

Passports, constellation, connection missions, and belonging pulse.

### Phase 2: Project Team Formation

Transparent grouping based on complementary skills, interests, schedules, and student preferences.

### Phase 3: Living Classroom Network

Study-help signals, skill exchange, rotating collaboration missions, and updated passports.

### Phase 4: Campus Orbit

Opt-in connections across classes, clubs, mentorship programs, and campus events without exposing private classroom membership.

## 23. Instructions for Claude Code

Build a polished, mobile-responsive hackathon prototype named **Orbit** based on this document.

Implementation priorities:

1. Make the end-to-end demo functional before adding extra features.
2. Use TypeScript and maintain clear component boundaries.
3. Seed the application with the 12 fictional students in this document.
4. Implement deterministic, explainable matching in `lib/matching.ts`.
5. Use React Flow or Cytoscape.js for the constellation.
6. Keep all nodes equal in size and hide connection totals.
7. Build an accessible list view alongside the graph.
8. Persist the current demo student with local storage if a backend is not ready.
9. Add tasteful animations for passport generation and node entry.
10. Do not block the prototype on authentication or external APIs.
11. Use templated conversation prompts first; add an LLM only after the complete demo works.
12. Include a demo reset button so the presentation can be rehearsed repeatedly.

Definition of done:

- A professor can open the seeded classroom dashboard.
- A new student can join with a code and answer six questions.
- The student receives a visually distinctive passport.
- Their node appears in the constellation.
- At least three explainable connections appear.
- The student can complete a connection mission.
- A suggested edge changes from dashed to solid.
- The professor view shows aggregate before-and-after belonging data.
- The full flow can be demonstrated in under three minutes without editing data manually.

## 24. Final Product Statement

Orbit treats classroom belonging as something educators can intentionally design without turning students into scores. It begins with shared interests, expands through meaningful differences, and gives every student a concrete first step toward becoming part of the class.
