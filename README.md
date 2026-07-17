# Capstone Project Plan

| Field | Details |
|---------|---------|
| Course | CSC482 Capstone Project II |
| Team | Team 3: Joyce, Sebastian, Alex |
| Project Window | June 15, 2026 through July 24, 2026 |
| Final Presentation/Demo | July 27–28, 2026 |

## Project Goal

Build a web-based form generator for authorized red-team security awareness exercises. Users enter a target profile and scenario context, choose tone and deception intensity, and receive a customized phishing-style training email draft.

The system will also include:

- Anti-spam indicator checks
- Realistic internal-looking training URL generation
- Generated email logs for defensive model training

## Safety and Scope

This project is for authorized internal awareness exercises only.

Generated links should be training/demo links, not credential-harvesting pages. Logs should support defensive analysis and model training, not real-world abuse.

---

# Timeline Overview

| Completion | Dates | Milestone |
|---------|---------|---------|
| ☑ | 6/15–6/19 | Milestone 1: Requirements, Architecture, and Project Setup |
| ☑ | 6/22–6/26 | Milestone 2: Form Design, Data Model, and Safety Controls |
| ☑ | 6/29–7/3 | Milestone 3: Email Generation Engine and Spam Indicator Checks |
| ☐ | 7/6–7/10 | Milestone 4: Link Generator, Logging, and Storage |
| ☐ | 7/13–7/17 | Milestone 5: Full Integration, Testing, and Defensive Dataset Export |
| ☐ | 7/20–7/24 | Milestone 6: Polish, Deployment, Documentation, and Demo Prep |
| ☐ | 7/27–7/28 | Final Presentation and Demonstration |

---

# Milestone 1: Requirements, Architecture, and Project Setup

**Dates:** 6/15–6/19

**Goal:** Define the project clearly, set up the development environment, and create the technical foundation.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☑ | Joyce | Define user requirements and project use cases | Requirements document, user stories, feature list | Requirements reviewed by all 3 members; scope includes generator, tone controls, intensity controls, link generator, and logging |
| ☑ | Sebastian | Design system architecture | Architecture diagram, technology stack decision, data flow diagram | Architecture includes frontend, backend/API, LLM generation layer, URL generator, logging storage, and safety checks |
| ☑ | Alex | Set up repository and development environment | GitHub repository, initial folder structure, README, setup instructions | Repo runs locally; README includes install/run steps; all team members can clone and start the app |

---

# Milestone 2: Form Design, Data Model, and Safety Controls

**Dates:** 6/22–6/26

**Goal:** Build the user input workflow and define the structured data needed for generation and logging.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☑ | Joyce | Design web form fields and user workflow | Form wireframe, field list, validation rules | Form includes target profile, department, scenario context, tone, deception intensity, sender role, and organization details |
| ☑ | Sebastian | Create backend data model | Schema for generation requests, generated emails, generated links, and logs | Schema supports all required form fields; log entries include timestamp, inputs, generated output, spam score, and link metadata |
| ☑ | Alex | Define safety and authorization controls | Safety checklist, warning labels, allowed-use notice, blocked content rules | App displays authorized-use notice; generated content avoids credential collection instructions and real malicious payloads |

---

# Milestone 3: Email Generation Engine and Spam Indicator Checks

**Dates:** 6/29–7/3

**Goal:** Implement the core email draft generator and basic anti-spam analysis.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☑ | Joyce | Create tone and intensity prompt templates | Prompt template set for urgent, professional, and friendly tones | Each tone produces clearly different wording; deception intensity changes subject line, urgency, and call-to-action strength |
| ☑ | Sebastian | Implement backend generation endpoint | API endpoint that accepts form data and returns generated email draft | Endpoint returns subject, sender name, body, call-to-action, and generated link placeholder within 5 seconds locally |
| ☑ | Alex | Build spam indicator checker | Spam keyword/risk scoring function and recommendations | Checker flags common spam indicators such as excessive urgency, suspicious wording, all-caps, too many exclamation points, and risky phrases |

