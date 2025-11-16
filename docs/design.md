I’ll break this into:

Product overview & core features

Data model (with JSON-ish examples)

Reading engine & interpretation rules

UI/UX flows (at a high level)

Card reference appendix with meanings for all 78 cards (concise, dev-friendly)

1. Product Overview
1.1 Goal

Build an app that:

Lets users draw cards from your custom deck (78 unique cards).

Supports multiple spreads (3-card, Celtic-cross–like, custom pantheon spreads later).

Provides generated interpretations using:

Card meaning (upright / reversed)

Card’s role (Major vs Quad vs Minor)

Position in spread (past, present, obstacle, etc.)

Allows browsing card meanings outside readings.

1.2 Platforms

Keep it platform-agnostic in the design:

Frontend: Web (React / Vue / Svelte) or Mobile (Flutter / React Native).

Backend: Simple REST/GraphQL API or even static JSON if offline-only.

Storage: Card metadata shipped with app (JSON); readings optionally saved in local storage or DB.

2. Core Concepts & Data Model
2.1 Key Entities

Card

id: string (unique, e.g., "major_first_sibling")

name: string (e.g., "The First Sibling")

arcana: "major" or "minor"

group: e.g., "Primordial" | "Elder" | "High Pantheon" | "Quad I" ... "Quad VIII"

quad: nullable, "Quad I" etc. for lower pantheon and minors

rank: for minors "High Priest" | "Sword" | "House" | "Chalice"; null for majors

domains: string[] (themes: e.g., ["life", "death", "transformation"])

upright_keywords: string[]

upright_meaning: string (1–3 sentences)

reversed_keywords: string[]

reversed_meaning: string (1–3 sentences)

Spread

id: string

name: string

positions: array of:

index: number (0-based)

label: string ("Past", "Present", "Challenge", etc.)

description: string (how this slot shades meaning)

Reading

id: string

timestamp: ISO string

spread_id: string

question: optional string

cards: array of:

card_id

position_index

is_reversed: boolean

raw_card_data: snapshot of card at time of reading (optional)

generated_interpretation: string (final text blob or structured sections)

2.2 Example: Card JSON
{
  "id": "major_justicar",
  "name": "Justicar, God of Law and Oaths",
  "arcana": "major",
  "group": "High Pantheon",
  "quad": null,
  "rank": null,
  "domains": ["law", "oaths", "order", "responsibility"],
  "upright_keywords": ["justice", "accountability", "structure"],
  "upright_meaning": "Upright Justicar represents fair judgment, honoring oaths, and bringing your life back into alignment with your stated values.",
  "reversed_keywords": ["rigidity", "tyranny", "hypocrisy"],
  "reversed_meaning": "Reversed Justicar warns of weaponized rules, unfair treatment, or being crushed by a system that values order over people."
}

2.3 Example: Minor Card JSON
{
  "id": "minor_quad1_high_priest",
  "name": "High Priest of Life and Death",
  "arcana": "minor",
  "group": "Quad I – Life and Death",
  "quad": "Quad I",
  "rank": "High Priest",
  "domains": ["transition", "thresholds", "ritual"],
  "upright_keywords": ["acceptance", "guided change", "ritual closure"],
  "upright_meaning": "A figure who shepherds endings into meaningful beginnings. Upright, this card signifies consciously closing a chapter and honoring what has passed.",
  "reversed_keywords": ["avoidance", "stagnation", "fear of change"],
  "reversed_meaning": "Reversed, this card points to resisting necessary endings or clinging to what should be released."
}

3. Reading Engine & Interpretation Logic
3.1 Shuffle & Draw

Deck: 78 cards.

Shuffle: standard Fisher–Yates on cards[].

Orientation:

For each drawn card, generate is_reversed = random() < 0.5 (or configurable bias).

3.2 Basic Interpretation Algorithm

Given:

question

spread.positions[]

cards[] (with is_reversed and card_id)

Algorithm:

For each card in the reading:

Load card metadata.

Determine base meaning:

If !is_reversed: use upright_meaning & upright_keywords

Else: reversed_meaning & reversed_keywords

Combine with spread position descriptor:

Example:
"In the Past position, Justicar upright suggests that a past decision or judgment still shapes your present situation..."

Optional: Add cross-card relationships:

E.g., if multiple cards share domains like "war" or "change", note recurring themes.

Generate a final interpretation object:

{
  "summary": "...",
  "by_position": [
    {
      "position_label": "Past",
      "card_name": "Justicar",
      "is_reversed": false,
      "interpretation": "..."
    },
    ...
  ],
  "themes": [
    "law", "change", "relationships"
  ]
}


UI formats that into readable text.

3.3 Spreads (MVP)

