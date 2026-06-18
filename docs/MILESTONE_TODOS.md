# Milestone TODOs

These TODOs map directly to the approved capstone plan. Each milestone has work for Joyce, Sebastian, and Alex.

## Milestone 1: Requirements, Architecture, and Project Setup

Dates: 6/15-6/19

- TODO Joyce: Finalize requirements, user stories, and project scope.
  - Output: Requirements document, user stories, feature list.
  - Measurement: At least 8 user stories reviewed by all 3 members.
- TODO Sebastian: Finalize system architecture.
  - Output: Architecture diagram, technology stack decision, data flow diagram.
  - Measurement: Architecture covers frontend, backend, OpenAI layer, URL generator, logging, and safety checks.
- TODO Alex: Maintain repo and setup instructions.
  - Output: Runnable repository, README, environment setup instructions.
  - Measurement: All team members can clone/copy the project and run it locally.

## Milestone 2: Form Design, Data Model, and Safety Controls

Dates: 6/22-6/26

- TODO Joyce: Improve form workflow and field labels.
  - Output: Refined UI fields, validation notes, wireframe updates.
  - Measurement: Form captures profile, department, scenario, tone, intensity, sender role, and organization details.
- TODO Sebastian: Expand request and log data models.
  - Output: Stable schema for generation requests, generated emails, links, and logs.
  - Measurement: Log entries include timestamp, inputs, output, spam score, and link metadata.
- TODO Alex: Strengthen safety controls.
  - Output: Allowed-use notice, blocked-content rules, safety wording.
  - Measurement: App avoids credential collection instructions and malicious payload details.

## Milestone 3: Email Generation Engine and Spam Indicator Checks

Dates: 6/29-7/3

- TODO Joyce: Refine tone and intensity prompt templates.
  - Output: Prompt variants for urgent, professional, and friendly tones.
  - Measurement: Outputs clearly differ by tone and intensity.
- TODO Sebastian: Harden the backend generation endpoint.
  - Output: `/api/generate` endpoint with validation and error handling.
  - Measurement: Endpoint returns subject, sender, body, call-to-action, generated link, and spam score.
- TODO Alex: Expand spam indicator detection.
  - Output: Keyword/risk scoring function and recommendations.
  - Measurement: Checker flags urgency, all-caps, excessive punctuation, risky phrases, and suspicious wording.

## Milestone 4: Link Generator, Logging, and Storage

Dates: 7/6-7/10

- TODO Joyce: Define realistic internal-looking URL patterns.
  - Output: Safe URL pattern list for HR, IT, finance, benefits, and policy scenarios.
  - Measurement: At least 10 training-safe URL formats.
- TODO Sebastian: Improve generated link behavior.
  - Output: Link generator based on department and scenario.
  - Measurement: Links use safe demo domains or local routes only.
- TODO Alex: Improve log viewing and export.
  - Output: Email history view, CSV export, JSON export.
  - Measurement: Every generation creates a viewable and exportable log entry.

## Milestone 5: Full Integration, Testing, and Defensive Dataset Export

Dates: 7/13-7/17

- TODO Joyce: Run user workflow testing.
  - Output: Test scenarios, feedback notes, revised UI checklist.
  - Measurement: At least 10 scenarios across departments, tones, and intensity levels.
- TODO Sebastian: Complete end-to-end integration.
  - Output: Fully connected frontend, backend, generator, link generator, spam checker, and logger.
  - Measurement: Full user workflow completes without manual data edits.
- TODO Alex: Prepare defensive dataset export.
  - Output: CSV/JSON export format with labeled generated emails.
  - Measurement: Export includes body, subject, tone, intensity, scenario, spam indicators, and link metadata.

## Milestone 6: Polish, Deployment, Documentation, and Demo Prep

Dates: 7/20-7/24

- TODO Joyce: Polish UI and prepare demo script.
  - Output: Final UI revisions and walkthrough script.
  - Measurement: Demo script covers form input, generation, spam check, URL generation, and export.
- TODO Sebastian: Prepare deployment or local demo environment.
  - Output: Deployed app or reliable VM/local demo setup.
  - Measurement: App setup time is under 5 minutes on demo machine.
- TODO Alex: Finalize documentation and presentation content.
  - Output: README, report sections, slides outline.
  - Measurement: Documentation explains purpose, setup, features, safety limits, architecture, and testing results.

## Final Presentation and Demonstration

Dates: 7/27-7/28

- TODO Team: Rehearse the complete demo.
- TODO Team: Confirm API key, environment variables, and network access.
- TODO Team: Prepare backup screenshots or recorded demo in case the live network fails.