---

# Milestone 4: Link Generator, Logging, and Storage

**Dates:** 7/6–7/10

**Goal:** Add realistic internal-looking training URLs and persistent logs for defensive analysis.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☐ | Joyce | Define internal-looking URL patterns | Spoof training URLs | Make the included training links more believable to increase the likelyhood that they will be clicked. |
| ☑ | Sebastian | Implement link generator | Function/API that generates training URLs based on department and scenario | Generated links contain safe demo domains or local routes; no real credential capture URLs are produced |
| ☑ | Alex | Implement email logging | Log storage, generated email history view, exportable records | Every generation creates a log entry; logs can be viewed and exported as CSV or JSON |

---

# Milestone 5: Full Integration, Testing, and Defensive Dataset Export

**Dates:** 7/13–7/17

**Goal:** Connect all components, test the full workflow, and prepare logs for defensive model training.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☐ | Joyce | Conduct user workflow testing | Test cases, user feedback notes, revised UI checklist | At least 10 test scenarios covering different departments, tones, and intensity levels |
| ☐ | Sebastian | Integrate frontend, backend, generator, link generator, and logging | Working end-to-end application | User can submit form, generate email, receive spam check results, get generated URL, and see log entry |
| ☐ | Alex | Create defensive dataset export | CSV/JSON export format with labeled generated emails | Export includes email body, subject, tone, intensity, scenario, spam indicators, and generated link metadata |

---

# Milestone 6: Polish, Deployment, Documentation, and Demo Prep

**Dates:** 7/20–7/24

**Goal:** Prepare the final working project for demonstration and presentation.

| Completion | Member | Subtask | Outputs | Measurement |
|---------|---------|---------|---------|---------|
| ☐ | Joyce | Polish UI and prepare demo script | Final UI revisions, demo walkthrough script | Demo script covers form input, email generation, spam check, URL generation, and log export |
| ☐ | Sebastian | Prepare deployment or local demo environment | Deployed app or reliable local demo setup | App runs consistently on demo machine; setup time under 5 minutes |
| ☐ | Alex | Write final documentation and presentation content | Final README, project report sections, presentation slides outline | Documentation explains purpose, setup, features, safety limits, architecture, and testing results |

---

# Final Presentation and Demonstration

**Dates:** 7/27–7/28

## Presentation Focus

- Problem statement: why organizations need authorized phishing-awareness training
- Project goal and scope
- System architecture
- Live demonstration of the web form generator
- Demonstration of tone and deception intensity controls
- Demonstration of anti-spam indicator checks
- Demonstration of internal-looking training URL generation
- Demonstration of generated email logs and defensive export
- Lessons learned and future improvements

## Final Demo Success Criteria

| Demo Area | Measurement |
|---------|---------|
| Web form | All required fields accept and validate input |
| Email generation | Produces complete email with subject, sender, body, and call-to-action |
| Tone control | Urgent, professional, and friendly outputs are visibly different |
| Intensity control | Low, medium, and high settings affect urgency and persuasion level |
| Spam checker | Flags common risky indicators and provides a score/recommendations |
| Link generator | Produces realistic but safe internal-looking training URLs |
| Logging | Each generated email is saved with metadata |
| Export | Logs export successfully as CSV or JSON |
| Demo reliability | Full workflow completes without errors during presentation |

---

# Suggested Weekly Meeting Schedule

| Date | Meeting Focus |
|---------|---------|
| 6/15 | Kickoff, assign roles, confirm tools |
| 6/19 | Review requirements and architecture |
| 6/26 | Review form design, data model, and safety rules |
| 7/3 | Review generation engine and spam checker |
| 7/10 | Review link generator and logs |
| 7/17 | End-to-end testing review |
| 7/24 | Final demo rehearsal |
| 7/27–7/28 | Final presentation and demonstration |

---

# More Documentation

- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Project Structure and Safety Notes](docs/PROJECT_STRUCTURE.md)