Include at least:

Single Card (Insight)

Positions: ["Message"]

Three Card (Path)

["Past", "Present", "Potential Future"]

Four-Point Quad Spread (The Concordat Cross)

["Root", "Conflict", "Aid", "Outcome"]

Later: custom spreads that mirror Quads (Life & Death, Knowledge & Deception, etc.).

4. UI / UX High-Level Design
4.1 Home Screen

Quick actions:

“Draw a Daily Card”

“Start a Reading”

“Browse the Deck”

4.2 Reading Flow

User selects:

Spread type

Optional question prompt

App animates shuffle + card draw.

Cards are shown face-down then flipped.

Each card tile shows:

Name

Group (e.g., “High Pantheon”)

Icon for reversed (rotated card or symbol)

Tapping a card:

Shows detail:

Upright / reversed text

Domains

Keywords

Interpretation view:

Shows generated narrative grouped by position.

4.3 Card Browser

Filter by:

Arcana (major / minor)

Group (Primordial, Quad I, etc.)

Domain tags (war, change, hope, etc.)

Card detail page reuses same metadata as reading.

5. CARD REFERENCE APPENDIX (for Devs)

Below is a concise meaning set for all 78 cards.
Each entry has Upright / Reversed distilled to something devs can drop into JSON.

I’ll keep them short but distinct. You can expand text later if needed.

5.1 Major Arcana – Primordial (3)

1. The First Sibling

Upright: Origin, wholeness, latent potential, “everything exists at once but unshaped.”

Reversed: Fragmentation, identity crisis, feeling pulled in too many directions.

2. Pro’a – The Brother (The Dreamer / Sacrifice)

Upright: Willing sacrifice, foundation-laying, choosing an ending so others can begin.

Reversed: Needless self-erasure, martyrdom complex, sacrificing the wrong things.

3. Fo’na – The Sister (The Weaver)

Upright: Creative expansion, weaving many paths, making meaning from raw material.

Reversed: Overextension, losing yourself in others’ stories, chaos without structure.

5.2 Major Arcana – Elder Gods (6)

4. Atal’lo – The Ocean Depths

Upright: Emotional depth, intuition, inevitability, surrender to a larger cycle.

Reversed: Emotional drowning, overwhelm, secrets festering in the deep.

5. Gura’an – The Mountain and Stone

Upright: Stability, endurance, long-term commitment, firm boundaries.

Reversed: Stubbornness, blockages, refusal to adapt.

6. Sengi – The Fire Within

Upright: Passion, necessary destruction, purification through fire, courage.

Reversed: Rage, reckless destruction, burning bridges needlessly.

7. Mata’la – The Sky and Storm

Upright: Change in motion, sudden insight, divine message, freeing winds.

Reversed: Chaos, uncontrolled upheaval, anxiety, scattered focus.

8. U’un – The Shadow of Night

Upright: Rest, introspection, dreams, quiet gestation.

Reversed: Numbness, oblivion, escapism, avoidance.

9. Lågua – The Green Veil

Upright: Growth, renewal, natural expansion, life asserting itself.

Reversed: Overgrowth, entanglement, consuming or smothering energy.

5.3 Major Arcana – High Pantheon (5)

10. Justicar – God of Law and Oaths

Upright: Fair judgment, accountability, living your stated values.

Reversed: Weaponized rules, injustice, hypocrisy, legalistic harm.

11. Velira – Desire and Beauty

Upright: Inspiration, attraction, creative desire, heartfelt longing.

Reversed: Obsession, vanity, addiction to approval or pleasure.

12. Tharos – War and Dominion

Upright: Strategic action, leadership, disciplined conflict, claiming your ground.

Reversed: Bullying, conquest for its own sake, abuse of power.

13. Nyxira – Secrets and Shadows

Upright: Healthy secrecy, discernment, hidden wisdom, discretion.

Reversed: Lies, manipulation, paranoia, secrets used as weapons.

14. Eryndor – Hope and Mercy

Upright: Compassion, second chances, emotional healing, shelter.

Reversed: False hope, enabling harm, avoidance disguised as kindness.

5.4 Major Arcana – Lower Pantheon / Quads (32)
Quad I – Life and Death

15. The Animist

Upright: Harmony with nature, cycles, respecting all spirits.

Reversed: Chaos in natural rhythms, exploitation of life or environment.

16. The Healer

Upright: Healing, support, mending body or soul.

Reversed: Burnout, neglecting self, treatments that hurt more than help.

17. The Thorn

Upright: Healthy boundaries, protection, saying “no” with clarity.

Reversed: Cruel walls, shutting everyone out, spiteful defense.

18. The Chalice (of Quad I)

Upright: Abundance, celebration, shared joy and nourishment.

Reversed: Overindulgence, gluttony, emotional hangovers.

Quad II – Knowledge and Deception

19. The Lorekeeper

Upright: Memory, accurate records, truthful storytelling.

Reversed: Historical revisionism, misinformation, weaponized narratives.

20. The Seer

Upright: Insight, foresight, seeing patterns and consequences.

Reversed: Confusion, false prophecy, misreading the signs.

21. The Mask

Upright: Healthy privacy, identity protection, role-playing safely.

Reversed: Deception, corruption behind a facade, hidden agendas.

22. The Quill

Upright: Honest communication, recording truth, articulate expression.

Reversed: Propaganda, spin, lying on the page or screen.

Quad III – Justice and Tyranny

23. The Judge

Upright: Fairness, proportional consequences, moral clarity.

Reversed: Biased judgment, scapegoating, unequal standards.

24. The Crown

Upright: Responsible leadership, stewardship, earned authority.

Reversed: Tyranny, entitlement, ruling without listening.

25. The Chain

Upright: Unity, solidarity, choosing to stand together.

Reversed: Enslavement, coercion, unhealthy ties.

26. The Blade (of Quad III)

Upright: Clear decision, cutting through confusion, necessary severance.

Reversed: Cruelty, rash choices, unnecessary harm.

Quad IV – Creation and Destruction

27. The Artisan

Upright: Craft, beauty, skilled work, creation with care.

Reversed: Shoddy work, vandalism, destruction of beauty.

28. The Forge

Upright: Innovation, building tools, constructive technology.

Reversed: War machines, harmful inventions, progress without ethics.

29. The Tower (of Quad IV)

Upright: Steadfast protection, enduring structure, stable refuge.

Reversed: Isolation, crumbling foundations, self-imposed exile.

30. The Flame

Upright: Passion, drive, artistic fire, transformative emotion.

Reversed: Burnout, reckless impulse, destructive fixations.

Quad V – War and Conflict

31. The Warrior

Upright: Courage, discipline, honorable struggle.

Reversed: Aggression, domination, needless fighting.

32. The Titan

Upright: Protective strength, standing firm for others.

Reversed: Oppression, throwing weight around, unchecked power.

33. The Drum

Upright: Coordination, rallying people, shared purpose.

Reversed: Warbeat, incitement, whipping up fear or hatred.

34. The Serpent

Upright: Cycles, renewal, endings feeding new beginnings.

Reversed: Betrayal, repeating toxic patterns, failure to learn.

Quad VI – Light and Shadow

35. The Angel

Upright: Purity of intent, peace, moral striving.

Reversed: Intolerance, zealotry, “holier than thou” harm.

36. The Lantern

Upright: Clarity, truth, illumination of a path.

Reversed: False hope, misleading light, selective truth.

37. The Veil (of Quad VI)

Upright: Protective secrecy, sacred mysteries, privacy with purpose.

Reversed: Smothering, hiding problems, refusing to face truth.

38. The Mirror

Upright: Honest self-reflection, seeing patterns in yourself.

Reversed: Obsession, self-loathing, distorted self-image.

Quad VII – Fate and Change

39. The Shepherd

Upright: Guidance, mentorship, safe direction.

Reversed: Misguidance, dependency, blind following.

40. The Loom

Upright: Destiny, interconnected causes, meaningful patterns.

Reversed: Fatalism, feeling trapped by fate, tangled consequences.

41. The Key

Upright: Opportunity, access, unlocking new paths.

Reversed: Blocked doors, withheld resources, locked-in situations.

42. The Wave

Upright: Cleansing change, emotional release, necessary transformation.

Reversed: Overwhelm, drowning in events, fear of change.

Quad VIII – Cycles and Thresholds

43. The Bell

Upright: Markers of time, beginnings and endings, ritual cycles.

Reversed: Stagnation, refusing to move on, despair at repetition.

44. The Hearth

Upright: Home, kinship, emotional safety, chosen family.

Reversed: Stagnation, family conflict, clinging to unhealthy comfort.

45. The Masker

Upright: Play, joy, creative mischief, experimentation.

Reversed: Cruel jokes, humiliation, emotional manipulation as “fun.”

46. The Shadow (U’un, Aspect)

Upright: Night as sanctuary, dreams, inner stillness.

Reversed: Oblivion, giving up, sinking into apathy.

5.5 Minor Arcana – 8 Quads × 4 Roles (32)

For minors, each card = Quad Theme + Role.

I’ll give each a short meaning pair. Developers can infer structure from IDs like minor_quad2_sword.

Quad I – Life and Death (The Cycle)

High Priest of Life & Death

Up: Guided transition, ritual closure, accepting endings.

Rev: Avoidance of necessary endings, fear of grief.

Sword of Life & Death

Up: Cutting away what no longer lives, decisive shift.

Rev: Premature endings, destructive choices.

House of Life & Death

Up: Ancestry, legacy, family patterns over generations.

Rev: Inherited burdens, clinging to dead traditions.

Chalice of Life & Death

Up: Emotional renewal, mourning that heals, shared remembrance.

Rev: Bottled grief, emotional stagnation, numbing.

Quad II – Knowledge & Deception (The Veil)

High Priest of the Veil

Up: Wise guardian of secrets, ethical gatekeeping.

Rev: Hoarding knowledge, controlling others through secrecy.

Sword of the Veil

Up: Piercing insight, truth that cuts through illusion.

Rev: Weaponized information, cruel revelations.

House of the Veil

Up: Libraries, circles of trust, safe spaces for learning.

Rev: Echo chambers, conspiracies, insular thinking.

Chalice of the Veil

Up: Inspired ideas, intuitive understanding, “aha” moments.

Rev: Overthinking, anxiety, drowning in information.

Quad III – Justice & Tyranny (The Scales)

High Priest of the Scales

Up: Impartial arbiter, commitment to fairness.

Rev: Biased judge, hidden agendas in arbitration.

Sword of the Scales

Up: Enforcing fair rules, necessary intervention.

Rev: Brutality, excessive force, punishing the wrong target.

House of the Scales

Up: Functional institutions, fair systems, balanced structures.

Rev: Corrupt systems, bureaucracy over justice.

Chalice of the Scales

Up: Compassion in judgment, mercy with boundaries.

Rev: Sentimentality that undermines justice, or cruelty disguised as “tough love.”

Quad IV – Creation & Destruction (The Forge)

High Priest of the Forge

Up: Visionary maker, ethical innovation, sacred craft.

Rev: Creator ego, ignoring consequences of what you build.

Sword of the Forge

Up: Tools as instruments of change, constructive destruction.

Rev: Tools turned to harm, tech as weapon.

House of the Forge

Up: Workshops, guilds, collaborative creation.

Rev: Toxic work cultures, exploitation of creators.

Chalice of the Forge

Up: Joy in making, creative flow, emotional investment in craft.

Rev: Creative block, resentment, burnout around work.

Quad V – War & Conflict (The Clash)

High Priest of the Clash

Up: Strategic mind, sacred warrior ethos, justified defense.

Rev: Ideologue of constant conflict, glorification of war.

Sword of the Clash

Up: Direct confrontation, standing up for yourself.

Rev: Needless fights, picking battles to feed ego.

House of the Clash

Up: Band of comrades, solidarity under pressure.

Rev: Factions, infighting, divided ranks.

Chalice of the Clash

Up: Emotional honesty about conflict, sharing burdens.

Rev: Bottled anger, trauma denied, resentment.

Quad VI – Light & Shadow (The Lumen)

High Priest of the Lumen

Up: Spiritual clarity, perspective grounded in humility.

Rev: Moral absolutism, self-righteousness.

Sword of the Lumen

Up: Exposing what must be seen, cutting through lies.

Rev: Harsh spotlight, shaming, weaponized “truth.”

House of the Lumen

Up: Communities of shared belief that uplift.

Rev: Cult dynamics, groupthink, exclusion.

Chalice of the Lumen

Up: Peace, serenity, quiet faith.

Rev: Empty rituals, spiritual bypassing.

Quad VII – Fate & Change (The Current)

High Priest of the Current

Up: Guide who helps navigate change.

Rev: Guru figure leading astray, fatalistic advice.

Sword of the Current

Up: Cutting ties to embrace a new path.

Rev: Rupture without direction, impulsive pivot.

House of the Current

Up: Families/communities shaped together by shared change.

Rev: People trapped together in unhealthy cycles.

Chalice of the Current

Up: Emotional adaptability, flowing with events.

Rev: Emotional whiplash, instability, mood swings.

Quad VIII – Cycles & Thresholds (The Threshold)

High Priest of the Threshold

Up: Ritual guide at beginnings/ends, healthy transitions.

Rev: Gatekeeping, preventing others from crossing needed thresholds.

Sword of the Threshold

Up: Decisive step through a door, commitment to a new phase.

Rev: Slamming doors, burning bridges, fear-based exits.

House of the Threshold

Up: Transitional spaces, hostels, liminal support structures.

Rev: Nowhere-feeling, rootlessness, never settling.

Chalice of the Threshold

Up: Brave welcome, hospitality, emotional openness to change.

Rev: Withdrawal, fear of new people/places, mistrust.