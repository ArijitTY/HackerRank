"""
Generate 500 unique Manual Testing questions and write to manual_testing_questions.csv
Distribution: mcq=300 (Easy=90, Medium=120, Hard=90), scenario=200 (Easy=60, Medium=80, Hard=60)
Topics: SDLC, STLC, Test Planning, Test Design Techniques, Defect Management, Test Types,
        Agile Testing, Risk-Based Testing, Test Documentation, Estimation, Test Metrics,
        Exploratory Testing, Usability Testing, Regression Testing, UAT
"""

import pandas as pd
import csv
import random

random.seed(42)


def build_questions():
    questions = []
    qid = 0

    def add(subject, topic, difficulty, qtype, question, a, b, c, d, correct, explanation, code_snippet=""):
        nonlocal qid
        qid += 1
        questions.append({
            "id": qid,
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "type": qtype,
            "question": question,
            "option_a": a,
            "option_b": b,
            "option_c": c,
            "option_d": d,
            "correct_answer": correct,
            "explanation": explanation,
            "code_snippet": code_snippet,
        })

    SUBJECT = "Manual Testing"

    # ===================== SDLC =====================
    # MCQ - Easy (6)
    add(SUBJECT, "SDLC", "Easy", "mcq",
        "What does SDLC stand for?",
        "Software Development Life Cycle", "System Design Life Cycle", "Software Delivery Life Cycle", "System Development Loop Cycle",
        "A", "SDLC stands for Software Development Life Cycle, a structured process for software creation.")
    add(SUBJECT, "SDLC", "Easy", "mcq",
        "Which phase of the SDLC involves gathering business needs from stakeholders?",
        "Requirements Analysis", "Design", "Implementation", "Deployment",
        "A", "Requirements Analysis is the phase where business needs and user expectations are gathered.")
    add(SUBJECT, "SDLC", "Easy", "mcq",
        "In the Waterfall model, which phase comes immediately after Requirements?",
        "Design", "Testing", "Deployment", "Maintenance",
        "A", "In Waterfall, the Design phase follows Requirements before implementation begins.")
    add(SUBJECT, "SDLC", "Easy", "mcq",
        "Which SDLC model follows a strict sequential approach?",
        "Waterfall", "Agile", "Spiral", "RAD",
        "A", "The Waterfall model follows a strict sequential phase-by-phase approach.")
    add(SUBJECT, "SDLC", "Easy", "mcq",
        "Which SDLC phase involves writing the actual code?",
        "Implementation/Coding", "Design", "Testing", "Requirements",
        "A", "The Implementation or Coding phase is where developers write the actual source code.")
    add(SUBJECT, "SDLC", "Easy", "mcq",
        "What is the last phase of the SDLC?",
        "Maintenance", "Testing", "Deployment", "Design",
        "A", "Maintenance is the final ongoing phase where the software is updated and supported.")

    # MCQ - Medium (8)
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "Which SDLC model combines elements of both iterative and sequential approaches?",
        "Spiral Model", "Waterfall Model", "V-Model", "Big Bang Model",
        "A", "The Spiral Model combines iterative development with systematic aspects of the Waterfall model.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "In the V-Model, what corresponds to the Requirements phase on the testing side?",
        "User Acceptance Testing", "Unit Testing", "Integration Testing", "System Testing",
        "A", "In the V-Model, UAT on the right side corresponds to Requirements on the left side.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "Which SDLC model is best suited when requirements are unclear and expected to change?",
        "Agile", "Waterfall", "V-Model", "Big Bang",
        "A", "Agile is designed for projects with evolving requirements through iterative delivery.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "What is the key risk of the Big Bang SDLC model?",
        "High risk due to no formal process", "Too many iterations", "Excessive documentation", "Slow delivery",
        "A", "The Big Bang model has high risk because there is little to no formal planning or process.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "Which SDLC model emphasizes risk analysis at each iteration?",
        "Spiral", "Waterfall", "Agile", "RAD",
        "A", "The Spiral model explicitly includes risk analysis as a key activity in each iteration.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "In RAD (Rapid Application Development), what is the primary focus?",
        "Quick prototyping and user feedback", "Extensive documentation", "Sequential phases", "Risk analysis",
        "A", "RAD focuses on rapid prototyping and iterative user feedback over rigid planning.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "What is a feasibility study in the context of SDLC?",
        "An assessment of whether the project is viable technically and financially", "A testing phase", "A coding review", "A deployment checklist",
        "A", "A feasibility study evaluates technical, economic, and operational viability of the project.")
    add(SUBJECT, "SDLC", "Medium", "mcq",
        "Which document is typically produced at the end of the Requirements phase?",
        "Software Requirements Specification (SRS)", "Test Plan", "Design Document", "User Manual",
        "A", "The SRS document captures all functional and non-functional requirements.")

    # MCQ - Hard (6)
    add(SUBJECT, "SDLC", "Hard", "mcq",
        "In the Spiral model, what are the four quadrants of each iteration?",
        "Planning, Risk Analysis, Engineering, Evaluation", "Requirements, Design, Code, Test", "Initiate, Plan, Execute, Close", "Analyze, Build, Test, Deploy",
        "A", "The Spiral model's four quadrants are Planning, Risk Analysis, Engineering, and Evaluation.")
    add(SUBJECT, "SDLC", "Hard", "mcq",
        "What distinguishes the Incremental model from the Iterative model?",
        "Incremental delivers working pieces; Iterative refines the whole product repeatedly", "They are identical", "Incremental has no testing", "Iterative has no design phase",
        "A", "Incremental adds new functionality in pieces; Iterative refines the entire system each cycle.")
    add(SUBJECT, "SDLC", "Hard", "mcq",
        "Which SDLC model is most appropriate for mission-critical systems requiring rigorous verification?",
        "V-Model", "Agile", "Big Bang", "RAD",
        "A", "The V-Model's emphasis on verification and validation at each stage suits mission-critical systems.")
    add(SUBJECT, "SDLC", "Hard", "mcq",
        "What is a key disadvantage of the Waterfall model for large projects?",
        "Late discovery of defects due to sequential testing", "Too many iterations", "Lack of documentation", "Excessive prototyping",
        "A", "Waterfall's sequential nature means defects are often found late, increasing cost of fixes.")
    add(SUBJECT, "SDLC", "Hard", "mcq",
        "In the context of SDLC, what does the term 'technical debt' refer to?",
        "The cost of rework caused by choosing quick solutions over proper ones", "The budget allocated for technology", "Outstanding vendor payments", "Hardware depreciation",
        "A", "Technical debt is the implied cost of future rework resulting from expedient shortcuts.")
    add(SUBJECT, "SDLC", "Hard", "mcq",
        "Which factor is LEAST relevant when choosing an SDLC model for a project?",
        "The programming language used", "Project size and complexity", "Requirements stability", "Risk tolerance",
        "A", "The programming language is generally not a deciding factor when selecting an SDLC model.")

    # Scenario - Easy (4)
    add(SUBJECT, "SDLC", "Easy", "scenario",
        "A small startup is building a mobile app with rapidly changing requirements. The team wants to deliver features incrementally. Which SDLC model is most appropriate?",
        "Agile", "Waterfall", "V-Model", "Big Bang",
        "A", "Agile supports iterative delivery and adapts well to changing requirements in small teams.")
    add(SUBJECT, "SDLC", "Easy", "scenario",
        "A QA engineer joins a project and sees that testing only happens after all coding is complete. Which SDLC model is the team likely following?",
        "Waterfall", "Agile", "Spiral", "Iterative",
        "A", "In Waterfall, testing is a distinct phase that occurs after implementation is complete.")
    add(SUBJECT, "SDLC", "Easy", "scenario",
        "A project manager wants each phase to be completed and signed off before moving to the next. Which SDLC model aligns with this approach?",
        "Waterfall", "Agile", "RAD", "Prototype",
        "A", "Waterfall requires completion and sign-off of each phase before proceeding to the next.")
    add(SUBJECT, "SDLC", "Easy", "scenario",
        "A team is building a simple internal tool with well-defined requirements that are unlikely to change. Which SDLC model would work well?",
        "Waterfall", "Spiral", "Agile", "RAD",
        "A", "Waterfall works well for projects with stable, well-defined requirements.")

    # Scenario - Medium (5)
    add(SUBJECT, "SDLC", "Medium", "scenario",
        "A defense contractor needs to build a flight control system where every requirement must be verified and validated rigorously. Which SDLC model should they use?",
        "V-Model", "Agile", "Big Bang", "RAD",
        "A", "The V-Model's rigorous verification and validation at each level suits safety-critical systems.")
    add(SUBJECT, "SDLC", "Medium", "scenario",
        "A project has high technical risk and the team wants to evaluate risk at each iteration before proceeding. Which model fits best?",
        "Spiral", "Waterfall", "Big Bang", "Incremental",
        "A", "The Spiral model includes explicit risk analysis in every iteration.")
    add(SUBJECT, "SDLC", "Medium", "scenario",
        "A client wants to see a working prototype early and provide feedback before final development. Which approach is most suitable?",
        "Prototyping / RAD", "Waterfall", "V-Model", "Big Bang",
        "A", "Prototyping and RAD focus on building early prototypes for client feedback.")
    add(SUBJECT, "SDLC", "Medium", "scenario",
        "During a Waterfall project, a major requirement change is requested after the design phase is complete. What is the primary concern?",
        "High cost and effort to accommodate changes in earlier completed phases", "Testing will be faster", "No impact since Waterfall is flexible", "Deployment will be skipped",
        "A", "In Waterfall, going back to a completed phase for changes is costly and disruptive.")
    add(SUBJECT, "SDLC", "Medium", "scenario",
        "A team of 50 developers is working on an enterprise ERP system. Requirements are well-documented but the system has multiple integrated modules. Which approach helps manage complexity?",
        "Incremental model delivering module by module", "Big Bang", "Building everything at once with no process", "Skipping design and going to coding",
        "A", "The Incremental model helps manage complexity by delivering functional modules one at a time.")
    add(SUBJECT, "SDLC", "Medium", "scenario",
        "A software team is working on a product where the client wants to see partial functionality demonstrated every two weeks. The client also wants the flexibility to change priorities between demos. Which SDLC approach supports this?",
        "Agile (Scrum with bi-weekly sprints)", "Waterfall with monthly milestones", "Big Bang", "V-Model",
        "A", "Agile Scrum with two-week sprints delivers working increments and allows re-prioritization between sprints.")

    # Scenario - Hard (4)
    add(SUBJECT, "SDLC", "Hard", "scenario",
        "A healthcare company is developing a patient records system. Regulations require full traceability from requirements to test cases. The QA lead must choose a model that enforces this traceability. What should they recommend?",
        "V-Model", "Agile", "Big Bang", "RAD",
        "A", "The V-Model enforces direct traceability between each development phase and its corresponding testing level.")
    add(SUBJECT, "SDLC", "Hard", "scenario",
        "A project initially adopted Waterfall but midway, stakeholders demand frequent demos and the ability to re-prioritize features. The PM wants to transition. What is the biggest challenge of switching from Waterfall to Agile mid-project?",
        "Restructuring completed work into iterative increments and changing team mindset", "Having too many test cases", "Losing all source code", "Eliminating all documentation",
        "A", "Transitioning mid-project requires restructuring work, adapting processes, and shifting team culture.")
    add(SUBJECT, "SDLC", "Hard", "scenario",
        "An organization uses Spiral for a complex banking system. During the third iteration, the risk analysis reveals that a critical third-party API is unreliable. What should the team do according to the Spiral model?",
        "Develop a mitigation plan or alternative before proceeding to engineering", "Ignore the risk and continue", "Cancel the project", "Switch to Waterfall",
        "A", "The Spiral model mandates addressing identified risks with mitigation strategies before proceeding.")
    add(SUBJECT, "SDLC", "Hard", "scenario",
        "A large government project requires extensive documentation at every phase and strict audit trails. The team considered Agile but auditors require phase-gate reviews. Which hybrid approach would balance agility with compliance?",
        "Agile with phase-gate checkpoints and mandatory documentation at milestones", "Pure Agile with no documentation", "Big Bang with audits at the end", "Waterfall with no testing",
        "A", "A hybrid approach adds phase-gate reviews and documentation to Agile for regulatory compliance.")

    # ===================== STLC =====================
    # MCQ - Easy (6)
    add(SUBJECT, "STLC", "Easy", "mcq",
        "What does STLC stand for?",
        "Software Testing Life Cycle", "System Testing Loop Cycle", "Standard Test Level Criteria", "Software Test Logistics Control",
        "A", "STLC stands for Software Testing Life Cycle, the sequence of testing activities.")
    add(SUBJECT, "STLC", "Easy", "mcq",
        "Which is the first phase of the STLC?",
        "Requirement Analysis", "Test Planning", "Test Execution", "Test Closure",
        "A", "Requirement Analysis is the first phase where testers study requirements for testability.")
    add(SUBJECT, "STLC", "Easy", "mcq",
        "In which STLC phase are test cases written?",
        "Test Case Development", "Test Planning", "Test Execution", "Requirement Analysis",
        "A", "Test Case Development is the phase where detailed test cases and test data are created.")
    add(SUBJECT, "STLC", "Easy", "mcq",
        "What is the purpose of the Test Closure phase?",
        "To evaluate test completion criteria and document lessons learned", "To write new test cases", "To deploy the software", "To gather requirements",
        "A", "Test Closure evaluates exit criteria, archives artifacts, and captures lessons learned.")
    add(SUBJECT, "STLC", "Easy", "mcq",
        "During which STLC phase is the test environment set up?",
        "Test Environment Setup", "Test Planning", "Test Closure", "Requirement Analysis",
        "A", "Test Environment Setup ensures hardware, software, and network configurations are ready for testing.")
    add(SUBJECT, "STLC", "Easy", "mcq",
        "What is an entry criterion in the STLC?",
        "A condition that must be met before starting a test phase", "A type of test case", "A defect severity level", "A test report format",
        "A", "Entry criteria are prerequisites that must be satisfied before a testing phase can begin.")

    # MCQ - Medium (8)
    add(SUBJECT, "STLC", "Medium", "mcq",
        "What is the difference between entry criteria and exit criteria in STLC?",
        "Entry criteria define when to start; exit criteria define when to stop a phase", "They are the same thing", "Entry criteria apply only to coding", "Exit criteria apply only to deployment",
        "A", "Entry criteria gate the start of a phase; exit criteria determine when a phase is complete.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "Which document is the primary output of the Test Planning phase?",
        "Test Plan", "Test Case Document", "Defect Report", "Requirements Specification",
        "A", "The Test Plan document outlines scope, approach, resources, schedule, and deliverables.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "What is a Requirement Traceability Matrix (RTM)?",
        "A document mapping requirements to corresponding test cases", "A risk assessment tool", "A defect tracking log", "A project schedule",
        "A", "An RTM ensures every requirement has associated test cases for complete coverage.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "What is the purpose of test data preparation in the STLC?",
        "To create realistic data sets needed to execute test cases", "To write the test plan", "To design the architecture", "To deploy the application",
        "A", "Test data preparation ensures appropriate data exists for meaningful test execution.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "Which STLC phase involves mapping defects to test cases and analyzing defect patterns?",
        "Test Closure", "Test Planning", "Requirement Analysis", "Test Environment Setup",
        "A", "Test Closure includes defect analysis, metrics collection, and trend evaluation.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "What role does a Test Lead typically play during the Test Planning phase?",
        "Defining test strategy, effort estimation, and resource allocation", "Writing all test cases", "Fixing defects", "Deploying builds",
        "A", "The Test Lead defines strategy, estimates effort, allocates resources, and creates the test plan.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "What is a test suite?",
        "A collection of test cases grouped for a specific purpose", "A single test case", "A defect report", "A test environment",
        "A", "A test suite is a logical grouping of related test cases for organized execution.")
    add(SUBJECT, "STLC", "Medium", "mcq",
        "During Requirement Analysis, what does a tester look for primarily?",
        "Ambiguities, inconsistencies, and testability of requirements", "Code quality", "Server capacity", "User interface design",
        "A", "Testers analyze requirements for clarity, completeness, consistency, and testability.")

    # MCQ - Hard (6)
    add(SUBJECT, "STLC", "Hard", "mcq",
        "If the exit criteria for the System Testing phase have not been met but the project deadline is imminent, what should the QA team recommend?",
        "Document the unmet criteria, assess risk, and seek stakeholder decision on conditional release", "Release without testing", "Extend deadline indefinitely", "Skip the remaining tests silently",
        "A", "The team should transparently communicate risks and get stakeholder sign-off for conditional release.")
    add(SUBJECT, "STLC", "Hard", "mcq",
        "How does the STLC differ from the SDLC?",
        "STLC focuses specifically on testing activities within the broader SDLC", "They are identical", "STLC replaces SDLC", "SDLC has no testing component",
        "A", "STLC is a subset of SDLC that details the specific phases and activities of testing.")
    add(SUBJECT, "STLC", "Hard", "mcq",
        "What is the impact of poor Requirement Analysis on subsequent STLC phases?",
        "Leads to incomplete test coverage, missed defects, and rework", "No impact", "Speeds up testing", "Eliminates the need for test design",
        "A", "Poor requirement analysis cascades into gaps in test design, missed scenarios, and costly rework.")
    add(SUBJECT, "STLC", "Hard", "mcq",
        "In a mature STLC process, how are test environment issues typically managed?",
        "Through a dedicated environment management process with configuration tracking", "By ignoring them", "By testing in production", "By skipping environment-dependent tests",
        "A", "Mature processes include formal environment management with configuration control and issue tracking.")
    add(SUBJECT, "STLC", "Hard", "mcq",
        "What metrics are typically collected during Test Closure?",
        "Defect density, test execution rates, requirement coverage, and defect leakage", "Only pass/fail counts", "Lines of code written", "Number of meetings held",
        "A", "Test Closure captures comprehensive metrics including density, coverage, leakage, and execution rates.")
    add(SUBJECT, "STLC", "Hard", "mcq",
        "What is the significance of bidirectional traceability in the RTM?",
        "It ensures every requirement maps to tests and every test maps back to requirements", "It tracks code changes only", "It monitors server uptime", "It measures team velocity",
        "A", "Bidirectional traceability confirms completeness: requirements to tests and tests back to requirements.")

    # Scenario - Easy (4)
    add(SUBJECT, "STLC", "Easy", "scenario",
        "A new tester is asked to begin writing test cases but no requirements document has been provided yet. What STLC principle is being violated?",
        "Entry criteria for Test Case Development phase are not met", "Exit criteria for Test Closure", "Test execution is incomplete", "Defect reporting is wrong",
        "A", "Test Case Development requires approved requirements as an entry criterion.")
    add(SUBJECT, "STLC", "Easy", "scenario",
        "A QA team finishes executing all planned test cases and wants to formally close the testing phase. What should they do first?",
        "Verify that all exit criteria have been met", "Start writing new test cases", "Deploy to production", "Delete all test data",
        "A", "Before closing, the team must verify all exit criteria such as pass rates and open defect thresholds.")
    add(SUBJECT, "STLC", "Easy", "scenario",
        "A tester discovers that the test environment does not match the production configuration. Which STLC phase should have caught this?",
        "Test Environment Setup", "Test Planning", "Test Closure", "Requirement Analysis",
        "A", "Test Environment Setup is responsible for ensuring the environment mirrors production configurations.")
    add(SUBJECT, "STLC", "Easy", "scenario",
        "A team is about to start testing but realizes there is no test plan. Which STLC phase was skipped?",
        "Test Planning", "Test Execution", "Test Closure", "Test Case Development",
        "A", "Test Planning produces the test plan which guides all subsequent testing activities.")

    # Scenario - Medium (5)
    add(SUBJECT, "STLC", "Medium", "scenario",
        "During Test Execution, a tester finds that 30% of test cases cannot be run because test data is missing. Which earlier phase had a gap?",
        "Test Case Development (test data preparation)", "Test Closure", "Deployment", "Maintenance",
        "A", "Test data should be prepared during Test Case Development to ensure all tests can be executed.")
    add(SUBJECT, "STLC", "Medium", "scenario",
        "A QA manager notices that the same types of defects keep appearing in every release. Which Test Closure activity could help address this?",
        "Root cause analysis and lessons learned documentation", "Writing more test cases", "Hiring more testers", "Skipping regression testing",
        "A", "Root cause analysis during Test Closure identifies recurring issues and drives process improvement.")
    add(SUBJECT, "STLC", "Medium", "scenario",
        "The development team deploys a new build to the test environment without notifying QA. Test results become unreliable. What process improvement is needed?",
        "Formal build management and notification process for test environment deployments", "Stop all testing", "Test in production", "Remove the test environment",
        "A", "A formal build management process with QA notification ensures environment stability during testing.")
    add(SUBJECT, "STLC", "Medium", "scenario",
        "A tester creates test cases directly from user stories without reviewing detailed requirements. Some edge cases are missed. What should have been done?",
        "Thorough Requirement Analysis phase to identify all scenarios including edge cases", "Skip test case writing", "Test only happy paths", "Wait for production defects",
        "A", "Proper Requirement Analysis identifies edge cases, boundary conditions, and negative scenarios.")
    add(SUBJECT, "STLC", "Medium", "scenario",
        "The test team has completed testing but stakeholders want a summary of quality metrics. Which STLC phase addresses this need?",
        "Test Closure", "Test Planning", "Test Environment Setup", "Requirement Analysis",
        "A", "Test Closure includes preparation of test summary reports with quality metrics for stakeholders.")

    # Scenario - Hard (4)
    add(SUBJECT, "STLC", "Hard", "scenario",
        "A financial application has 2000 test cases. After execution, 95% pass but the 5% failures include critical payment processing bugs. The PM wants to release. As QA lead, what do you recommend?",
        "Block release because critical defects in payment processing pose unacceptable risk regardless of pass rate", "Release since 95% passed", "Run only the failed tests again", "Remove failing test cases",
        "A", "Pass rate alone is insufficient; critical defects in core functionality must block release.")
    add(SUBJECT, "STLC", "Hard", "scenario",
        "During the STLC of a complex system, the QA team discovers that requirements are ambiguous and open to interpretation. Multiple testers interpret the same requirement differently. What is the best corrective action?",
        "Conduct a requirement review with stakeholders to clarify ambiguities and update the SRS", "Each tester uses their own interpretation", "Skip those requirements", "Test only what is clear",
        "A", "Ambiguous requirements must be clarified with stakeholders to ensure consistent test design.")
    add(SUBJECT, "STLC", "Hard", "scenario",
        "An organization wants to improve STLC maturity from ad-hoc testing to a defined process. Which steps are most critical?",
        "Establishing entry/exit criteria, formal test planning, RTM, and metrics collection", "Buying more tools", "Hiring contractors", "Reducing testing time",
        "A", "Process maturity requires formal criteria, planning, traceability, and measurement.")
    add(SUBJECT, "STLC", "Hard", "scenario",
        "A QA team is testing a microservices architecture. Each service has independent release cycles. How should the STLC be adapted?",
        "Implement service-level STLC with integration testing gates between services", "Test only at the UI level", "Skip testing individual services", "Wait until all services are complete",
        "A", "Microservices need per-service STLC with integration testing gates to manage independent releases.")

    # ===================== Test Planning =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Test Planning", "Easy", "mcq",
        "What is a test plan?",
        "A document describing the scope, approach, resources, and schedule of testing activities", "A list of defects", "Source code documentation", "A deployment guide",
        "A", "A test plan is a comprehensive document that outlines the testing strategy and logistics.")
    add(SUBJECT, "Test Planning", "Easy", "mcq",
        "Who is typically responsible for creating the test plan?",
        "Test Lead or Test Manager", "Developer", "Business Analyst", "Database Administrator",
        "A", "The Test Lead or Test Manager typically authors and owns the test plan.")
    add(SUBJECT, "Test Planning", "Easy", "mcq",
        "Which of the following is NOT a typical section in a test plan?",
        "Source code listing", "Test scope", "Test schedule", "Risk assessment",
        "A", "Source code listings are not part of a test plan; they belong in development documentation.")
    add(SUBJECT, "Test Planning", "Easy", "mcq",
        "What does 'test scope' define in a test plan?",
        "Features and functionalities to be tested and not tested", "The programming language used", "Server hardware specs", "Employee salaries",
        "A", "Test scope clearly defines what is in scope and out of scope for testing.")
    add(SUBJECT, "Test Planning", "Easy", "mcq",
        "What is an exit criterion in test planning?",
        "A condition that must be met for testing to be considered complete", "A method of writing code", "A type of user interface", "A database query",
        "A", "Exit criteria are measurable conditions that signal testing completion for a phase.")
    add(SUBJECT, "Test Planning", "Easy", "mcq",
        "What is the purpose of identifying risks in the test plan?",
        "To prepare mitigation strategies for potential issues", "To eliminate all defects", "To increase project cost", "To reduce team size",
        "A", "Risk identification allows the team to plan mitigations and contingencies proactively.")

    # MCQ - Medium (8)
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "What is the difference between a test plan and a test strategy?",
        "Test plan is project-specific; test strategy is organization-level", "They are identical", "Test strategy is written by developers", "Test plan covers only automation",
        "A", "A test strategy sets organizational standards; a test plan applies those to a specific project.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "Which section of the test plan defines the testing tools to be used?",
        "Test Environment and Tools", "Test Scope", "Test Schedule", "Defect Management",
        "A", "The Test Environment and Tools section specifies the tools, hardware, and software for testing.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "What factors should be considered when estimating test effort?",
        "Complexity, number of requirements, team experience, and risk level", "Only team size", "Only the deadline", "Only the number of screens",
        "A", "Test effort estimation considers complexity, requirements count, team skill, and project risk.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "What is a test suspension criterion?",
        "A condition under which testing is temporarily halted", "A type of test case", "A defect severity", "A code review checklist",
        "A", "Suspension criteria define conditions like critical environment failures that pause testing.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "Why is it important to define roles and responsibilities in the test plan?",
        "To ensure accountability and avoid gaps or overlaps in testing activities", "To increase paperwork", "To satisfy auditors only", "To reduce the number of testers",
        "A", "Clear roles prevent duplication of effort and ensure all activities have owners.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "What is a test deliverable?",
        "Any artifact produced during the testing process", "Only the final test report", "The source code", "The deployment package",
        "A", "Test deliverables include test plans, test cases, defect reports, test data, and test summary reports.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "What is the purpose of a test schedule in the test plan?",
        "To define timelines and milestones for testing activities", "To track developer hours", "To schedule meetings only", "To plan vacations",
        "A", "The test schedule establishes when testing activities start, end, and reach key milestones.")
    add(SUBJECT, "Test Planning", "Medium", "mcq",
        "How should the test plan handle dependencies on external systems?",
        "Document dependencies and define contingency plans if external systems are unavailable", "Ignore external systems", "Test only internal components", "Wait indefinitely for external systems",
        "A", "External dependencies should be documented with contingency plans for unavailability scenarios.")

    # MCQ - Hard (6)
    add(SUBJECT, "Test Planning", "Hard", "mcq",
        "How does a risk-based approach influence test planning?",
        "Higher-risk areas receive more testing effort and priority", "All areas get equal effort", "Low-risk areas are tested first", "Risk is not relevant to test planning",
        "A", "Risk-based test planning allocates more resources and priority to high-risk areas.")
    add(SUBJECT, "Test Planning", "Hard", "mcq",
        "What is the role of the IEEE 829 standard in test planning?",
        "It provides a standard format for test documentation including test plans", "It defines coding standards", "It specifies hardware requirements", "It outlines deployment procedures",
        "A", "IEEE 829 is a standard for test documentation formats including test plans and test reports.")
    add(SUBJECT, "Test Planning", "Hard", "mcq",
        "When test planning for a system with regulatory compliance requirements, what additional elements must be included?",
        "Compliance verification steps, audit trails, and traceability to regulatory standards", "Only functional test cases", "No additional elements", "Performance benchmarks only",
        "A", "Regulated systems require compliance verification, audit trails, and regulatory traceability.")
    add(SUBJECT, "Test Planning", "Hard", "mcq",
        "How should a test plan address the challenge of testing in a continuous delivery pipeline?",
        "Define automated test gates, fast feedback loops, and shift-left testing practices", "Delay all testing to the end", "Test only manually", "Eliminate test planning entirely",
        "A", "Continuous delivery requires automated gates, fast feedback, and testing integrated early in the pipeline.")
    add(SUBJECT, "Test Planning", "Hard", "mcq",
        "What is the impact of incomplete test planning on project quality?",
        "Increased defect leakage, missed coverage, and reactive rather than proactive testing", "No impact", "Better code quality", "Faster delivery",
        "A", "Incomplete planning leads to gaps in coverage, more escaped defects, and reactive firefighting.")
    add(SUBJECT, "Test Planning", "Hard", "mcq",
        "In a multi-team enterprise project, how should test plans be coordinated?",
        "Through a master test plan that integrates individual team test plans with shared criteria", "Each team works independently with no coordination", "Only one team tests", "Testing is optional",
        "A", "A master test plan coordinates multiple team plans ensuring consistent criteria and integration testing.")

    # Scenario - Easy (4)
    add(SUBJECT, "Test Planning", "Easy", "scenario",
        "A QA engineer is asked to test a new feature but has no information about what to test or how much time is available. What artifact is missing?",
        "Test Plan", "Source Code", "Deployment Script", "Marketing Brief",
        "A", "A test plan provides scope, schedule, and approach information needed to begin testing.")
    add(SUBJECT, "Test Planning", "Easy", "scenario",
        "A project has three testers but no one knows who is testing which module. What section of the test plan addresses this?",
        "Roles and Responsibilities", "Test Scope", "Risk Assessment", "Test Environment",
        "A", "The Roles and Responsibilities section assigns specific modules and tasks to team members.")
    add(SUBJECT, "Test Planning", "Easy", "scenario",
        "A team finishes testing but realizes they never defined when testing should be considered complete. What was missing from the test plan?",
        "Exit Criteria", "Entry Criteria", "Test Data", "Source Code",
        "A", "Exit criteria define measurable conditions for declaring testing complete.")
    add(SUBJECT, "Test Planning", "Easy", "scenario",
        "A new project is starting, and the QA lead needs to determine which testing tools to use. Where should this decision be documented?",
        "Test Plan (Tools section)", "User Manual", "Marketing Document", "HR Policy",
        "A", "The test plan's tools section documents the testing tools selected for the project.")

    # Scenario - Medium (5)
    add(SUBJECT, "Test Planning", "Medium", "scenario",
        "A QA lead discovers that testing always runs over schedule. The team often underestimates effort. What test planning improvement would help?",
        "Use historical data and formal estimation techniques like Work Breakdown Structure", "Reduce test cases", "Skip planning", "Add more testers at the last minute",
        "A", "Using historical data and formal estimation techniques improves schedule accuracy.")
    add(SUBJECT, "Test Planning", "Medium", "scenario",
        "During test planning, a tester identifies that a third-party payment gateway may be unavailable during testing. How should the test plan address this?",
        "Document the risk and plan to use a mock or simulator as a contingency", "Ignore the risk", "Cancel testing of payment features", "Wait for the gateway to be available",
        "A", "Documenting the risk with a contingency like a mock service ensures testing can proceed.")
    add(SUBJECT, "Test Planning", "Medium", "scenario",
        "A test plan was created at the project start but requirements changed significantly. The test plan was never updated. What is the likely consequence?",
        "Test cases may not cover new requirements, leading to defect leakage", "No consequence", "Better test coverage", "Faster testing",
        "A", "An outdated test plan leads to misaligned testing effort and missed coverage of new requirements.")
    add(SUBJECT, "Test Planning", "Medium", "scenario",
        "A project requires testing across three browsers and two mobile platforms. Where in the test plan should this be specified?",
        "Test Environment section detailing browser and platform combinations", "Risk section", "Schedule section", "Budget section",
        "A", "The Test Environment section specifies all platforms, browsers, and configurations for testing.")
    add(SUBJECT, "Test Planning", "Medium", "scenario",
        "Stakeholders want to know the testing progress weekly. What should the test plan define to support this?",
        "Reporting mechanisms including frequency, format, and distribution list", "Nothing; reporting is not part of the test plan", "Only email updates", "Only verbal updates",
        "A", "The test plan should specify reporting mechanisms including schedule, format, and audience.")

    # Scenario - Hard (4)
    add(SUBJECT, "Test Planning", "Hard", "scenario",
        "A QA manager is planning testing for a microservices-based e-commerce platform with 20 services, each owned by a different team. How should the test plan be structured?",
        "Create a master test plan with service-level test plans and integration test strategy", "One simple test plan for all services", "Let each team test independently", "Skip integration testing",
        "A", "A hierarchical approach with master and service-level plans ensures both unit and integration coverage.")
    add(SUBJECT, "Test Planning", "Hard", "scenario",
        "A test plan for a banking application must meet SOX compliance requirements. What additional considerations apply?",
        "Include audit trail verification, access control testing, and data integrity validation", "Standard functional testing only", "Performance testing only", "No additional considerations",
        "A", "SOX compliance requires testing of audit trails, access controls, and data integrity.")
    add(SUBJECT, "Test Planning", "Hard", "scenario",
        "During test planning, the team realizes they have expertise gaps in security testing. The timeline is fixed and hiring is not possible. What should the test plan recommend?",
        "Outsource security testing to a specialized firm and include it as a dependency in the plan", "Skip security testing", "Have functional testers do security testing without training", "Delay the project",
        "A", "Outsourcing to specialists addresses the gap; documenting it as a dependency manages expectations.")
    add(SUBJECT, "Test Planning", "Hard", "scenario",
        "A product has both a web app and a mobile app sharing the same backend. The test plan must cover both. How should the test architecture be defined?",
        "Shared backend test plan with separate frontend plans for web and mobile, plus integration testing", "Test only the web app", "Test only the mobile app", "Test backend only",
        "A", "A layered test architecture covers shared backend, separate frontends, and integration points.")

    # ===================== Test Design Techniques =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Test Design Techniques", "Easy", "mcq",
        "What is Equivalence Partitioning?",
        "Dividing input data into groups where all values in a group are expected to behave the same", "Random testing", "Testing all possible inputs", "Testing only boundaries",
        "A", "Equivalence Partitioning groups inputs into classes that should produce equivalent behavior.")
    add(SUBJECT, "Test Design Techniques", "Easy", "mcq",
        "What is Boundary Value Analysis (BVA)?",
        "Testing at the edges of equivalence partitions", "Testing random values", "Testing only the middle values", "Skipping edge cases",
        "A", "BVA focuses on values at the boundaries of input ranges where defects are most likely.")
    add(SUBJECT, "Test Design Techniques", "Easy", "mcq",
        "Which test design technique uses a decision table?",
        "Decision Table Testing", "Random Testing", "Exploratory Testing", "Ad-hoc Testing",
        "A", "Decision Table Testing uses tables to capture combinations of conditions and their actions.")
    add(SUBJECT, "Test Design Techniques", "Easy", "mcq",
        "What is a test case?",
        "A set of conditions and expected results used to verify a specific feature", "A defect report", "A test plan", "A code module",
        "A", "A test case defines preconditions, steps, input data, and expected results for verification.")
    add(SUBJECT, "Test Design Techniques", "Easy", "mcq",
        "What does black-box testing focus on?",
        "Testing functionality without knowledge of internal code structure", "Testing source code", "Testing database schemas", "Testing hardware",
        "A", "Black-box testing evaluates functionality based on requirements without examining internal code.")
    add(SUBJECT, "Test Design Techniques", "Easy", "mcq",
        "What does white-box testing focus on?",
        "Testing internal code structure and logic", "Testing only the UI", "Testing without any documentation", "Testing hardware components",
        "A", "White-box testing examines internal code paths, logic, branches, and data flow.")

    # MCQ - Medium (8)
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "What is State Transition Testing?",
        "Testing based on changes in state of the system triggered by events", "Testing only the initial state", "Random input testing", "Performance testing",
        "A", "State Transition Testing verifies that the system transitions correctly between states based on events.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "How does pairwise testing reduce the number of test cases?",
        "By ensuring every pair of parameter values is tested at least once", "By testing all combinations", "By testing only one value per parameter", "By random selection",
        "A", "Pairwise testing covers all pairs of parameter combinations, dramatically reducing test count.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "What is the purpose of error guessing as a test design technique?",
        "To use tester experience to anticipate likely defects", "To replace systematic techniques", "To test only happy paths", "To skip difficult scenarios",
        "A", "Error guessing leverages a tester's experience to predict where defects are likely to occur.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "In decision table testing, what does each column represent?",
        "A unique combination of conditions and corresponding actions", "A single test step", "A defect", "A requirement",
        "A", "Each column in a decision table represents a rule: a combination of conditions and resulting actions.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "What is cause-effect graphing?",
        "A technique that maps causes (inputs) to effects (outputs) to derive test cases", "A debugging tool", "A code review method", "A project management technique",
        "A", "Cause-effect graphing creates a visual model of input-output relationships to generate test cases.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "When is Equivalence Partitioning most useful?",
        "When there are large input ranges that can be logically divided into groups", "When there is only one input", "When testing hardware", "When no requirements exist",
        "A", "EP is most useful for reducing test cases when input domains are large but can be grouped logically.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "What is the advantage of using a classification tree for test design?",
        "It provides a visual hierarchical representation of test input combinations", "It is faster than all other methods", "It requires no domain knowledge", "It eliminates all defects",
        "A", "Classification trees visually organize input parameters hierarchically to derive systematic combinations.")
    add(SUBJECT, "Test Design Techniques", "Medium", "mcq",
        "What is the difference between positive and negative testing?",
        "Positive tests verify correct behavior with valid inputs; negative tests verify handling of invalid inputs", "They are the same", "Negative tests are run only in production", "Positive tests use no test data",
        "A", "Positive testing validates expected behavior; negative testing validates error handling and robustness.")

    # MCQ - Hard (6)
    add(SUBJECT, "Test Design Techniques", "Hard", "mcq",
        "What is Modified Condition/Decision Coverage (MC/DC)?",
        "A coverage criterion requiring each condition to independently affect the decision outcome", "Testing all inputs", "Testing only boundaries", "Random testing",
        "A", "MC/DC ensures each condition in a decision independently affects the outcome, used in safety-critical systems.")
    add(SUBJECT, "Test Design Techniques", "Hard", "mcq",
        "How does orthogonal array testing optimize test case design?",
        "By selecting a subset of combinations that provides maximum coverage with minimum tests", "By testing all possible combinations", "By testing only one input at a time", "By ignoring interactions",
        "A", "Orthogonal arrays provide balanced coverage of parameter interactions with a minimal set of tests.")
    add(SUBJECT, "Test Design Techniques", "Hard", "mcq",
        "What is the key limitation of Equivalence Partitioning as a standalone technique?",
        "It may miss defects at partition boundaries that BVA would catch", "It generates too many test cases", "It only works for numeric inputs", "It requires source code access",
        "A", "EP alone may miss boundary-specific defects, which is why it is often combined with BVA.")
    add(SUBJECT, "Test Design Techniques", "Hard", "mcq",
        "In state transition testing, what is an invalid state transition?",
        "A transition that should not occur according to the specification but might due to a defect", "Any normal transition", "The initial state", "The final state",
        "A", "Invalid state transitions are those not permitted by the specification that should be tested as negative cases.")
    add(SUBJECT, "Test Design Techniques", "Hard", "mcq",
        "How does combinatorial explosion affect decision table testing?",
        "The number of columns grows exponentially with the number of conditions, making full coverage impractical", "It has no effect", "It reduces test cases", "It speeds up testing",
        "A", "Each additional condition doubles the columns, so techniques like collapsed tables are needed for many conditions.")
    add(SUBJECT, "Test Design Techniques", "Hard", "mcq",
        "What is the relationship between code coverage criteria in terms of strength: Statement, Branch, and MC/DC?",
        "MC/DC subsumes Branch which subsumes Statement coverage", "Statement is strongest", "They are all equal", "Branch subsumes MC/DC",
        "A", "MC/DC is the strongest, subsuming Branch coverage, which in turn subsumes Statement coverage.")

    # Scenario - Easy (4)
    add(SUBJECT, "Test Design Techniques", "Easy", "scenario",
        "A form accepts ages between 18 and 60. A tester needs to design test cases efficiently. Which technique should they use first?",
        "Equivalence Partitioning combined with Boundary Value Analysis", "Random Testing", "Ad-hoc Testing", "Only testing age 30",
        "A", "EP divides the range into valid/invalid partitions, and BVA targets the boundaries 17, 18, 60, 61.")
    add(SUBJECT, "Test Design Techniques", "Easy", "scenario",
        "A login page requires a username and password. The tester wants to verify that invalid credentials show an error message. What type of testing is this?",
        "Negative Testing", "Performance Testing", "Security Testing", "Load Testing",
        "A", "Negative testing verifies the system handles invalid inputs correctly, such as wrong credentials.")
    add(SUBJECT, "Test Design Techniques", "Easy", "scenario",
        "A tester needs to verify a discount calculation: 10% for orders over $100, 20% for orders over $500. Which technique is best suited?",
        "Decision Table Testing", "Random Testing", "Exploratory Testing", "Load Testing",
        "A", "Decision tables effectively capture condition-action rules like discount tiers.")
    add(SUBJECT, "Test Design Techniques", "Easy", "scenario",
        "A QA engineer is told to test a text field that accepts 1-50 characters. Which boundary values should they test?",
        "0, 1, 50, and 51 characters", "Only 25 characters", "Only empty input", "Only 50 characters",
        "A", "BVA requires testing at boundaries: just below minimum (0), minimum (1), maximum (50), just above (51).")

    # Scenario - Medium (6)
    add(SUBJECT, "Test Design Techniques", "Medium", "scenario",
        "An e-commerce site has a shipping calculator with 4 inputs each having 3 possible values. Testing all combinations would require 81 test cases. The team has time for only 15. What technique helps?",
        "Pairwise Testing", "Testing all 81 combinations", "Testing only one combination", "Skipping testing entirely",
        "A", "Pairwise testing covers all pairs of input values, reducing 81 combinations to approximately 9-15 tests.")
    add(SUBJECT, "Test Design Techniques", "Medium", "scenario",
        "A traffic light system cycles through Red, Green, and Yellow states. A tester needs to verify all valid transitions and that invalid transitions are blocked. Which technique applies?",
        "State Transition Testing", "Equivalence Partitioning", "Boundary Value Analysis", "Decision Table Testing",
        "A", "State Transition Testing verifies valid state changes and ensures invalid transitions are rejected.")
    add(SUBJECT, "Test Design Techniques", "Medium", "scenario",
        "A test team finds many defects clustered in the payment module despite using EP and BVA. A senior tester suggests adding another technique. What would complement EP and BVA?",
        "Error Guessing based on common payment processing pitfalls", "Reducing test cases", "Skipping payment module", "Testing only the UI",
        "A", "Error Guessing uses experience to target common payment defects not caught by systematic techniques alone.")
    add(SUBJECT, "Test Design Techniques", "Medium", "scenario",
        "An insurance application has a complex premium calculation based on 5 conditions: age range, gender, smoker status, policy type, and coverage amount. The QA lead needs an organized way to identify all rules. What technique is best?",
        "Decision Table Testing", "Random Testing", "Ad-hoc Testing", "Only EP",
        "A", "Decision tables systematically capture all combinations of conditions for complex business rules.")
    add(SUBJECT, "Test Design Techniques", "Medium", "scenario",
        "A tester is designing test cases for a function that accepts an email address. They need to cover valid formats, invalid formats, and edge cases. Which combination of techniques would be most thorough?",
        "EP for format categories, BVA for length limits, and error guessing for common email mistakes", "Only random inputs", "Only valid emails", "Only blank input",
        "A", "Combining EP, BVA, and error guessing provides comprehensive coverage for email validation testing.")
    add(SUBJECT, "Test Design Techniques", "Medium", "scenario",
        "A mobile app has a form with 3 dropdowns. Dropdown A has 4 options, B has 3 options, and C has 5 options. Full combinatorial testing requires 60 test cases. Time allows for 20. What is the best approach?",
        "Pairwise testing to cover all two-way interactions", "Test only the first option of each", "Random selection of 20", "Skip dropdown testing",
        "A", "Pairwise testing ensures every pair of dropdown values appears in at least one test case.")

    # Scenario - Hard (4)
    add(SUBJECT, "Test Design Techniques", "Hard", "scenario",
        "A medical device firmware has 8 boolean conditions that determine alarm behavior. Full decision table testing requires 256 columns. The team must reduce test cases while maintaining safety coverage. What approach should they use?",
        "MC/DC combined with risk-based prioritization of critical condition combinations", "Random selection of 20 columns", "Testing only one condition at a time", "Skipping alarm testing",
        "A", "MC/DC ensures each condition independently affects the outcome, suitable for safety-critical systems.")
    add(SUBJECT, "Test Design Techniques", "Hard", "scenario",
        "A tester is designing test cases for a complex workflow where a user can reach the same screen through 5 different paths. Some paths change the available options on the screen. Which technique best handles this?",
        "State Transition Testing combined with path analysis", "Testing only one path", "Boundary Value Analysis", "Equivalence Partitioning",
        "A", "State Transition Testing with path analysis captures how different paths affect system state and available options.")
    add(SUBJECT, "Test Design Techniques", "Hard", "scenario",
        "An API endpoint accepts JSON with 10 optional fields. A tester wants to ensure that all interactions between any 3 fields are tested. What combinatorial technique provides this coverage?",
        "3-wise combinatorial testing (covering arrays of strength 3)", "Pairwise testing", "Testing all 10 fields individually", "Testing only with all fields present",
        "A", "3-wise combinatorial testing covers all interactions between any 3 parameters, stronger than pairwise.")
    add(SUBJECT, "Test Design Techniques", "Hard", "scenario",
        "A financial system calculates tax based on income brackets, filing status, deductions, and state. The business rules are documented in a 50-page specification. How should the test design approach be structured?",
        "Decompose rules into decision tables per section, combine with EP/BVA for input ranges, and use RTM for coverage", "Test with random inputs", "Test only the first bracket", "Wait for production issues",
        "A", "Systematic decomposition into decision tables with EP/BVA and traceability ensures comprehensive coverage.")

    # ===================== Defect Management =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Defect Management", "Easy", "mcq",
        "What is a defect in software testing?",
        "A variance between expected and actual results", "A new feature request", "A design document", "A test case",
        "A", "A defect is any deviation from the expected behavior as defined by requirements or specifications.")
    add(SUBJECT, "Defect Management", "Easy", "mcq",
        "What information should a defect report include?",
        "Summary, steps to reproduce, expected vs actual result, severity, and priority", "Only the defect title", "Only a screenshot", "Only the tester name",
        "A", "A comprehensive defect report includes all details needed for developers to understand and fix the issue.")
    add(SUBJECT, "Defect Management", "Easy", "mcq",
        "What is the difference between severity and priority of a defect?",
        "Severity measures impact on functionality; priority measures urgency of fixing", "They are the same", "Severity is set by developers; priority by testers", "Priority measures functionality impact",
        "A", "Severity reflects technical impact; priority reflects business urgency of the fix.")
    add(SUBJECT, "Defect Management", "Easy", "mcq",
        "What does 'defect life cycle' refer to?",
        "The stages a defect goes through from discovery to closure", "The product lifecycle", "The SDLC", "The test plan duration",
        "A", "The defect life cycle tracks a defect from identification through triage, fixing, verification, and closure.")
    add(SUBJECT, "Defect Management", "Easy", "mcq",
        "Which status indicates a defect has been fixed and awaits verification?",
        "Fixed/Ready for Retest", "New", "Rejected", "Deferred",
        "A", "Fixed or Ready for Retest status indicates the developer has applied a fix awaiting QA verification.")
    add(SUBJECT, "Defect Management", "Easy", "mcq",
        "What does it mean when a defect is 'deferred'?",
        "The defect is valid but will be addressed in a future release", "The defect is invalid", "The defect is fixed", "The defect is a duplicate",
        "A", "Deferred means the defect is acknowledged but postponed to a later release based on priority.")

    # MCQ - Medium (8)
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What is defect triaging?",
        "The process of reviewing, prioritizing, and assigning defects", "Writing test cases", "Deploying software", "Creating user stories",
        "A", "Defect triage involves reviewing reported defects, setting priority, and assigning them to the right team.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What is the purpose of a defect severity classification system?",
        "To categorize defects by their impact on system functionality for appropriate response", "To rank testers", "To count lines of code", "To measure test execution speed",
        "A", "Severity classification ensures appropriate response levels: Critical, Major, Minor, Cosmetic.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What is a 'showstopper' defect?",
        "A critical defect that blocks further testing or renders the system unusable", "A minor UI issue", "A documentation error", "A feature enhancement",
        "A", "A showstopper is a critical defect that prevents the system from functioning or blocks testing progress.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What is defect clustering?",
        "The tendency of defects to be concentrated in a small number of modules", "Grouping defects alphabetically", "Random distribution of defects", "Having no defects",
        "A", "Defect clustering reflects the Pareto principle: most defects tend to be found in a few modules.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "When should a defect be marked as 'Cannot Reproduce'?",
        "When the tester or developer cannot replicate the defect with the given steps", "When the defect is fixed", "When a new defect is found", "When testing is complete",
        "A", "Cannot Reproduce means the defect could not be replicated despite following the reported steps.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What is the purpose of defect root cause analysis?",
        "To identify the underlying reason for defects and prevent recurrence", "To blame developers", "To close defects faster", "To reduce test cases",
        "A", "Root cause analysis identifies why defects occurred to implement preventive measures.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What happens when a tester reopens a defect?",
        "The tester verified the fix and found it inadequate or the defect still exists", "The defect is deleted", "A new defect is created", "Testing is stopped",
        "A", "Reopening indicates the fix did not resolve the issue or the defect persists after the attempted fix.")
    add(SUBJECT, "Defect Management", "Medium", "mcq",
        "What is the difference between a defect and an enhancement request?",
        "A defect is a failure to meet requirements; an enhancement is a request for new functionality", "They are the same", "Enhancements are always urgent", "Defects are always low priority",
        "A", "Defects violate existing requirements; enhancements request functionality beyond current requirements.")

    # MCQ - Hard (6)
    add(SUBJECT, "Defect Management", "Hard", "mcq",
        "What is defect leakage and how is it measured?",
        "Defects found in production that escaped testing; measured as production defects divided by total defects", "Number of test cases", "Team size", "Code complexity",
        "A", "Defect leakage measures testing effectiveness by the ratio of escaped defects to total defects found.")
    add(SUBJECT, "Defect Management", "Hard", "mcq",
        "What is the defect removal efficiency (DRE) formula?",
        "DRE = (Defects found during testing / Total defects) x 100", "DRE = Test cases / Defects", "DRE = Developers / Testers", "DRE = Time / Cost",
        "A", "DRE measures what percentage of total defects were caught during testing before production release.")
    add(SUBJECT, "Defect Management", "Hard", "mcq",
        "How should defect management be handled in an Agile environment compared to traditional?",
        "Real-time triage within sprints with focus on immediate resolution rather than formal workflow", "Exactly the same as traditional", "No defect tracking needed", "Defects are only logged at sprint end",
        "A", "Agile defect management emphasizes rapid triage, immediate resolution within sprints, and lightweight tracking.")
    add(SUBJECT, "Defect Management", "Hard", "mcq",
        "What is a defect cascade?",
        "When one defect triggers or masks other defects in dependent functionality", "A waterfall of test cases", "A type of test suite", "A deployment process",
        "A", "A defect cascade occurs when one defect causes failures in related areas, potentially hiding other defects.")
    add(SUBJECT, "Defect Management", "Hard", "mcq",
        "What is the pesticide paradox in relation to defect management?",
        "Repeatedly running the same tests eventually stops finding new defects", "Defects multiply over time", "New defects appear after deployment", "Testing tools expire",
        "A", "The pesticide paradox states that repeating the same tests will not find new defects; tests must be revised.")
    add(SUBJECT, "Defect Management", "Hard", "mcq",
        "In a formal defect management process, what role does a Change Control Board (CCB) play?",
        "Reviews and approves decisions on defects including deferral, rejection, or priority changes", "Writes code", "Executes test cases", "Deploys software",
        "A", "The CCB makes formal decisions about defect disposition including priority, deferral, and scheduling.")

    # Scenario - Easy (4)
    add(SUBJECT, "Defect Management", "Easy", "scenario",
        "A tester finds a typo in an error message. How should they classify the severity?",
        "Cosmetic/Low", "Critical", "Blocker", "Major",
        "A", "A typo in an error message is a cosmetic issue with minimal impact on functionality.")
    add(SUBJECT, "Defect Management", "Easy", "scenario",
        "A tester reports a defect but the developer says they cannot reproduce it. What should the tester do?",
        "Provide more detailed steps, environment info, and screenshots to help reproduce", "Close the defect", "Argue with the developer", "Ignore it",
        "A", "The tester should enhance the report with detailed steps, environment details, and evidence.")
    add(SUBJECT, "Defect Management", "Easy", "scenario",
        "A defect was reported by two different testers independently. What should happen to the second report?",
        "Mark it as Duplicate and link it to the original", "Keep both open", "Delete it", "Assign it to a different developer",
        "A", "Duplicate defects should be linked to the original and closed as duplicates to avoid redundant work.")
    add(SUBJECT, "Defect Management", "Easy", "scenario",
        "A developer fixes a login bug. The tester retests and confirms it works correctly. What status should the defect be set to?",
        "Closed/Verified", "Reopened", "Deferred", "New",
        "A", "After successful retest verification, the defect should be closed or marked as verified.")

    # Scenario - Medium (5)
    add(SUBJECT, "Defect Management", "Medium", "scenario",
        "The application crashes when a user uploads a file larger than 10MB. This feature is used daily by all customers. How should severity and priority be assigned?",
        "Severity: Critical; Priority: High", "Severity: Low; Priority: Low", "Severity: Medium; Priority: Low", "Severity: Cosmetic; Priority: Medium",
        "A", "A crash affecting all users on a daily feature warrants Critical severity and High priority.")
    add(SUBJECT, "Defect Management", "Medium", "scenario",
        "A QA lead notices that 60% of all defects in the last release were found in the reporting module which has only 10% of the code. What testing principle does this illustrate?",
        "Defect Clustering (Pareto principle)", "Exhaustive Testing", "Pesticide Paradox", "Error Guessing",
        "A", "Defect clustering shows that a small number of modules typically contain the majority of defects.")
    add(SUBJECT, "Defect Management", "Medium", "scenario",
        "After a defect is fixed, the tester finds that the fix introduced a new problem in a related feature. What type of defect is this?",
        "Regression defect", "Duplicate defect", "Enhancement request", "Design defect",
        "A", "A regression defect is a new issue introduced by a code change intended to fix another problem.")
    add(SUBJECT, "Defect Management", "Medium", "scenario",
        "A critical defect is found two days before release. The fix is complex and risky. What should the team consider?",
        "Risk assessment of fixing vs releasing with a known workaround", "Always fix regardless of risk", "Ignore the defect", "Delay release by months",
        "A", "The team should weigh the risk of the fix introducing new issues against releasing with a workaround.")
    add(SUBJECT, "Defect Management", "Medium", "scenario",
        "A defect was marked as 'Not a Defect' by the developer, but the tester believes it violates the requirements. How should this be resolved?",
        "Escalate to the defect triage meeting with requirements documentation as evidence", "Accept the developer's decision", "File a complaint with HR", "Close the defect permanently",
        "A", "Disagreements should be resolved in triage with evidence from requirements documentation.")

    # Scenario - Hard (4)
    add(SUBJECT, "Defect Management", "Hard", "scenario",
        "An organization has a defect removal efficiency of only 60%. Production defects are causing significant customer impact. What systematic improvements should be implemented?",
        "Improve test coverage, add code reviews, implement shift-left testing, and strengthen entry/exit criteria", "Hire more support staff", "Reduce testing", "Accept the DRE as acceptable",
        "A", "Improving DRE requires better test coverage, early defect detection, code reviews, and stricter quality gates.")
    add(SUBJECT, "Defect Management", "Hard", "scenario",
        "During a triage meeting, there are 200 open defects for a release with limited development capacity. How should the team prioritize?",
        "Use a risk-based matrix considering severity, business impact, fix complexity, and customer visibility", "Fix them in order reported", "Fix only easy ones", "Close them all as deferred",
        "A", "A risk-based prioritization matrix ensures the most impactful defects are addressed within constraints.")
    add(SUBJECT, "Defect Management", "Hard", "scenario",
        "A production incident reveals a defect that was actually found during testing but was incorrectly closed as 'Cannot Reproduce.' What process improvement is needed?",
        "Implement stricter criteria for Cannot Reproduce status including minimum reproduction attempts and environment verification", "No changes needed", "Stop using the status", "Blame the tester",
        "A", "Stricter criteria and verification requirements for Cannot Reproduce prevent premature defect closure.")
    add(SUBJECT, "Defect Management", "Hard", "scenario",
        "A defect in a rarely used admin feature allows unauthorized access to user data. It has low impact frequency but high potential damage. How should severity and priority be set?",
        "Severity: Critical (security breach); Priority: High (data protection is paramount)", "Severity: Low; Priority: Low since rarely used", "Severity: Medium; Priority: Medium", "Severity: Cosmetic; Priority: Low",
        "A", "Security vulnerabilities are always Critical severity regardless of usage frequency; data protection demands High priority.")

    # ===================== Test Types =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Test Types", "Easy", "mcq",
        "What is smoke testing?",
        "A quick test to verify the basic functionality of a build before detailed testing", "Exhaustive testing of all features", "Performance testing", "Security testing",
        "A", "Smoke testing is a shallow check to ensure the build is stable enough for further testing.")
    add(SUBJECT, "Test Types", "Easy", "mcq",
        "What is sanity testing?",
        "A focused test on specific functionality after a minor change or bug fix", "Testing all features", "Load testing", "Installation testing",
        "A", "Sanity testing verifies that a specific fix or change works without doing broad regression testing.")
    add(SUBJECT, "Test Types", "Easy", "mcq",
        "What is the difference between functional and non-functional testing?",
        "Functional tests what the system does; non-functional tests how well it performs", "They are identical", "Non-functional is more important", "Functional testing is done after deployment only",
        "A", "Functional testing verifies features; non-functional testing evaluates quality attributes like performance.")
    add(SUBJECT, "Test Types", "Easy", "mcq",
        "What is integration testing?",
        "Testing the interaction between integrated modules or components", "Testing individual functions", "Testing the entire system", "Testing the user interface only",
        "A", "Integration testing verifies that modules work correctly together when combined.")
    add(SUBJECT, "Test Types", "Easy", "mcq",
        "What is system testing?",
        "Testing the complete integrated system against requirements", "Testing a single module", "Testing in production", "Testing only the database",
        "A", "System testing validates the entire system as a whole against functional and non-functional requirements.")
    add(SUBJECT, "Test Types", "Easy", "mcq",
        "What is unit testing?",
        "Testing individual components or functions in isolation", "Testing the whole system", "Testing across browsers", "Testing user workflows",
        "A", "Unit testing verifies the smallest testable parts of the software in isolation.")

    # MCQ - Medium (8)
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is the difference between smoke testing and sanity testing?",
        "Smoke testing is broad and shallow; sanity testing is narrow and deep on specific areas", "They are the same", "Sanity is always automated", "Smoke takes longer than sanity",
        "A", "Smoke tests cover breadth of functionality shallowly; sanity tests focus deeply on specific changes.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is alpha testing?",
        "Testing performed by internal testers at the developer's site before beta release", "Testing by end users", "Automated testing", "Performance testing",
        "A", "Alpha testing is done by internal staff at the development site to find defects before beta release.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is beta testing?",
        "Testing performed by external users in a real-world environment before general release", "Internal testing", "Unit testing", "Code review",
        "A", "Beta testing involves real users testing in their own environments to find issues missed internally.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is the purpose of compatibility testing?",
        "To verify the application works across different browsers, OS, devices, and configurations", "To test a single browser", "To test code quality", "To test database performance",
        "A", "Compatibility testing ensures the application functions correctly across various environments.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is end-to-end testing?",
        "Testing the complete application flow from start to finish as a user would experience it", "Testing a single API", "Testing only the database", "Testing only the frontend",
        "A", "End-to-end testing validates the entire user journey through the complete system.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is the difference between top-down and bottom-up integration testing?",
        "Top-down starts from higher-level modules using stubs; bottom-up starts from lower-level modules using drivers", "They are identical", "Top-down uses drivers", "Bottom-up uses stubs",
        "A", "Top-down tests from UI down using stubs for lower modules; bottom-up tests from units up using drivers.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is ad-hoc testing?",
        "Unstructured testing without test cases, relying on tester's intuition", "Formal testing with detailed test cases", "Automated testing", "Performance testing",
        "A", "Ad-hoc testing is informal, unplanned testing aimed at finding defects through random exploration.")
    add(SUBJECT, "Test Types", "Medium", "mcq",
        "What is localization testing?",
        "Verifying the application is correctly adapted for a specific locale including language and formats", "Testing only in English", "Testing server locations", "Testing network latency",
        "A", "Localization testing verifies proper adaptation of language, date/number formats, and cultural conventions.")

    # MCQ - Hard (6)
    add(SUBJECT, "Test Types", "Hard", "mcq",
        "What distinguishes grey-box testing from black-box and white-box testing?",
        "Grey-box uses partial knowledge of internal structure to design tests from an external perspective", "Grey-box is a mix of manual and automated", "Grey-box is performance testing", "Grey-box requires no knowledge at all",
        "A", "Grey-box testing combines partial internal knowledge with external testing perspective for better coverage.")
    add(SUBJECT, "Test Types", "Hard", "mcq",
        "When is big-bang integration testing appropriate despite its risks?",
        "For small systems with few modules where individual module testing is already thorough", "For large enterprise systems", "For safety-critical systems", "Always",
        "A", "Big-bang integration is viable for small systems where isolation of defects to specific integrations is easier.")
    add(SUBJECT, "Test Types", "Hard", "mcq",
        "What is mutation testing and what does it evaluate?",
        "Introducing deliberate faults into code to evaluate the quality of the test suite", "Testing code mutations from version control", "Random testing", "UI testing",
        "A", "Mutation testing seeds small code changes (mutants) to check if existing tests can detect them.")
    add(SUBJECT, "Test Types", "Hard", "mcq",
        "What is the key challenge of testing in a service-oriented architecture (SOA)?",
        "Managing dependencies between services and ensuring correct behavior at integration points", "Writing unit tests", "UI design", "Database schema design",
        "A", "SOA testing challenges include service dependencies, contract validation, and integration complexity.")
    add(SUBJECT, "Test Types", "Hard", "mcq",
        "What is the difference between verification and validation in testing?",
        "Verification checks if the product is built right; validation checks if the right product is built", "They are identical", "Verification is done only in production", "Validation is done only by developers",
        "A", "Verification ensures correct implementation; validation ensures the product meets user needs.")
    add(SUBJECT, "Test Types", "Hard", "mcq",
        "What is the sandwich (hybrid) integration testing strategy?",
        "Combines top-down and bottom-up approaches by testing from both ends toward the middle", "Testing only the middle layers", "A specific type of unit test", "Testing food ordering systems",
        "A", "Sandwich integration tests from top and bottom simultaneously, meeting in the middle for efficiency.")

    # Scenario - Easy (4)
    add(SUBJECT, "Test Types", "Easy", "scenario",
        "A new build has just been deployed to the test environment. Before the team starts detailed testing, they want to verify the build is stable. What type of testing should they do?",
        "Smoke Testing", "Regression Testing", "Performance Testing", "UAT",
        "A", "Smoke testing quickly verifies build stability before investing time in detailed testing.")
    add(SUBJECT, "Test Types", "Easy", "scenario",
        "A developer fixed a specific login bug. The tester wants to quickly verify just that fix works. What type of testing is this?",
        "Sanity Testing", "System Testing", "Smoke Testing", "Alpha Testing",
        "A", "Sanity testing focuses on verifying a specific fix or change rather than broad functionality.")
    add(SUBJECT, "Test Types", "Easy", "scenario",
        "A client wants their web application to work on Chrome, Firefox, and Safari. What type of testing is needed?",
        "Compatibility/Cross-Browser Testing", "Unit Testing", "Smoke Testing", "Load Testing",
        "A", "Cross-browser compatibility testing verifies the app works correctly across specified browsers.")
    add(SUBJECT, "Test Types", "Easy", "scenario",
        "The development team has completed individual module testing. Now they need to verify that modules work together. What testing level comes next?",
        "Integration Testing", "Unit Testing", "User Acceptance Testing", "Smoke Testing",
        "A", "Integration testing follows unit testing to verify correct interaction between modules.")

    # Scenario - Medium (6)
    add(SUBJECT, "Test Types", "Medium", "scenario",
        "An e-commerce application needs to be tested on iOS and Android with different screen sizes. The QA team has limited devices. What approach should they take?",
        "Use a combination of real devices for critical paths and emulators/cloud services for broader coverage", "Test only on one device", "Skip mobile testing", "Test only on emulators",
        "A", "Combining real devices for key scenarios with cloud device farms provides cost-effective coverage.")
    add(SUBJECT, "Test Types", "Medium", "scenario",
        "After a major code refactoring, the team needs to verify that existing functionality still works. What type of testing is most important?",
        "Regression Testing", "Smoke Testing only", "UAT only", "Installation Testing",
        "A", "Regression testing verifies that refactoring has not broken existing functionality.")
    add(SUBJECT, "Test Types", "Medium", "scenario",
        "A team wants to test how the system handles 1000 concurrent users. What type of non-functional testing is this?",
        "Load Testing", "Functional Testing", "Sanity Testing", "Usability Testing",
        "A", "Load testing evaluates system behavior under expected and peak user concurrency levels.")
    add(SUBJECT, "Test Types", "Medium", "scenario",
        "An internationalized application needs to display prices in local currencies and dates in local formats for 10 countries. What type of testing is required?",
        "Localization Testing", "Unit Testing", "Smoke Testing", "Sanity Testing",
        "A", "Localization testing verifies correct adaptation of formats, currencies, and content for each locale.")
    add(SUBJECT, "Test Types", "Medium", "scenario",
        "A healthcare app must verify the complete patient journey from registration through appointment booking to receiving test results. What testing approach covers this?",
        "End-to-End Testing", "Unit Testing", "Integration Testing of one module", "Smoke Testing",
        "A", "End-to-end testing validates the complete user journey across all system components.")
    add(SUBJECT, "Test Types", "Medium", "scenario",
        "The team is using bottom-up integration testing but the UI modules are not ready yet. What component is needed to simulate the UI?",
        "Test Drivers", "Stubs", "Mocks", "Fixtures",
        "A", "In bottom-up integration, test drivers simulate the calling modules (like the UI) that are not yet available.")

    # Scenario - Hard (4)
    add(SUBJECT, "Test Types", "Hard", "scenario",
        "A team discovers that their test suite fails to detect intentionally introduced bugs during a quality assessment. What type of testing would evaluate and improve the test suite's effectiveness?",
        "Mutation Testing", "Regression Testing", "Smoke Testing", "Sanity Testing",
        "A", "Mutation testing introduces deliberate code changes to evaluate whether the test suite can detect them.")
    add(SUBJECT, "Test Types", "Hard", "scenario",
        "A banking system has 20 microservices. The team wants to test API contracts between services to prevent integration failures. What testing strategy is most appropriate?",
        "Contract Testing / Consumer-Driven Contract Testing", "Only UI testing", "Only unit testing", "Manual integration testing of all services",
        "A", "Contract testing validates API agreements between services, preventing integration failures in microservices.")
    add(SUBJECT, "Test Types", "Hard", "scenario",
        "A system has both real-time and batch processing components. Traditional end-to-end testing takes 8 hours. How can the testing strategy be optimized?",
        "Separate real-time and batch testing with parallel execution and targeted integration tests at boundaries", "Always run full 8-hour tests", "Skip batch testing", "Test only real-time features",
        "A", "Separating real-time and batch testing with targeted integration at boundaries reduces cycle time.")
    add(SUBJECT, "Test Types", "Hard", "scenario",
        "A team needs to verify that their application handles graceful degradation when dependent services are down. What type of testing is most appropriate?",
        "Failover/Resilience Testing with chaos engineering principles", "Smoke Testing", "Unit Testing", "Usability Testing",
        "A", "Resilience testing with chaos engineering verifies graceful degradation when dependencies fail.")

    # ===================== Agile Testing =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Agile Testing", "Easy", "mcq",
        "In Agile, when does testing begin?",
        "From the start of the project, integrated throughout all sprints", "Only after development is complete", "Only in the final sprint", "Only during UAT",
        "A", "In Agile, testing is continuous and starts from the very first sprint.")
    add(SUBJECT, "Agile Testing", "Easy", "mcq",
        "What is a sprint in Agile testing?",
        "A fixed time period (usually 2-4 weeks) during which a set of features is developed and tested", "The entire project timeline", "A type of test case", "A defect status",
        "A", "A sprint is a time-boxed iteration where the team delivers a potentially shippable increment.")
    add(SUBJECT, "Agile Testing", "Easy", "mcq",
        "What is the role of a tester in a Scrum team?",
        "A team member who collaborates throughout the sprint on quality activities", "Someone who only tests at the end", "The person who writes requirements", "The project sponsor",
        "A", "In Scrum, testers are integral team members participating in all activities including planning and reviews.")
    add(SUBJECT, "Agile Testing", "Easy", "mcq",
        "What is a user story in Agile?",
        "A short description of functionality from the user's perspective", "A detailed test case", "A defect report", "A project charter",
        "A", "A user story describes a feature in the format: As a [user], I want [goal], so that [benefit].")
    add(SUBJECT, "Agile Testing", "Easy", "mcq",
        "What are acceptance criteria in Agile?",
        "Conditions that a user story must satisfy to be considered complete", "The sprint velocity", "The team's skill set", "The project budget",
        "A", "Acceptance criteria define the specific conditions a user story must meet to be accepted as done.")
    add(SUBJECT, "Agile Testing", "Easy", "mcq",
        "What is the 'Definition of Done' in Agile?",
        "A shared understanding of what it means for a work item to be complete", "The project end date", "The first test case", "A type of requirement",
        "A", "Definition of Done is a checklist of criteria that must be met for an item to be considered complete.")

    # MCQ - Medium (8)
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "What is the Agile testing quadrant model?",
        "A framework categorizing tests into four quadrants based on business/technology facing and supporting/critiquing", "A four-phase test plan", "A defect classification system", "A sprint planning tool",
        "A", "The Agile testing quadrants help teams understand different types of tests and when to apply them.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "What is the purpose of a sprint retrospective from a testing perspective?",
        "To reflect on testing process improvements and identify what worked and what needs change", "To write new test cases", "To deploy software", "To estimate story points",
        "A", "Retrospectives help the team continuously improve their testing practices based on sprint experience.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "How does testing in a Kanban environment differ from Scrum?",
        "Kanban has continuous flow with WIP limits instead of fixed sprints", "There is no difference", "Kanban has no testing", "Scrum has no testing",
        "A", "Kanban uses continuous flow with work-in-progress limits rather than time-boxed sprints.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "What is the role of Behavior-Driven Development (BDD) in Agile testing?",
        "It bridges communication between business and technical teams using a shared Given-When-Then format", "It replaces all testing", "It is only for developers", "It is a deployment technique",
        "A", "BDD uses Given-When-Then scenarios to create shared understanding between business and technical teams.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "What is 'shift-left testing' in Agile?",
        "Moving testing activities earlier in the development process", "Shifting testers to a different team", "Delaying testing to the end", "Moving testing to production",
        "A", "Shift-left testing means performing testing activities earlier to find defects when they are cheaper to fix.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "How should regression testing be managed in Agile sprints?",
        "Through a growing automated regression suite that runs continuously", "Skip regression testing in Agile", "Only in the last sprint", "Manually test everything each sprint",
        "A", "Agile requires a growing automated regression suite to maintain quality across rapid iterations.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "What is the three amigos meeting in Agile?",
        "A discussion between a developer, tester, and business analyst to refine a user story", "A standup meeting with three people", "A retrospective with three topics", "A review with three stakeholders",
        "A", "The three amigos meeting brings different perspectives to ensure shared understanding of requirements.")
    add(SUBJECT, "Agile Testing", "Medium", "mcq",
        "What is Acceptance Test-Driven Development (ATDD)?",
        "Writing acceptance tests before development begins, driven by collaboration between team members", "Testing after development", "A type of unit test", "A deployment strategy",
        "A", "ATDD creates acceptance tests first through team collaboration, guiding development to meet those criteria.")

    # MCQ - Hard (6)
    add(SUBJECT, "Agile Testing", "Hard", "mcq",
        "How does the concept of 'whole team approach' to quality differ from traditional QA?",
        "Everyone on the team is responsible for quality, not just testers", "Only testers are responsible", "Only managers are responsible", "Quality is not important in Agile",
        "A", "The whole team approach means quality is everyone's responsibility, unlike traditional siloed QA.")
    add(SUBJECT, "Agile Testing", "Hard", "mcq",
        "What is the testing impact when a team transitions from feature teams to component teams?",
        "Component teams may optimize locally but increase integration testing complexity", "No impact on testing", "Testing becomes unnecessary", "All testing becomes automated",
        "A", "Component teams can create integration gaps requiring more cross-team integration testing effort.")
    add(SUBJECT, "Agile Testing", "Hard", "mcq",
        "How should technical debt related to testing be managed in Agile?",
        "Allocate capacity in each sprint for test automation debt reduction and test maintenance", "Ignore it", "Address it only at project end", "Create a separate testing project",
        "A", "Allocating sprint capacity for testing debt prevents accumulation that degrades quality over time.")
    add(SUBJECT, "Agile Testing", "Hard", "mcq",
        "What is the 'test automation pyramid' and why is it important in Agile?",
        "A strategy with many unit tests, fewer integration tests, and fewest UI tests for fast, stable feedback", "Equal numbers of all test types", "Only UI tests", "Only unit tests",
        "A", "The pyramid ensures fast, reliable feedback with most tests at the unit level and fewer at the UI level.")
    add(SUBJECT, "Agile Testing", "Hard", "mcq",
        "How does continuous integration affect the tester's role in Agile?",
        "Testers focus more on test design, automation, and exploratory testing while CI handles regression", "Testers are not needed", "CI replaces all testing", "Testers only write manual test cases",
        "A", "CI automates regression feedback, allowing testers to focus on higher-value activities like exploration.")
    add(SUBJECT, "Agile Testing", "Hard", "mcq",
        "What challenges arise when scaling Agile testing across multiple teams working on the same product?",
        "Test environment contention, integration complexity, and maintaining consistent test standards", "No challenges", "Fewer test cases needed", "Testing becomes simpler",
        "A", "Scaling Agile testing brings environment, integration, and standardization challenges across teams.")

    # Scenario - Easy (4)
    add(SUBJECT, "Agile Testing", "Easy", "scenario",
        "A Scrum team's sprint is 2 weeks long. The developer finishes coding a feature on day 10. The tester complains there is not enough time to test. What Agile principle is being violated?",
        "Testing should happen throughout the sprint, not just at the end", "Sprints should be longer", "Testers should code", "Developers should test",
        "A", "Agile integrates testing throughout the sprint rather than relegating it to the end.")
    add(SUBJECT, "Agile Testing", "Easy", "scenario",
        "A product owner writes a user story without acceptance criteria. How does this affect the tester?",
        "The tester cannot clearly define what constitutes pass or fail for the story", "No impact", "Testing is easier", "The tester writes code instead",
        "A", "Without acceptance criteria, testers lack clear conditions for verifying story completion.")
    add(SUBJECT, "Agile Testing", "Easy", "scenario",
        "During the sprint planning meeting, the team is estimating stories but no tester is present. What risk does this create?",
        "Testing effort may be underestimated and testing scenarios may be missed", "No risk", "Stories will be overestimated", "Development will take longer",
        "A", "Without tester input, teams often underestimate testing effort and miss quality considerations.")
    add(SUBJECT, "Agile Testing", "Easy", "scenario",
        "At the end of a sprint, the team demonstrates the completed features to stakeholders. What Agile ceremony is this?",
        "Sprint Review/Demo", "Sprint Retrospective", "Daily Standup", "Sprint Planning",
        "A", "The Sprint Review or Demo showcases completed work to stakeholders for feedback.")

    # Scenario - Medium (5)
    add(SUBJECT, "Agile Testing", "Medium", "scenario",
        "A team's sprint velocity has been declining because regression testing takes more time each sprint. What solution would address this sustainably?",
        "Invest in automated regression testing to reduce manual regression effort", "Skip regression testing", "Reduce sprint scope permanently", "Add more testers",
        "A", "Automating regression tests frees time for new feature testing as the product grows.")
    add(SUBJECT, "Agile Testing", "Medium", "scenario",
        "A QA engineer on an Agile team notices the same types of defects recurring across sprints. What Agile practice would help address this?",
        "Use sprint retrospectives to identify root causes and implement preventive actions", "Ignore the pattern", "File more defect reports", "Blame the developers",
        "A", "Retrospectives provide a forum to analyze recurring issues and commit to specific improvements.")
    add(SUBJECT, "Agile Testing", "Medium", "scenario",
        "The business wants to release features to production multiple times per week. What testing strategy enables this cadence?",
        "Continuous testing with automated pipelines, feature flags, and canary releases", "Full manual regression each time", "No testing", "Monthly batch testing",
        "A", "Continuous testing with automation, feature flags, and staged rollouts enables frequent safe releases.")
    add(SUBJECT, "Agile Testing", "Medium", "scenario",
        "A tester wants to ensure that a user story is well-understood before development begins. Which Agile practice should they participate in?",
        "Three Amigos / Story Refinement session", "Sprint Retrospective", "Daily Standup only", "Test Closure meeting",
        "A", "Three Amigos sessions bring developer, tester, and BA perspectives together for shared understanding.")
    add(SUBJECT, "Agile Testing", "Medium", "scenario",
        "An Agile team is working on a payment feature. The tester proposes writing acceptance tests before the developer starts coding. What practice is this?",
        "Acceptance Test-Driven Development (ATDD)", "Regression Testing", "Smoke Testing", "Ad-hoc Testing",
        "A", "ATDD defines acceptance tests upfront to guide development and ensure the feature meets criteria.")

    # Scenario - Hard (4)
    add(SUBJECT, "Agile Testing", "Hard", "scenario",
        "A large organization with 10 Scrum teams working on one product is struggling with integration quality. Tests pass in individual team environments but fail when code is merged. What testing approach should be adopted?",
        "Implement a system-level integration test suite that runs on the merged codebase with shared CI/CD pipelines", "Let each team test independently", "Remove integration testing", "Delay integration to release",
        "A", "Shared CI/CD with system-level integration tests on merged code catches cross-team integration issues.")
    add(SUBJECT, "Agile Testing", "Hard", "scenario",
        "A team is transitioning from Scrum to Kanban. The tester is concerned about how to maintain testing quality without fixed sprint boundaries for regression cycles. What approach should they adopt?",
        "Implement continuous testing with automated gates at each stage of the Kanban workflow", "Stop regression testing", "Keep sprint boundaries artificially", "Test only at monthly intervals",
        "A", "In Kanban, continuous testing with quality gates at each workflow stage replaces sprint-based testing cycles.")
    add(SUBJECT, "Agile Testing", "Hard", "scenario",
        "A team practicing BDD finds that their Given-When-Then scenarios become so numerous that maintaining them slows development. How should they optimize?",
        "Review and refactor scenarios, remove redundant ones, use scenario outlines, and focus on key behaviors", "Delete all scenarios", "Stop using BDD", "Convert all to unit tests",
        "A", "Scenario maintenance requires periodic review, refactoring, and focusing on key behavioral outcomes.")
    add(SUBJECT, "Agile Testing", "Hard", "scenario",
        "An Agile team's test automation pyramid is inverted with 80% UI tests and 20% unit tests. Test execution takes hours and is flaky. What is the recommended corrective strategy?",
        "Gradually shift tests down the pyramid by converting UI tests to integration/unit tests where possible", "Add more UI tests", "Accept the slow feedback", "Remove all automation",
        "A", "Inverting the pyramid by shifting tests to lower levels improves speed, reliability, and maintainability.")

    # ===================== Risk-Based Testing =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Risk-Based Testing", "Easy", "mcq",
        "What is risk-based testing?",
        "A testing approach that prioritizes testing based on the risk of failure and its impact", "Testing without a plan", "Testing only high-risk areas", "Random testing",
        "A", "Risk-based testing uses risk assessment to guide testing priorities and effort allocation.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "mcq",
        "What two factors are typically used to assess risk?",
        "Likelihood of failure and impact of failure", "Cost and schedule", "Team size and skill", "Number of test cases and defects",
        "A", "Risk is typically assessed as the product of the likelihood of failure and its potential impact.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "mcq",
        "Why is risk-based testing important when time is limited?",
        "It ensures the most critical areas are tested first", "It eliminates the need for test cases", "It makes testing faster", "It reduces the number of testers needed",
        "A", "Risk-based testing prioritizes effort on high-risk areas, maximizing value when time is constrained.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "mcq",
        "Who should be involved in identifying risks for testing?",
        "Cross-functional stakeholders including testers, developers, business analysts, and product owners", "Only testers", "Only managers", "Only developers",
        "A", "Risk identification benefits from diverse perspectives across the team and stakeholders.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "mcq",
        "What is a risk matrix in testing?",
        "A grid that maps likelihood and impact to categorize risks as high, medium, or low", "A test case template", "A defect report format", "A project schedule",
        "A", "A risk matrix visually categorizes risks by plotting likelihood against impact.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "mcq",
        "What happens to low-risk items in risk-based testing?",
        "They receive less testing effort and may use lighter testing techniques", "They are never tested", "They get the most testing", "They are tested first",
        "A", "Low-risk items receive proportionally less effort, possibly using simplified or sampling-based testing.")

    # MCQ - Medium (8)
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "How does risk-based testing influence test case prioritization?",
        "High-risk areas are tested first with more thorough test cases", "All test cases have equal priority", "Low-risk areas are tested first", "Priority is random",
        "A", "Risk-based prioritization ensures high-risk functionality is tested first and most thoroughly.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "What is a product risk versus a project risk?",
        "Product risk affects software quality; project risk affects project success (schedule, budget)", "They are the same", "Product risk is about hardware", "Project risk is about testing only",
        "A", "Product risks relate to quality of the deliverable; project risks relate to management of the project.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "How should risk assessment be maintained throughout the project?",
        "Continuously updated as new information, changes, and defect patterns emerge", "Done once at project start and never revisited", "Only at project end", "Only during test planning",
        "A", "Risk assessment is a living activity that should be updated as the project evolves.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "What is the relationship between risk-based testing and test coverage?",
        "Higher-risk areas receive deeper coverage while lower-risk areas get lighter coverage", "All areas get equal coverage", "Coverage is not related to risk", "Only high-risk areas are tested",
        "A", "Risk-based testing allocates coverage proportionally to risk levels across the application.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "How can historical defect data be used in risk-based testing?",
        "Areas with more historical defects are considered higher risk and receive more testing attention", "Historical data is irrelevant", "Only new features are risky", "Data is used only for reporting",
        "A", "Historical defect data helps predict where future defects are likely, guiding risk assessment.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "What is risk mitigation in the context of testing?",
        "Actions taken to reduce the likelihood or impact of identified risks", "Ignoring risks", "Accepting all risks", "Transferring all testing to developers",
        "A", "Risk mitigation involves deliberate actions to reduce either the probability or impact of risks.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "How does complexity of a module affect its risk assessment?",
        "Higher complexity increases the likelihood of defects, raising the risk level", "Complexity has no impact", "Simple modules are riskier", "Complexity only affects performance",
        "A", "Complex modules have more potential for defects, increasing their risk level in assessment.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "mcq",
        "What role does business criticality play in risk-based testing?",
        "Features critical to business operations receive higher risk ratings and more testing", "All features are equally critical", "Business criticality is not relevant", "Only technical factors matter",
        "A", "Business-critical features have higher impact potential, warranting more thorough testing.")

    # MCQ - Hard (6)
    add(SUBJECT, "Risk-Based Testing", "Hard", "mcq",
        "How does PRISMA (Product Risk Management) approach risk-based testing?",
        "It uses a systematic process of risk identification, assessment, and mitigation mapped to test activities", "It only focuses on performance risks", "It ignores business risks", "It is a code review technique",
        "A", "PRISMA provides a structured framework linking risk management activities directly to testing efforts.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "mcq",
        "What is residual risk in testing and how should it be communicated?",
        "Risk remaining after testing is complete; communicated through test summary reports to stakeholders", "Risk that does not exist", "Risk only in production", "Risk in the test plan",
        "A", "Residual risk represents untested or undertested areas and must be transparently communicated to stakeholders.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "mcq",
        "How should risk-based testing adapt when a critical defect is found in a low-risk area?",
        "Re-evaluate the risk assessment for that area and increase testing coverage", "Ignore it since the area is low risk", "Keep the same risk level", "Stop testing other areas",
        "A", "Finding critical defects in low-risk areas signals that the risk assessment needs revision.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "mcq",
        "What is the challenge of quantifying risk in software testing?",
        "Risk assessment often involves subjective judgment that can be biased or inconsistent", "Risk is always perfectly measurable", "There are no challenges", "Only developers can assess risk",
        "A", "Risk quantification in testing is inherently subjective and can vary between assessors and contexts.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "mcq",
        "How does the failure mode and effects analysis (FMEA) technique apply to risk-based testing?",
        "FMEA systematically identifies potential failure modes, their causes, and effects to prioritize testing", "FMEA is a coding technique", "FMEA replaces all test planning", "FMEA is only for hardware",
        "A", "FMEA evaluates potential failures by severity, occurrence, and detection to compute risk priority numbers.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "mcq",
        "In a risk-based testing approach, how should newly added features in a late sprint be handled?",
        "Perform rapid risk assessment and allocate proportional testing effort based on criticality", "Skip testing for new features", "Test only existing features", "Delay the release indefinitely",
        "A", "Late additions need rapid risk assessment to determine appropriate testing depth within time constraints.")

    # Scenario - Easy (4)
    add(SUBJECT, "Risk-Based Testing", "Easy", "scenario",
        "A project has limited testing time. The payment module is critical to business while the about page is informational. Where should testing effort be focused?",
        "Payment module since it has higher business risk and impact", "About page", "Equal time on both", "Neither",
        "A", "The payment module's critical business impact warrants prioritized testing effort.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "scenario",
        "A QA lead is creating a risk assessment and needs to decide which module to test first: a simple, well-tested module or a complex, newly developed module. Which should be tested first?",
        "The complex, newly developed module due to higher risk of defects", "The simple module", "Neither", "Both equally",
        "A", "New, complex modules have higher defect risk and should be prioritized in testing.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "scenario",
        "Stakeholders want to know why certain features received more testing than others. What document justifies this?",
        "Risk Assessment document showing the basis for testing prioritization", "The source code", "The user manual", "The deployment guide",
        "A", "The risk assessment documents why certain areas received more testing based on risk analysis.")
    add(SUBJECT, "Risk-Based Testing", "Easy", "scenario",
        "A team identifies that the login module has had 15 defects in the last 3 releases while the dashboard had 2. How does this affect risk-based test planning?",
        "The login module should receive higher risk rating and more testing attention", "Both get equal testing", "Dashboard gets more testing", "Stop testing login",
        "A", "Historical defect data indicates higher risk for the login module, warranting increased testing focus.")

    # Scenario - Medium (5)
    add(SUBJECT, "Risk-Based Testing", "Medium", "scenario",
        "A risk assessment identifies 50 risks. The team can only address 20 with current capacity. How should they decide which 20 to focus on?",
        "Rank risks by risk score (likelihood x impact) and address the top 20", "Randomly select 20", "Address the easiest 20", "Address the newest 20",
        "A", "Prioritizing by risk score ensures the highest-impact risks are addressed first.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "scenario",
        "Midway through testing, a new regulatory requirement is discovered that affects the authentication module. How should risk-based testing adapt?",
        "Re-assess risk for authentication module, increase its priority, and allocate additional testing effort", "Ignore the new requirement", "Continue with the original plan", "Skip authentication testing",
        "A", "Regulatory requirements increase risk and require re-assessment and additional focused testing.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "scenario",
        "A test manager must present the testing strategy to stakeholders with limited technical knowledge. How should risk-based testing decisions be communicated?",
        "Use a visual risk matrix and explain decisions in terms of business impact and likelihood", "Use technical jargon", "Show only test case counts", "Do not communicate testing strategy",
        "A", "Visual risk matrices with business-focused language effectively communicate risk-based decisions to stakeholders.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "scenario",
        "The development team made significant changes to the database layer. The QA team has not updated their risk assessment. What is the potential consequence?",
        "Testing may miss critical defects in the changed database layer due to outdated risk priorities", "No consequence", "Testing improves automatically", "The database is not affected",
        "A", "Failing to update risk assessment after major changes can leave high-risk areas undertested.")
    add(SUBJECT, "Risk-Based Testing", "Medium", "scenario",
        "Two modules have the same risk score but only one can be tested thoroughly. Module A is used by all users daily; Module B is used by admins monthly. Which should be prioritized?",
        "Module A because its higher usage frequency increases the likelihood and impact of defects affecting users", "Module B", "Neither", "Both equally",
        "A", "Higher usage frequency increases both the likelihood of encountering defects and the number of affected users.")

    # Scenario - Hard (4)
    add(SUBJECT, "Risk-Based Testing", "Hard", "scenario",
        "An organization is implementing risk-based testing across 5 product lines. Each product has different risk profiles and stakeholders. How should the approach be standardized?",
        "Create an organizational risk framework with customizable risk categories while allowing product-specific risk assessments", "Use the same risk assessment for all products", "Let each team work independently", "Skip standardization",
        "A", "A common framework with product-specific customization balances consistency with relevance.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "scenario",
        "During risk-based testing of a trading platform, the QA team discovers that low-risk market data display features have critical timing dependencies with high-risk order execution features. How should the risk assessment change?",
        "Increase risk for market data display features due to their coupling with critical order execution", "Keep risk ratings unchanged", "Decrease risk for order execution", "Remove market data from testing",
        "A", "Dependencies with critical features increase the effective risk of seemingly low-risk components.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "scenario",
        "A QA manager needs to justify to the CTO that risk-based testing improved quality. What metrics would demonstrate this?",
        "Reduced defect leakage to production in high-risk areas, improved DRE, and correlation of defect finds with risk levels", "Number of test cases written", "Team size", "Testing tool costs",
        "A", "Metrics showing reduced production defects in prioritized areas and improved DRE demonstrate risk-based testing effectiveness.")
    add(SUBJECT, "Risk-Based Testing", "Hard", "scenario",
        "A product has both a web and mobile frontend sharing a common API. The risk assessment was done for web only. Mobile launches next month. How should the risk assessment be extended?",
        "Conduct mobile-specific risk assessment including device fragmentation, OS versions, and mobile-specific interactions while inheriting API risk ratings", "Reuse web assessment as-is", "Skip mobile risk assessment", "Test mobile only after production issues",
        "A", "Mobile introduces unique risks that require specific assessment while shared API risks can be inherited.")

    # ===================== Test Documentation =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Test Documentation", "Easy", "mcq",
        "What is a test case document?",
        "A document containing test case ID, steps, expected results, and actual results", "A project charter", "A code file", "A deployment script",
        "A", "A test case document details the steps, preconditions, input data, and expected outcomes for each test.")
    add(SUBJECT, "Test Documentation", "Easy", "mcq",
        "What is the purpose of a test summary report?",
        "To summarize testing activities, results, and overall quality assessment", "To write code", "To deploy software", "To gather requirements",
        "A", "A test summary report provides an overview of testing outcomes and quality evaluation.")
    add(SUBJECT, "Test Documentation", "Easy", "mcq",
        "What should a well-written test case include?",
        "Preconditions, test steps, test data, expected results, and postconditions", "Only the test name", "Only the expected result", "Only the test data",
        "A", "Complete test cases include all information needed for consistent execution by any tester.")
    add(SUBJECT, "Test Documentation", "Easy", "mcq",
        "What is a test log?",
        "A chronological record of test execution activities and results", "A defect report", "A requirements document", "A design specification",
        "A", "A test log records when tests were run, by whom, and with what results in chronological order.")
    add(SUBJECT, "Test Documentation", "Easy", "mcq",
        "What is the difference between a test plan and a test case?",
        "A test plan describes the testing approach; a test case describes specific steps to test a feature", "They are identical", "A test case is more strategic", "A test plan is more detailed",
        "A", "The test plan is strategic (what/how to test); test cases are tactical (specific steps and expected results).")
    add(SUBJECT, "Test Documentation", "Easy", "mcq",
        "Why is test documentation important?",
        "It provides traceability, consistency, and knowledge transfer across the team", "It slows down testing", "It is only for auditors", "It has no value",
        "A", "Documentation ensures tests are repeatable, traceable, and knowledge is preserved for the team.")

    # MCQ - Medium (8)
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "What is the IEEE 829 standard for test documentation?",
        "A standard defining formats for test plans, test cases, test logs, and test reports", "A coding standard", "A hardware specification", "A network protocol",
        "A", "IEEE 829 standardizes the format and content of software test documentation artifacts.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "What is the difference between a test procedure and a test case?",
        "A test procedure is a detailed sequence of actions for execution; a test case defines what to verify", "They are identical", "A test procedure is less detailed", "A test case includes execution steps only",
        "A", "Test cases define verification points; test procedures detail the step-by-step execution sequence.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "What is a test data document?",
        "A document specifying the data sets needed for test execution", "A database schema", "A deployment log", "A user guide",
        "A", "Test data documents define the specific data inputs, configurations, and states needed for testing.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "How should test documentation be maintained in Agile environments?",
        "Keep it lightweight, living, and integrated with tools like wikis or test management systems", "Create extensive documents that are never updated", "Eliminate all documentation", "Only use Word documents",
        "A", "Agile favors lightweight, continuously updated documentation integrated with team collaboration tools.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "What is a test incident report?",
        "A document reporting any event during testing that requires investigation", "A performance report", "A code review document", "A sprint burndown chart",
        "A", "A test incident report captures unexpected events during testing that need further investigation.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "What is the purpose of a requirements traceability matrix (RTM) in test documentation?",
        "To ensure every requirement has corresponding test cases and vice versa", "To track project budget", "To schedule meetings", "To monitor server performance",
        "A", "The RTM provides bidirectional traceability between requirements and test cases for coverage assurance.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "What information should a test execution report contain?",
        "Test cases executed, pass/fail status, defects found, and environment details", "Only pass counts", "Only defect counts", "Only test case names",
        "A", "Execution reports provide complete status including pass/fail, defects, and environment context.")
    add(SUBJECT, "Test Documentation", "Medium", "mcq",
        "When should test documentation be reviewed and by whom?",
        "Reviewed by peers and leads during test case reviews before execution begins", "Never reviewed", "Only after project completion", "Only by the author",
        "A", "Peer and lead reviews catch issues in test documentation before test execution, improving quality.")

    # MCQ - Hard (6)
    add(SUBJECT, "Test Documentation", "Hard", "mcq",
        "How should test documentation balance thoroughness with efficiency?",
        "Document enough for repeatability and auditability without creating overhead that slows testing", "Maximum detail always", "No documentation ever", "Only screenshots",
        "A", "Effective documentation balances being comprehensive enough for reuse while remaining maintainable.")
    add(SUBJECT, "Test Documentation", "Hard", "mcq",
        "What is the risk of over-documenting in testing?",
        "Increased maintenance burden, slower testing cycles, and resistance from the team", "No risk", "Better quality always", "Faster testing",
        "A", "Over-documentation creates maintenance overhead, slows testing, and can lead to outdated artifacts.")
    add(SUBJECT, "Test Documentation", "Hard", "mcq",
        "How does test documentation support regulatory compliance audits?",
        "By providing evidence of testing activities, traceability, and adherence to standards", "It does not support compliance", "Only code supports compliance", "Only deployment logs matter",
        "A", "Compliance audits require documented evidence of testing activities and traceability to requirements.")
    add(SUBJECT, "Test Documentation", "Hard", "mcq",
        "What challenges arise when maintaining test documentation for a rapidly evolving product?",
        "Documentation becomes outdated quickly, requiring continuous updates and version control", "No challenges", "Documentation writes itself", "Changes do not affect documentation",
        "A", "Rapid changes require disciplined documentation maintenance with versioning to stay current.")
    add(SUBJECT, "Test Documentation", "Hard", "mcq",
        "How should test documentation be structured for a large-scale distributed team?",
        "Centralized repository with standardized templates, naming conventions, and access controls", "Individual documents per person", "No standardization needed", "Email attachments only",
        "A", "Distributed teams need centralized, standardized documentation with clear organization and access.")
    add(SUBJECT, "Test Documentation", "Hard", "mcq",
        "What is the relationship between test documentation and knowledge management in an organization?",
        "Test documentation captures institutional testing knowledge that enables continuity when team members change", "No relationship", "Knowledge management replaces testing", "Documentation is only for current projects",
        "A", "Test documentation serves as organizational memory, enabling knowledge transfer and continuity.")

    # Scenario - Easy (4)
    add(SUBJECT, "Test Documentation", "Easy", "scenario",
        "A new tester joins the team and needs to understand what has been tested for the current release. Which document should they refer to?",
        "Test Execution Report/Test Summary Report", "Source Code", "Deployment Guide", "Marketing Material",
        "A", "Test execution and summary reports show what has been tested, results, and current quality status.")
    add(SUBJECT, "Test Documentation", "Easy", "scenario",
        "A client asks for proof that their specified requirements have been tested. What document demonstrates this?",
        "Requirements Traceability Matrix (RTM)", "Source Code", "User Manual", "Project Budget",
        "A", "The RTM maps each requirement to its test cases, providing traceability evidence.")
    add(SUBJECT, "Test Documentation", "Easy", "scenario",
        "A tester is executing a test case but the steps are too vague to follow. What is wrong with the test documentation?",
        "The test case lacks sufficient detail in its steps for consistent execution", "The tester is inexperienced", "The application is wrong", "The test plan is missing",
        "A", "Test cases must have clear, detailed steps that any tester can follow consistently.")
    add(SUBJECT, "Test Documentation", "Easy", "scenario",
        "After a release, the team wants to document what went well and what could be improved in testing. What document captures this?",
        "Lessons Learned / Test Closure Report", "Test Plan", "RTM", "Defect Report",
        "A", "The lessons learned or test closure report captures retrospective insights for process improvement.")

    # Scenario - Medium (5)
    add(SUBJECT, "Test Documentation", "Medium", "scenario",
        "An audit reveals that test cases exist but there is no evidence of execution. What documentation gap needs to be addressed?",
        "Test execution logs and evidence (screenshots, results) must be captured and stored", "Write more test cases", "Delete existing test cases", "Ignore the audit",
        "A", "Execution evidence including logs and results must be captured to demonstrate testing was performed.")
    add(SUBJECT, "Test Documentation", "Medium", "scenario",
        "A team uses a wiki for test documentation but different testers use different formats. This causes confusion. What should be implemented?",
        "Standardized templates for all test documentation types", "Let everyone use their own format", "Stop documenting", "Use only emails",
        "A", "Standardized templates ensure consistency and usability across the team's documentation.")
    add(SUBJECT, "Test Documentation", "Medium", "scenario",
        "Test cases written two years ago are still being used but the application has changed significantly. Many test cases fail due to outdated expected results. What maintenance practice is needed?",
        "Regular review and update of test cases to align with current application behavior", "Delete all old test cases", "Ignore the failures", "Write entirely new test cases from scratch each time",
        "A", "Test case maintenance through regular reviews ensures documentation stays aligned with the application.")
    add(SUBJECT, "Test Documentation", "Medium", "scenario",
        "A project requires ISO 9001 compliance. The QA lead needs to ensure test documentation meets the standard. What key requirement must be addressed?",
        "Document control including version management, review/approval processes, and controlled distribution", "No special requirements", "Only verbal approvals", "Only final reports",
        "A", "ISO 9001 requires formal document control with versioning, approvals, and controlled access.")
    add(SUBJECT, "Test Documentation", "Medium", "scenario",
        "The management wants a weekly status report on testing progress. What key metrics should the test documentation include?",
        "Test cases planned vs executed, pass/fail rates, open defects by severity, and risk items", "Only the number of testers", "Only the project budget", "Only meeting notes",
        "A", "Weekly status should include execution progress, pass/fail rates, defect status, and risk highlights.")

    # Scenario - Hard (4)
    add(SUBJECT, "Test Documentation", "Hard", "scenario",
        "A multinational organization with teams across 5 countries needs a unified test documentation strategy. Teams speak different languages and use different tools. What approach ensures consistency?",
        "English as the common documentation language, standardized templates, centralized tool with localized guidelines", "Each country uses their own language and format", "No documentation", "Only the HQ team documents",
        "A", "A common language, standard templates, and centralized tooling with local guidance ensures global consistency.")
    add(SUBJECT, "Test Documentation", "Hard", "scenario",
        "A regulated pharmaceutical company needs to validate its testing documentation process itself. How should this meta-validation be approached?",
        "Establish a documentation quality process with periodic audits, peer reviews, and traceability checks of the documentation system", "No validation of documentation is needed", "Only validate at project end", "Only external auditors can validate",
        "A", "Meta-validation requires auditing the documentation process itself for completeness and compliance.")
    add(SUBJECT, "Test Documentation", "Hard", "scenario",
        "A team is transitioning from manual documentation to a test management tool. Legacy data includes 5000 test cases in spreadsheets. What migration strategy is recommended?",
        "Prioritize migration of active, high-value test cases first; archive obsolete ones; validate migrated data", "Migrate everything at once", "Delete all legacy data", "Keep using spreadsheets",
        "A", "Phased migration of high-value test cases with validation ensures quality while managing the transition.")
    add(SUBJECT, "Test Documentation", "Hard", "scenario",
        "During a compliance audit, the auditor finds gaps between documented test procedures and actual test execution. The team insists they tested correctly but did not follow the exact documented steps. What is the root cause and solution?",
        "Documentation and practice are out of sync; implement periodic alignment reviews and empower testers to update procedures", "The documentation is wrong", "The testing is wrong", "There is no issue",
        "A", "Misalignment between documentation and practice requires regular synchronization and empowered updates.")

    # ===================== Estimation =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Estimation", "Easy", "mcq",
        "What is test estimation?",
        "The process of predicting the effort, time, and resources needed for testing activities", "Counting lines of code", "Measuring server speed", "Calculating project revenue",
        "A", "Test estimation predicts the resources and time needed to complete testing activities.")
    add(SUBJECT, "Estimation", "Easy", "mcq",
        "Which is a common technique for test effort estimation?",
        "Work Breakdown Structure (WBS)", "Code review", "Deployment planning", "Marketing analysis",
        "A", "WBS breaks testing into smaller tasks to estimate effort for each, summing up to total effort.")
    add(SUBJECT, "Estimation", "Easy", "mcq",
        "What factor most affects test effort estimation?",
        "Complexity and size of the application under test", "The color of the UI", "The company logo", "The office location",
        "A", "Application complexity and size directly influence the testing effort required.")
    add(SUBJECT, "Estimation", "Easy", "mcq",
        "What is expert judgment in test estimation?",
        "Relying on experienced testers' knowledge to estimate effort", "Using only mathematical formulas", "Randomly guessing", "Copying estimates from other projects",
        "A", "Expert judgment leverages the experience of seasoned testers to predict effort requirements.")
    add(SUBJECT, "Estimation", "Easy", "mcq",
        "Why is accurate test estimation important?",
        "It helps plan resources, budget, and schedule realistically", "It eliminates all defects", "It speeds up development", "It reduces team size",
        "A", "Accurate estimation ensures realistic planning of resources, time, and budget for testing.")
    add(SUBJECT, "Estimation", "Easy", "mcq",
        "What is a common unit for measuring test effort?",
        "Person-hours or person-days", "Lines of code", "Number of servers", "Number of meetings",
        "A", "Test effort is typically measured in person-hours or person-days of tester time.")

    # MCQ - Medium (8)
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "What is the three-point estimation technique?",
        "Using optimistic, most likely, and pessimistic estimates to calculate expected effort", "Three people estimate independently", "Estimating in three minutes", "Using three test cases",
        "A", "Three-point estimation uses best, expected, and worst case values to compute a weighted average.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "How does the Delphi technique work for test estimation?",
        "Experts estimate independently, share anonymously, discuss, and iterate until consensus", "One person decides for all", "Random number generation", "Copying from a template",
        "A", "Delphi uses iterative anonymous expert estimates with discussion to reach consensus.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "What is analogous estimation in testing?",
        "Estimating based on comparison with similar past projects", "Using only mathematical models", "Random estimation", "Doubling the development estimate",
        "A", "Analogous estimation uses data from comparable past projects as a baseline for the current estimate.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "What is the testing percentage of overall project effort typically?",
        "Varies but commonly ranges from 25% to 50% of total project effort", "Always 10%", "Always 90%", "Testing takes no effort",
        "A", "Testing typically consumes 25-50% of project effort depending on complexity and quality requirements.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "How should test estimation account for rework and defect retesting?",
        "Include a buffer or factor for expected rework based on historical defect rates", "Ignore rework", "Assume no defects will be found", "Only estimate initial testing",
        "A", "Realistic estimates include rework time based on expected defect rates from similar projects.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "What is the Use Case Point method for test estimation?",
        "Estimating effort based on the complexity and number of use cases", "Counting lines of code", "Measuring screen resolution", "Counting team members",
        "A", "Use Case Points weight use cases by complexity to estimate the testing effort required.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "How does team experience level affect test estimation?",
        "Less experienced teams typically need more time; estimates should factor in skill levels", "Experience has no impact", "Experienced teams always take longer", "Skill level is not relevant",
        "A", "Team experience significantly impacts productivity; less experienced teams need adjusted estimates.")
    add(SUBJECT, "Estimation", "Medium", "mcq",
        "What is the role of test estimation in risk management?",
        "Identifying when estimates are uncertain helps highlight areas that may need contingency planning", "No role", "Risk and estimation are unrelated", "Estimation eliminates risk",
        "A", "Uncertainty in estimates signals areas needing contingency planning and risk mitigation.")

    # MCQ - Hard (6)
    add(SUBJECT, "Estimation", "Hard", "mcq",
        "What is function point analysis in the context of test estimation?",
        "Measuring software size by counting functional user interactions to derive test effort", "Counting functions in code", "Measuring function execution time", "Counting team functions",
        "A", "Function point analysis measures software size based on user-visible functions to estimate testing effort.")
    add(SUBJECT, "Estimation", "Hard", "mcq",
        "How should test estimation handle the uncertainty of requirements in Agile projects?",
        "Use relative estimation with story points and adjust based on velocity and emerging requirements", "Provide exact estimates upfront", "Do not estimate in Agile", "Estimate only at project end",
        "A", "Agile uses relative estimation and velocity to adapt estimates as requirements evolve.")
    add(SUBJECT, "Estimation", "Hard", "mcq",
        "What is estimation bias and how can it be mitigated?",
        "Systematic tendency to over/under estimate; mitigated through calibration, historical data, and multiple estimators", "Bias does not exist in estimation", "Always overestimate to be safe", "Use only one estimator",
        "A", "Estimation bias is mitigated through calibration against actuals, data analysis, and multiple perspectives.")
    add(SUBJECT, "Estimation", "Hard", "mcq",
        "How does the cone of uncertainty affect test estimation over the project lifecycle?",
        "Estimates are less accurate early and become more precise as the project progresses and unknowns reduce", "Estimates are always accurate", "Uncertainty increases over time", "Estimation accuracy does not change",
        "A", "The cone of uncertainty narrows as project knowledge increases, improving estimate accuracy over time.")
    add(SUBJECT, "Estimation", "Hard", "mcq",
        "What is Monte Carlo simulation in test estimation?",
        "A probabilistic method that runs thousands of simulations to estimate likely effort ranges and confidence levels", "A card game estimation technique", "A single-point estimate", "A type of test case",
        "A", "Monte Carlo simulation uses probability distributions to model estimation uncertainty and provide confidence ranges.")
    add(SUBJECT, "Estimation", "Hard", "mcq",
        "How should test estimation account for test environment setup and configuration time?",
        "Include explicit line items for environment setup, data preparation, and tool configuration in the estimate", "Ignore environment time", "Assume instant setup", "Environment time is zero",
        "A", "Environment setup can be significant and must be explicitly estimated as part of total testing effort.")

    # Scenario - Easy (4)
    add(SUBJECT, "Estimation", "Easy", "scenario",
        "A project manager asks the QA lead how long testing will take. The QA lead has no information about the project scope. What should they do first?",
        "Request the requirements or scope document before providing an estimate", "Guess a random number", "Say two weeks", "Refuse to estimate",
        "A", "Estimation requires understanding scope; the QA lead needs requirements before estimating.")
    add(SUBJECT, "Estimation", "Easy", "scenario",
        "A test team estimated 100 hours for testing but actual effort was 150 hours. What should they do for future projects?",
        "Analyze why the estimate was off and use the actual data to calibrate future estimates", "Use 100 hours again", "Never estimate again", "Double all future estimates",
        "A", "Retrospective analysis of estimation accuracy helps calibrate and improve future estimates.")
    add(SUBJECT, "Estimation", "Easy", "scenario",
        "A QA lead needs to estimate testing for a simple CRUD application with 10 screens. A similar project last year took 80 hours. What estimation technique is being used?",
        "Analogous Estimation", "Delphi Technique", "Monte Carlo Simulation", "Function Point Analysis",
        "A", "Using a past similar project as a reference is analogous estimation.")
    add(SUBJECT, "Estimation", "Easy", "scenario",
        "A stakeholder pressures the QA lead to reduce the testing estimate by 50%. What should the QA lead do?",
        "Explain the risks of reduced testing and propose a risk-based approach to work within constraints", "Agree immediately", "Refuse to negotiate", "Quit the project",
        "A", "The QA lead should communicate risks transparently and propose alternatives like risk-based prioritization.")

    # Scenario - Medium (6)
    add(SUBJECT, "Estimation", "Medium", "scenario",
        "A project has 200 test cases. Historical data shows each test case takes an average of 30 minutes to execute including documentation. What is the estimated execution time?",
        "100 hours (200 x 30 minutes)", "200 hours", "50 hours", "30 hours",
        "A", "200 test cases at 30 minutes each equals 100 hours of test execution effort.")
    add(SUBJECT, "Estimation", "Medium", "scenario",
        "Three experts estimate a testing task: Expert A says 40 hours (optimistic), Expert B says 60 hours (most likely), Expert C says 100 hours (pessimistic). Using PERT, what is the estimate?",
        "63.3 hours using the formula (O + 4M + P) / 6", "40 hours", "100 hours", "200 hours",
        "A", "PERT formula: (40 + 4*60 + 100) / 6 = (40 + 240 + 100) / 6 = 380/6 = 63.3 hours.")
    add(SUBJECT, "Estimation", "Medium", "scenario",
        "A team is estimating for a project with new technology they have never used before. What adjustment should they make to their baseline estimate?",
        "Add a learning curve buffer typically 25-50% extra for the first project with new technology", "No adjustment needed", "Reduce the estimate", "Use the same estimate as familiar technology",
        "A", "New technology introduces a learning curve that should be accounted for with an additional buffer.")
    add(SUBJECT, "Estimation", "Medium", "scenario",
        "Midway through the project, 5 new features are added but the testing timeline is not extended. How should the QA lead respond?",
        "Re-estimate with new features, communicate the impact, and propose either timeline extension or risk-based scope reduction", "Absorb the extra work silently", "Skip testing the new features", "Reduce testing on all features equally",
        "A", "Scope changes require re-estimation and transparent communication about impacts on timeline or coverage.")
    add(SUBJECT, "Estimation", "Medium", "scenario",
        "A QA manager wants to track estimation accuracy over time. What metric should they use?",
        "Estimation Accuracy = (Actual Effort / Estimated Effort) x 100%, tracked over multiple projects", "Number of test cases", "Team size", "Number of defects",
        "A", "Tracking the ratio of actual to estimated effort over time reveals estimation trends and improvement.")
    add(SUBJECT, "Estimation", "Medium", "scenario",
        "A team uses story points for estimation in Agile. Their velocity is 40 points per sprint. The remaining backlog is 120 points of testing-related stories. How many sprints are needed?",
        "3 sprints (120 / 40)", "1 sprint", "10 sprints", "Cannot be determined",
        "A", "At a velocity of 40 points per sprint, 120 points requires 3 sprints.")

    # Scenario - Hard (4)
    add(SUBJECT, "Estimation", "Hard", "scenario",
        "A large enterprise project requires estimating testing effort for 500 requirements across 8 modules. Different modules have different complexity levels. What estimation approach provides the best accuracy?",
        "Bottom-up estimation using WBS per module with complexity-weighted effort per requirement type", "Top-down single estimate", "Expert guess", "Fixed percentage of development time",
        "A", "Bottom-up WBS with complexity weighting provides granular, accurate estimates for large diverse projects.")
    add(SUBJECT, "Estimation", "Hard", "scenario",
        "Historical data shows that the team's estimates are consistently 30% lower than actual effort. The team uses expert judgment exclusively. What process improvement would help?",
        "Calibrate estimates using historical actual-vs-estimated data and introduce structured techniques like three-point estimation", "Continue with expert judgment only", "Hire new experts", "Stop estimating",
        "A", "Calibrating with historical data and adding structured techniques corrects systematic underestimation.")
    add(SUBJECT, "Estimation", "Hard", "scenario",
        "A test manager needs to provide a confidence interval for the testing estimate to the steering committee. The optimistic estimate is 400 hours, most likely 600 hours, pessimistic 1000 hours. What should they present?",
        "Present PERT estimate of ~633 hours with standard deviation of 100 hours and confidence ranges", "Present only the optimistic 400 hours", "Present 1000 hours to be safe", "Present no estimate",
        "A", "PERT with standard deviation (P-O)/6 = 100 hours provides meaningful confidence ranges for stakeholders.")
    add(SUBJECT, "Estimation", "Hard", "scenario",
        "An organization wants to build an estimation model specific to their testing process. They have 3 years of project data. What approach should they take?",
        "Analyze historical data to identify key effort drivers, build a regression model, validate with recent projects, and refine iteratively", "Use a generic industry model", "Guess based on team size", "No model is needed",
        "A", "Custom estimation models built from organizational data and refined iteratively provide the most accurate predictions.")

    # ===================== Test Metrics =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Test Metrics", "Easy", "mcq",
        "What is a test metric?",
        "A quantitative measure used to assess the quality and progress of testing activities", "A type of test case", "A defect category", "A project milestone",
        "A", "Test metrics are measurements that quantify testing activities, progress, and quality.")
    add(SUBJECT, "Test Metrics", "Easy", "mcq",
        "What does the 'test execution rate' metric measure?",
        "The number of test cases executed over a given time period", "The number of defects found", "The cost of testing", "The team size",
        "A", "Test execution rate tracks how many test cases have been run in a given timeframe.")
    add(SUBJECT, "Test Metrics", "Easy", "mcq",
        "What is the 'pass rate' metric?",
        "The percentage of test cases that passed out of total executed", "The number of testers", "The project budget", "The code size",
        "A", "Pass rate = (Passed test cases / Total executed test cases) x 100%.")
    add(SUBJECT, "Test Metrics", "Easy", "mcq",
        "What does 'defect density' measure?",
        "The number of defects per unit size of software (e.g., per KLOC or per function point)", "The total number of defects", "The speed of testing", "The team productivity",
        "A", "Defect density normalizes defect counts by software size to enable meaningful comparisons.")
    add(SUBJECT, "Test Metrics", "Easy", "mcq",
        "Why are test metrics important?",
        "They provide objective data for decision-making about quality and testing progress", "They replace testing", "They are only for management reports", "They have no practical value",
        "A", "Metrics provide objective evidence for quality decisions, progress tracking, and process improvement.")
    add(SUBJECT, "Test Metrics", "Easy", "mcq",
        "What is 'requirement coverage' in testing?",
        "The percentage of requirements that have at least one associated test case", "The number of requirements written", "The number of code lines covered", "The project completion percentage",
        "A", "Requirement coverage measures what percentage of requirements are addressed by test cases.")

    # MCQ - Medium (8)
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "What is the difference between test metrics and test KPIs?",
        "Metrics are measurements; KPIs are key metrics tied to specific goals and targets", "They are identical", "KPIs are less important", "Metrics are not used in reporting",
        "A", "KPIs are a subset of metrics specifically selected to measure performance against goals.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "What does the 'defect rejection rate' indicate?",
        "The percentage of reported defects that are invalid or rejected after review", "The number of defects fixed", "The team velocity", "The code quality",
        "A", "A high rejection rate may indicate misunderstanding of requirements or poor defect reporting quality.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "What is the 'defect fix rate' metric?",
        "The number of defects fixed per time period by the development team", "The number of defects found", "The testing speed", "The deployment frequency",
        "A", "Defect fix rate measures development's throughput in resolving reported defects.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "How is the 'test case effectiveness' metric calculated?",
        "Number of defects detected divided by the number of test cases executed", "Number of test cases written", "Team size multiplied by hours", "Project cost divided by defects",
        "A", "Test case effectiveness measures the defect-finding yield of the test suite.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "What does a defect arrival curve show?",
        "The rate at which new defects are discovered over time during testing", "The number of testers over time", "Server uptime", "Code commit frequency",
        "A", "A defect arrival curve plots new defect discoveries over time to show testing progress and quality trends.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "What is the purpose of tracking test case creation progress?",
        "To ensure test cases are being developed on schedule to meet execution timelines", "To count lines of code", "To measure server load", "To track deployment frequency",
        "A", "Tracking creation progress ensures the test suite is ready for execution as scheduled.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "What does the 'defect reopened rate' metric indicate?",
        "The percentage of defects that are reopened after being marked as fixed", "The number of new defects", "The team size", "The project duration",
        "A", "A high reopen rate indicates poor fix quality or inadequate fix verification.")
    add(SUBJECT, "Test Metrics", "Medium", "mcq",
        "How can test metrics be misused?",
        "By using them to evaluate individual tester performance or setting targets that incentivize wrong behavior", "Metrics cannot be misused", "By collecting too few metrics", "By sharing them with stakeholders",
        "A", "Using metrics punitively or setting perverse targets can lead to gaming and counterproductive behavior.")

    # MCQ - Hard (6)
    add(SUBJECT, "Test Metrics", "Hard", "mcq",
        "What is the 'escaped defect rate' and why is it critical?",
        "Defects found in production divided by total defects; it measures testing effectiveness at preventing production issues", "The rate testers leave the company", "Server escape velocity", "Code deployment speed",
        "A", "Escaped defect rate directly measures how effective testing was at catching defects before production.")
    add(SUBJECT, "Test Metrics", "Hard", "mcq",
        "How does measuring 'cost of quality' help in testing decisions?",
        "It quantifies prevention, appraisal, internal and external failure costs to optimize quality investment", "It only measures testing tool costs", "It is not relevant to testing", "It measures only defect costs",
        "A", "Cost of quality analysis helps balance investment in prevention and detection vs failure costs.")
    add(SUBJECT, "Test Metrics", "Hard", "mcq",
        "What is Orthogonal Defect Classification (ODC) and how does it enhance metrics?",
        "A scheme classifying defects by attributes like type, trigger, and impact for deeper causal analysis", "A way to sort defects alphabetically", "A test execution technique", "A project management method",
        "A", "ODC provides structured defect classification enabling root cause analysis beyond simple counts.")
    add(SUBJECT, "Test Metrics", "Hard", "mcq",
        "How should metrics be used in a test process improvement initiative?",
        "As baseline measurements to identify improvement areas and track progress after changes are implemented", "Only for annual reports", "To punish low performers", "To increase budget",
        "A", "Metrics provide the objective baseline and progress tracking needed for meaningful process improvement.")
    add(SUBJECT, "Test Metrics", "Hard", "mcq",
        "What is the significance of tracking 'test automation ROI' as a metric?",
        "It measures whether the investment in automation is generating positive returns through reduced effort and faster feedback", "Automation always has positive ROI", "ROI is not measurable", "Only manual testing has ROI",
        "A", "Tracking automation ROI ensures the investment is justified by reduced effort, faster cycles, or better coverage.")
    add(SUBJECT, "Test Metrics", "Hard", "mcq",
        "What is a balanced scorecard approach to test metrics?",
        "Using a mix of metrics across dimensions like effectiveness, efficiency, coverage, and satisfaction", "Using only one metric", "Measuring only pass rates", "Tracking only defect counts",
        "A", "A balanced scorecard ensures multiple quality dimensions are measured to avoid optimizing one at the expense of others.")

    # Scenario - Easy (4)
    add(SUBJECT, "Test Metrics", "Easy", "scenario",
        "A manager asks: 'How much of the testing is done?' What metric provides the best answer?",
        "Test execution progress: percentage of planned test cases executed", "Lines of code written", "Number of meetings held", "Team headcount",
        "A", "Test execution progress as a percentage directly answers how much of the planned testing is complete.")
    add(SUBJECT, "Test Metrics", "Easy", "scenario",
        "A team executed 80 test cases and 60 passed. What is the pass rate?",
        "75% (60/80 x 100)", "80%", "60%", "100%",
        "A", "Pass rate = 60 passed / 80 executed = 75%.")
    add(SUBJECT, "Test Metrics", "Easy", "scenario",
        "The QA lead needs to report how many defects were found per module. What metric is this?",
        "Defect distribution by module", "Test execution rate", "Pass rate", "Requirement coverage",
        "A", "Defect distribution by module shows where defects are concentrated across the application.")
    add(SUBJECT, "Test Metrics", "Easy", "scenario",
        "A stakeholder wants to know if all requirements have been tested. Which metric addresses this?",
        "Requirement coverage percentage", "Defect density", "Pass rate", "Test execution time",
        "A", "Requirement coverage shows the percentage of requirements that have associated test cases and results.")

    # Scenario - Medium (5)
    add(SUBJECT, "Test Metrics", "Medium", "scenario",
        "A defect arrival curve shows new defects declining over the last 3 test cycles. What does this trend suggest?",
        "The software is stabilizing and most defects have likely been found", "More defects are hidden", "Testing is getting worse", "The team is not finding defects",
        "A", "A declining defect arrival rate typically indicates the software is stabilizing with fewer remaining defects.")
    add(SUBJECT, "Test Metrics", "Medium", "scenario",
        "The defect rejection rate is 40%. What does this high rate indicate and what action should be taken?",
        "Many defects are invalid; improve defect reporting quality through training and clearer requirements", "This is normal", "Stop reporting defects", "Increase defect count targets",
        "A", "A 40% rejection rate suggests misunderstanding of requirements or poor defect report quality needing improvement.")
    add(SUBJECT, "Test Metrics", "Medium", "scenario",
        "A project tracks defect density per module. Module X has 5 defects per KLOC while others have 1 per KLOC. What conclusion can be drawn?",
        "Module X likely has quality issues and may need code review, more testing, or refactoring", "Module X is the best module", "The metric is wrong", "All modules are equal",
        "A", "Significantly higher defect density signals quality issues requiring investigation and additional attention.")
    add(SUBJECT, "Test Metrics", "Medium", "scenario",
        "A QA team wants to show that investing in test automation has reduced testing time. What metrics should they compare before and after automation?",
        "Test execution time, regression cycle time, defect detection rate, and test coverage", "Only team size", "Only tool cost", "Only number of test cases",
        "A", "Comparing execution time, cycle time, detection rate, and coverage before/after shows automation impact.")
    add(SUBJECT, "Test Metrics", "Medium", "scenario",
        "Management wants a single 'quality score' for the release. The QA lead must combine multiple metrics. What approach is appropriate?",
        "Create a weighted composite score using key metrics like pass rate, defect density, requirement coverage, and severity distribution", "Use only pass rate", "Use only defect count", "Refuse to provide a score",
        "A", "A weighted composite score combining key metrics provides a holistic quality assessment.")

    # Scenario - Hard (4)
    add(SUBJECT, "Test Metrics", "Hard", "scenario",
        "An organization's testing metrics show 98% pass rate but high production defect rates. What could explain this contradiction and how should it be investigated?",
        "Test cases may not cover critical scenarios; investigate test case quality, coverage gaps, and whether tests reflect real usage", "The metrics are wrong", "Production defects are acceptable", "Stop measuring metrics",
        "A", "High pass rates with high production defects indicate test suite quality and coverage gaps needing analysis.")
    add(SUBJECT, "Test Metrics", "Hard", "scenario",
        "A VP of Engineering wants to benchmark the testing organization against industry standards. What metrics framework should the QA director propose?",
        "A balanced set including DRE, defect density, cost of quality, test automation coverage, and cycle time compared with TMM/TMMi maturity levels", "Only defect counts", "Only team size", "No benchmarking is possible",
        "A", "Industry benchmarking requires standardized metrics compared against maturity models like TMMi.")
    add(SUBJECT, "Test Metrics", "Hard", "scenario",
        "A team notices that as they add more test cases, the defect detection rate per test case decreases. What does this diminishing return indicate?",
        "The most effective test cases have been created first; new test cases are in lower-risk areas or are less targeted", "More test cases are always better", "Stop creating test cases", "The product has no more defects",
        "A", "Diminishing returns suggest test case optimization is needed to target uncovered risk areas rather than adding volume.")
    add(SUBJECT, "Test Metrics", "Hard", "scenario",
        "A testing organization wants to implement predictive analytics using their testing metrics data collected over 5 years. What types of predictions could be valuable?",
        "Predicted defect counts for new releases, estimated testing effort based on change size, and likely areas of defect clustering", "Only weather predictions", "No predictions are possible from test data", "Only budget predictions",
        "A", "Historical test metrics can predict defect volumes, effort needs, and risk areas for future releases.")

    # ===================== Exploratory Testing =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Exploratory Testing", "Easy", "mcq",
        "What is exploratory testing?",
        "Simultaneous test design, execution, and learning where the tester actively explores the application", "Scripted testing with predefined steps", "Automated testing", "Performance testing",
        "A", "Exploratory testing combines learning, test design, and execution in a simultaneous cognitive process.")
    add(SUBJECT, "Exploratory Testing", "Easy", "mcq",
        "How does exploratory testing differ from ad-hoc testing?",
        "Exploratory testing is structured with charters and time-boxing while ad-hoc has no structure", "They are identical", "Ad-hoc is more structured", "Exploratory uses automation",
        "A", "Exploratory testing uses charters and session-based management, unlike unstructured ad-hoc testing.")
    add(SUBJECT, "Exploratory Testing", "Easy", "mcq",
        "What is a test charter in exploratory testing?",
        "A brief document describing the mission and scope of an exploratory testing session", "A project charter", "A test plan", "A defect report",
        "A", "A test charter guides the tester by defining what to explore, what to look for, and potential risks.")
    add(SUBJECT, "Exploratory Testing", "Easy", "mcq",
        "When is exploratory testing most valuable?",
        "When requirements are incomplete or the tester needs to quickly learn about the application", "Only when formal testing is complete", "Never", "Only for performance testing",
        "A", "Exploratory testing excels when documentation is sparse or rapid feedback about the application is needed.")
    add(SUBJECT, "Exploratory Testing", "Easy", "mcq",
        "What skills are most important for exploratory testing?",
        "Critical thinking, curiosity, domain knowledge, and observation skills", "Only coding skills", "Only documentation skills", "Only management skills",
        "A", "Effective exploratory testers combine analytical thinking, curiosity, and keen observation.")
    add(SUBJECT, "Exploratory Testing", "Easy", "mcq",
        "Should exploratory testing replace scripted testing?",
        "No, they complement each other and should be used together", "Yes, it replaces all scripted testing", "Yes, scripted testing is obsolete", "They cannot be used together",
        "A", "Exploratory and scripted testing are complementary; each addresses different testing needs effectively.")

    # MCQ - Medium (8)
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "What is session-based test management (SBTM)?",
        "A structured approach to managing exploratory testing using time-boxed sessions with charters and debriefs", "A project management methodology", "A type of automated testing", "A defect tracking system",
        "A", "SBTM brings structure to exploratory testing through sessions, charters, session reports, and debriefs.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "What are the three key elements of a session-based exploratory testing session?",
        "Charter (mission), time-box (duration), and session report (findings)", "Code, test, deploy", "Plan, execute, close", "Analyze, design, implement",
        "A", "SBTM sessions are defined by their charter, time-box, and the resulting session report.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "How should exploratory testing findings be documented?",
        "Through session notes, screenshots, bug reports, and session debrief summaries", "No documentation needed", "Only in memory", "Only verbally",
        "A", "Documenting findings ensures knowledge is captured and defects are formally tracked.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "What is the role of heuristics in exploratory testing?",
        "Heuristics guide testers in identifying potential problem areas and testing strategies", "Heuristics are test scripts", "Heuristics replace test plans", "Heuristics are automated tools",
        "A", "Heuristics are experience-based rules of thumb that guide exploration and defect identification.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "What is the 'touring' approach in exploratory testing?",
        "Using different perspectives (like guidebook, money, landmark tours) to explore the application", "A geographic testing approach", "Testing while traveling", "Only testing navigation",
        "A", "Tours provide structured exploration strategies like testing high-value features or less-visited areas.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "How does exploratory testing fit into Agile sprints?",
        "It complements scripted testing by uncovering issues that predefined tests might miss during the sprint", "It is not used in Agile", "It replaces all sprint testing", "It is done only in the last sprint",
        "A", "Exploratory testing in Agile catches unexpected issues and provides rapid feedback within sprints.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "What is a debrief session in SBTM?",
        "A review meeting where the tester discusses findings, coverage, and next steps with the test lead", "A sprint planning meeting", "A code review", "A deployment meeting",
        "A", "Debriefs allow the tester and lead to discuss findings, assess coverage, and plan further exploration.")
    add(SUBJECT, "Exploratory Testing", "Medium", "mcq",
        "What percentage of time in an exploratory session should be spent on setup versus actual testing?",
        "Minimal setup time; the majority should be active testing and exploration", "50% setup, 50% testing", "90% setup, 10% testing", "Setup time does not matter",
        "A", "Effective exploratory sessions maximize active testing time with minimal setup overhead.")

    # MCQ - Hard (6)
    add(SUBJECT, "Exploratory Testing", "Hard", "mcq",
        "How can exploratory testing coverage be measured?",
        "Through session metrics including areas explored, time spent per area, and findings mapped to the application model", "It cannot be measured", "Only by defect count", "Only by time spent",
        "A", "Coverage is measured by mapping explored areas against an application model and tracking session metrics.")
    add(SUBJECT, "Exploratory Testing", "Hard", "mcq",
        "What is the HTSM (Heuristic Test Strategy Model) by James Bach?",
        "A model providing heuristics for test planning covering quality criteria, project environment, product elements, and techniques", "A programming framework", "A defect tracking system", "A project management methodology",
        "A", "HTSM provides structured heuristics to guide test strategy decisions in exploratory testing.")
    add(SUBJECT, "Exploratory Testing", "Hard", "mcq",
        "How does skilled exploratory testing differ from novice exploratory testing in measurable ways?",
        "Skilled testers find more critical defects, cover more meaningful scenarios, and document more actionable insights", "No measurable difference", "Novices find more bugs", "Skill does not matter in exploration",
        "A", "Experienced exploratory testers produce higher quality findings through better heuristics and domain knowledge.")
    add(SUBJECT, "Exploratory Testing", "Hard", "mcq",
        "What is the concept of 'testability' in the context of exploratory testing?",
        "The degree to which a system supports efficient exploration through observability and controllability", "Only the ability to write test cases", "A code metric", "A deployment characteristic",
        "A", "Testability encompasses how easily a tester can observe system behavior and control test conditions.")
    add(SUBJECT, "Exploratory Testing", "Hard", "mcq",
        "How can machine learning enhance exploratory testing?",
        "By analyzing patterns in previous testing to suggest unexplored areas and potential defect-prone paths", "ML replaces exploratory testing", "ML is not relevant to testing", "By automating all exploration",
        "A", "ML can guide exploration by identifying patterns and suggesting high-value areas to explore.")
    add(SUBJECT, "Exploratory Testing", "Hard", "mcq",
        "What challenges arise when scaling exploratory testing across multiple teams?",
        "Ensuring consistency of coverage, avoiding duplication, and maintaining quality of exploration across teams", "No challenges exist", "Exploratory testing cannot scale", "Only one person can do it",
        "A", "Scaling requires coordination mechanisms to ensure comprehensive, non-redundant exploration across teams.")

    # Scenario - Easy (4)
    add(SUBJECT, "Exploratory Testing", "Easy", "scenario",
        "A new feature has been deployed but no test cases have been written yet. The team needs quick feedback on quality. What approach should be used?",
        "Exploratory Testing with a focused charter on the new feature", "Wait for test cases to be written", "Skip testing", "Deploy to production and monitor",
        "A", "Exploratory testing provides immediate quality feedback when formal test cases are not yet available.")
    add(SUBJECT, "Exploratory Testing", "Easy", "scenario",
        "A tester is exploring an application and discovers that clicking a button very rapidly causes a crash. No test case covers this scenario. How should this be handled?",
        "Log a defect with steps to reproduce and add the scenario to future test cases", "Ignore it since no test case exists", "Close the application", "Report it verbally only",
        "A", "Unexpected findings during exploration should be documented as defects and added to the test suite.")
    add(SUBJECT, "Exploratory Testing", "Easy", "scenario",
        "A QA lead assigns a junior tester to do exploratory testing for the first time. What guidance should they provide?",
        "A test charter defining what to explore, what to look for, and a time-box for the session", "No guidance; let them figure it out", "A list of all defects to find", "Only automated test scripts",
        "A", "A charter and time-box give structure to guide the junior tester's exploration effectively.")
    add(SUBJECT, "Exploratory Testing", "Easy", "scenario",
        "During an exploratory session, a tester notices that the UI behaves differently on different screen sizes but this is not in scope for their charter. What should they do?",
        "Note the observation for a future session and stay focused on the current charter", "Ignore it completely", "Stop the current session to investigate", "Change the charter mid-session",
        "A", "Noting out-of-scope findings for future sessions maintains focus while capturing valuable observations.")

    # Scenario - Medium (5)
    add(SUBJECT, "Exploratory Testing", "Medium", "scenario",
        "A team has been running the same scripted regression tests for 6 months with no new defects found. The pesticide paradox is suspected. What complementary approach would help?",
        "Add exploratory testing sessions targeting areas around the regression suite to find unscripted defects", "Run the same tests faster", "Remove regression tests", "Stop testing",
        "A", "Exploratory testing complements stale regression suites by finding defects outside scripted scenarios.")
    add(SUBJECT, "Exploratory Testing", "Medium", "scenario",
        "A test lead needs to report exploratory testing metrics to management. What should they include?",
        "Number of sessions, time spent, charters covered, defects found by severity, and areas explored", "Only the number of bugs found", "Only time spent", "Nothing; exploratory testing is not measurable",
        "A", "Session-based metrics provide quantifiable data on exploratory testing effort and outcomes.")
    add(SUBJECT, "Exploratory Testing", "Medium", "scenario",
        "An exploratory tester wants to understand the payment flow of a complex application they have never used before. Which touring strategy would be most effective initially?",
        "The Guidebook Tour: follow the user documentation or help guides to understand basic flows first", "The Garbage Collector Tour", "Testing random features", "Skipping the payment flow",
        "A", "The Guidebook Tour helps testers learn the application through its documented workflows before deeper exploration.")
    add(SUBJECT, "Exploratory Testing", "Medium", "scenario",
        "During a 90-minute exploratory session, a tester spent 60 minutes setting up test data and only 30 minutes actually testing. How should this be addressed?",
        "Improve test data availability through pre-prepared datasets or better tooling to maximize actual testing time", "Accept the ratio", "Make sessions longer", "Skip data setup",
        "A", "Reducing setup overhead through prepared data sets maximizes the value of exploratory testing sessions.")
    add(SUBJECT, "Exploratory Testing", "Medium", "scenario",
        "A team wants to divide exploratory testing of a complex application among 4 testers without overlap. How should the work be organized?",
        "Create distinct charters for each tester covering different functional areas or perspectives", "Let everyone explore the same area", "Only one tester should explore", "No organization needed",
        "A", "Distinct charters for each tester ensure comprehensive coverage with minimal overlap.")

    # Scenario - Hard (4)
    add(SUBJECT, "Exploratory Testing", "Hard", "scenario",
        "An organization wants to measure the ROI of exploratory testing compared to scripted testing. What approach should they use?",
        "Compare defect detection rates, unique defects found, severity distribution, and time-to-find between both approaches over multiple releases", "ROI of exploratory testing cannot be measured", "Only count total bugs", "Compare team sizes",
        "A", "Comparing detection rates, unique finds, severity, and efficiency metrics between approaches demonstrates relative ROI.")
    add(SUBJECT, "Exploratory Testing", "Hard", "scenario",
        "A mission-critical healthcare system requires both exploratory and scripted testing for regulatory compliance. The regulator questions the rigor of exploratory testing. How should the QA manager justify it?",
        "Present SBTM documentation showing charters, session reports, coverage maps, and demonstrate how findings complement scripted testing", "Abandon exploratory testing", "Say the regulator is wrong", "Use only scripted testing",
        "A", "SBTM documentation provides auditable evidence of structured exploratory testing for regulatory compliance.")
    add(SUBJECT, "Exploratory Testing", "Hard", "scenario",
        "A team practices pair exploratory testing where two testers explore together. Some management considers this wasteful. What is the case for continuing this practice?",
        "Pair testing combines different perspectives, finds more diverse defects, enables knowledge transfer, and improves session quality", "It is indeed wasteful", "Only one tester should explore at a time", "Pair testing is only for developers",
        "A", "Pair exploratory testing leverages diverse perspectives and knowledge sharing to improve defect discovery.")
    add(SUBJECT, "Exploratory Testing", "Hard", "scenario",
        "A test manager wants to create an exploratory testing competency framework for the organization. What key competencies should it include?",
        "Critical thinking, domain knowledge, observation skills, test design ability, tool proficiency, and communication", "Only coding skills", "Only management skills", "Only defect reporting skills",
        "A", "A comprehensive competency framework covers cognitive, technical, domain, and communication skills.")

    # ===================== Usability Testing =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Usability Testing", "Easy", "mcq",
        "What is usability testing?",
        "Testing how easy and intuitive a product is for end users to use", "Testing the code structure", "Testing server performance", "Testing database queries",
        "A", "Usability testing evaluates how easily users can accomplish their goals using the product.")
    add(SUBJECT, "Usability Testing", "Easy", "mcq",
        "Who typically participates as subjects in usability testing?",
        "Representative end users of the product", "Only developers", "Only testers", "Only managers",
        "A", "Usability testing uses representative end users to get authentic feedback on the user experience.")
    add(SUBJECT, "Usability Testing", "Easy", "mcq",
        "What is a common metric used in usability testing?",
        "Task completion rate", "Lines of code", "Defect density", "Server uptime",
        "A", "Task completion rate measures the percentage of users who successfully complete a given task.")
    add(SUBJECT, "Usability Testing", "Easy", "mcq",
        "What is a usability issue?",
        "A problem that makes it difficult for users to accomplish their goals", "A code compilation error", "A server crash", "A database lock",
        "A", "Usability issues hinder the user's ability to efficiently and effectively use the product.")
    add(SUBJECT, "Usability Testing", "Easy", "mcq",
        "When should usability testing ideally begin?",
        "Early in the design process, even with prototypes or wireframes", "Only after full development", "Only in production", "Only during maintenance",
        "A", "Starting usability testing early with prototypes catches design issues when they are cheapest to fix.")
    add(SUBJECT, "Usability Testing", "Easy", "mcq",
        "What is a think-aloud protocol in usability testing?",
        "Users verbalize their thoughts while performing tasks, revealing their reasoning and confusion", "A team meeting format", "A code review technique", "A testing tool",
        "A", "Think-aloud protocol provides insight into user thought processes and pain points during task execution.")

    # MCQ - Medium (8)
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What is the difference between usability testing and user experience (UX) testing?",
        "Usability focuses on task efficiency; UX encompasses the entire user perception including emotion and satisfaction", "They are identical", "Usability is more comprehensive", "UX is only about visuals",
        "A", "Usability is a component of UX; UX also includes emotional response, satisfaction, and overall perception.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What is a heuristic evaluation in usability?",
        "Expert review of the interface against established usability principles (like Nielsen's heuristics)", "User testing in a lab", "Automated testing", "Performance benchmarking",
        "A", "Heuristic evaluation uses expert reviewers assessing against established usability guidelines.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What are Nielsen's 10 usability heuristics primarily used for?",
        "Evaluating user interface design against established usability principles", "Writing code", "Database design", "Network configuration",
        "A", "Nielsen's heuristics are guidelines for evaluating UI design quality and identifying usability issues.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "How many users are typically needed for usability testing to find most issues?",
        "5 users can uncover approximately 80% of usability issues according to Nielsen", "100 users minimum", "Only 1 user", "At least 50 users",
        "A", "Nielsen's research suggests 5 users typically reveal about 80% of usability problems.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What is an A/B test in the context of usability?",
        "Comparing two versions of a design to see which performs better with users", "Testing version A only", "Testing alphabetical order", "A type of unit test",
        "A", "A/B testing compares two design variants to determine which better achieves usability goals.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What is the System Usability Scale (SUS)?",
        "A standardized questionnaire providing a quick measure of perceived usability", "A system performance benchmark", "A code quality metric", "A deployment checklist",
        "A", "SUS is a 10-item questionnaire that produces a single score representing overall perceived usability.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What is moderated vs unmoderated usability testing?",
        "Moderated has a facilitator present; unmoderated uses tools for remote self-guided testing", "They are identical", "Moderated is always better", "Unmoderated is always better",
        "A", "Moderated testing allows real-time probing; unmoderated enables larger scale remote testing.")
    add(SUBJECT, "Usability Testing", "Medium", "mcq",
        "What is cognitive walkthrough in usability testing?",
        "An evaluation method where experts walk through tasks from the user's perspective to identify issues", "A physical walk through the office", "A code walkthrough", "A deployment process",
        "A", "Cognitive walkthrough evaluates learnability by simulating a user's thought process through tasks.")

    # MCQ - Hard (6)
    add(SUBJECT, "Usability Testing", "Hard", "mcq",
        "How does accessibility testing relate to usability testing?",
        "Accessibility ensures usability for people with disabilities; it is a subset of usability for inclusive design", "They are unrelated", "Accessibility replaces usability", "Accessibility is only about screen readers",
        "A", "Accessibility testing ensures the product is usable by people with various disabilities, extending usability to all users.")
    add(SUBJECT, "Usability Testing", "Hard", "mcq",
        "What is the Fitts's Law and how does it apply to usability testing?",
        "It predicts that larger, closer targets are faster to interact with, guiding button sizing and placement", "It measures code performance", "It calculates server load", "It predicts defect rates",
        "A", "Fitts's Law guides interface design by relating target size and distance to interaction time.")
    add(SUBJECT, "Usability Testing", "Hard", "mcq",
        "What is the role of eye-tracking in advanced usability testing?",
        "It reveals where users look, what they notice, and what they miss on the interface", "It tracks defects", "It monitors server performance", "It measures code coverage",
        "A", "Eye-tracking provides objective data about visual attention patterns for UI optimization.")
    add(SUBJECT, "Usability Testing", "Hard", "mcq",
        "How should usability test results be prioritized for development action?",
        "By impact on user goals, frequency of occurrence, and severity of the user experience degradation", "By random order", "By ease of fix only", "By developer preference",
        "A", "Prioritizing by impact, frequency, and severity ensures the most impactful usability issues are fixed first.")
    add(SUBJECT, "Usability Testing", "Hard", "mcq",
        "What is the challenge of measuring the ROI of usability testing?",
        "Benefits are often indirect (reduced support calls, increased conversion, lower training costs) and hard to attribute directly", "ROI is always obvious", "There is no ROI", "Only direct cost savings count",
        "A", "Usability ROI requires measuring indirect benefits like reduced support costs and increased user satisfaction.")
    add(SUBJECT, "Usability Testing", "Hard", "mcq",
        "How does cultural context affect usability testing?",
        "Different cultures have varying expectations for layout, color, navigation, and interaction patterns", "Culture has no effect", "Only language matters", "Usability is universal",
        "A", "Cultural differences affect usability expectations; testing should account for target audience cultural norms.")

    # Scenario - Easy (4)
    add(SUBJECT, "Usability Testing", "Easy", "scenario",
        "Users of a mobile app complain that buttons are too small to tap. What usability principle is being violated?",
        "Adequate touch target size for the input method", "Database design", "Server configuration", "Code structure",
        "A", "Mobile usability requires touch targets large enough for reliable finger interaction.")
    add(SUBJECT, "Usability Testing", "Easy", "scenario",
        "A website has a confusing navigation menu and users cannot find key features. What type of testing would identify this issue?",
        "Usability Testing", "Performance Testing", "Security Testing", "Load Testing",
        "A", "Usability testing with real users would reveal navigation confusion and information architecture issues.")
    add(SUBJECT, "Usability Testing", "Easy", "scenario",
        "A product manager wants feedback on a new design before development begins. Only wireframes are available. Can usability testing still be done?",
        "Yes, usability testing can be done on wireframes and prototypes", "No, only finished products can be tested", "No, only code can be tested", "No, usability testing requires servers",
        "A", "Usability testing on wireframes provides early feedback and prevents costly design changes later.")
    add(SUBJECT, "Usability Testing", "Easy", "scenario",
        "A user testing a web form gives up because they cannot figure out which fields are required. What usability issue is this?",
        "Poor visibility of required field indicators", "A server error", "A database problem", "A code bug",
        "A", "Failing to clearly indicate required fields violates the usability principle of visibility of system status.")

    # Scenario - Medium (5)
    add(SUBJECT, "Usability Testing", "Medium", "scenario",
        "An e-commerce site has a high cart abandonment rate at the checkout page. The team suspects usability issues. How should they investigate?",
        "Conduct usability testing of the checkout flow with task analysis, observe where users struggle, and collect feedback", "Add more features", "Reduce prices", "Change the server",
        "A", "Usability testing of the checkout flow with observation reveals specific pain points causing abandonment.")
    add(SUBJECT, "Usability Testing", "Medium", "scenario",
        "A company wants to compare two versions of their homepage to see which leads to more user sign-ups. What usability test approach is most suitable?",
        "A/B Testing with user sign-up as the primary metric", "Code review", "Load testing", "Security audit",
        "A", "A/B testing directly compares two designs measuring the conversion rate for the desired action.")
    add(SUBJECT, "Usability Testing", "Medium", "scenario",
        "A QA team needs to evaluate the usability of an internal tool used by 500 employees across 3 locations. In-person testing is not feasible for all. What approach should they use?",
        "Remote unmoderated usability testing using online tools supplemented by moderated sessions for a subset", "Cancel usability testing", "Test only at headquarters", "Use only surveys",
        "A", "Remote unmoderated testing scales across locations while moderated sessions provide deeper insights for a subset.")
    add(SUBJECT, "Usability Testing", "Medium", "scenario",
        "After usability testing, the team identified 30 usability issues. Resources allow fixing only 10 before release. How should they prioritize?",
        "Prioritize by impact on primary user workflows, frequency of occurrence, and severity", "Fix the easiest 10", "Fix randomly", "Fix the most recently found",
        "A", "Prioritizing by impact on key workflows and severity ensures the most valuable fixes are made first.")
    add(SUBJECT, "Usability Testing", "Medium", "scenario",
        "A healthcare application is being designed for elderly users who may have limited technical experience. What usability considerations are most critical?",
        "Larger fonts, high contrast, simple navigation, clear labels, and error prevention", "Flashy animations", "Complex menus", "Small text for more content",
        "A", "Elderly users benefit from larger text, high contrast, simple workflows, and clear error prevention.")

    # Scenario - Hard (4)
    add(SUBJECT, "Usability Testing", "Hard", "scenario",
        "A company wants to establish a usability testing practice from scratch. They have no UX team, limited budget, and time-critical releases. What phased approach should they adopt?",
        "Start with heuristic evaluations and guerrilla testing, then add structured usability testing as the practice matures", "Hire a full UX team immediately", "Skip usability testing entirely", "Only use automated tools",
        "A", "A phased approach starting with low-cost methods builds capability gradually within constraints.")
    add(SUBJECT, "Usability Testing", "Hard", "scenario",
        "A financial trading platform requires both speed (millisecond responses) and usability (clear interface for complex data). These goals sometimes conflict. How should usability testing balance these?",
        "Test with real traders to find the optimal balance between information density and clarity with performance constraints", "Prioritize speed over all usability", "Ignore performance in usability tests", "Test only with non-traders",
        "A", "Testing with actual users under realistic performance conditions reveals the optimal balance point.")
    add(SUBJECT, "Usability Testing", "Hard", "scenario",
        "A product is used by both novice and expert users. Novices need guidance while experts want shortcuts. Usability testing reveals both groups are dissatisfied. How should the design accommodate both?",
        "Implement progressive disclosure with default guided paths for novices and discoverable power features for experts", "Design only for novices", "Design only for experts", "Create two separate products",
        "A", "Progressive disclosure serves both audiences by layering complexity and providing multiple interaction paths.")
    add(SUBJECT, "Usability Testing", "Hard", "scenario",
        "A global product must pass usability testing for 8 different markets with varying cultural expectations, languages, and accessibility requirements. How should the usability testing strategy be structured?",
        "Core usability testing with universal tasks plus market-specific sessions addressing cultural, linguistic, and accessibility variations", "One-size-fits-all testing", "Test only the largest market", "Skip international usability testing",
        "A", "A layered approach with core universal testing plus market-specific sessions ensures comprehensive cross-cultural usability.")

    # ===================== Regression Testing =====================
    # MCQ - Easy (6)
    add(SUBJECT, "Regression Testing", "Easy", "mcq",
        "What is regression testing?",
        "Retesting to verify that changes have not broken existing functionality", "Testing new features only", "Testing for the first time", "Performance testing",
        "A", "Regression testing ensures that code changes (fixes, enhancements) have not adversely affected existing features.")
    add(SUBJECT, "Regression Testing", "Easy", "mcq",
        "When should regression testing be performed?",
        "After every code change, bug fix, or new feature addition", "Only at the end of the project", "Only before the first release", "Only once a year",
        "A", "Regression testing should follow every change to ensure existing functionality remains intact.")
    add(SUBJECT, "Regression Testing", "Easy", "mcq",
        "What is a regression test suite?",
        "A collection of test cases specifically selected to verify existing functionality after changes", "All test cases ever written", "Only new test cases", "Only failed test cases",
        "A", "A regression suite is a curated set of tests targeting areas likely affected by changes.")
    add(SUBJECT, "Regression Testing", "Easy", "mcq",
        "Why is regression testing important in software development?",
        "Code changes can unintentionally break existing features", "It is not important", "It only catches new defects", "It speeds up development",
        "A", "Regression testing catches unintended side effects of code changes that could break existing functionality.")
    add(SUBJECT, "Regression Testing", "Easy", "mcq",
        "Can regression testing be automated?",
        "Yes, regression testing is an ideal candidate for automation due to its repetitive nature", "No, it must always be manual", "Only partially", "Only for web applications",
        "A", "The repetitive, predictable nature of regression testing makes it highly suitable for automation.")
    add(SUBJECT, "Regression Testing", "Easy", "mcq",
        "What is the relationship between regression testing and smoke testing?",
        "Smoke testing is a subset of regression that provides quick verification; full regression is more comprehensive", "They are identical", "Smoke testing replaces regression", "Regression is faster than smoke",
        "A", "Smoke testing provides quick initial verification while regression testing provides thorough coverage of existing features.")

    # MCQ - Medium (8)
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "What strategies exist for selecting regression test cases?",
        "Retest all, selective, prioritized, and risk-based selection approaches", "Always retest everything", "Only test new features", "Random selection only",
        "A", "Multiple strategies balance coverage with efficiency: full retest, selective, prioritized, and risk-based.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "What is 'selective regression testing'?",
        "Running only a subset of regression tests that cover areas affected by the change", "Running all tests", "Running no tests", "Running only new tests",
        "A", "Selective regression identifies and runs only tests relevant to the specific code changes made.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "How does impact analysis help in regression testing?",
        "It identifies which areas of the application are affected by a change to target regression tests", "It measures test execution speed", "It counts defects", "It estimates project cost",
        "A", "Impact analysis maps code changes to affected functionality to guide efficient regression test selection.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "What is the challenge of maintaining a regression test suite over time?",
        "The suite grows continuously, increasing execution time and maintenance effort", "No challenges exist", "Suites shrink over time", "Maintenance is not needed",
        "A", "Growing regression suites require regular pruning, optimization, and maintenance to remain effective.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "What is test case prioritization in regression testing?",
        "Ordering test cases so the most critical or most likely to find defects run first", "Running tests alphabetically", "Running the newest tests last", "Random ordering",
        "A", "Prioritization ensures the most valuable tests run first, providing earlier feedback on critical areas.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "How does continuous integration (CI) affect regression testing?",
        "CI enables automated regression testing on every code commit for immediate feedback", "CI eliminates regression testing", "CI makes regression manual", "CI slows down regression",
        "A", "CI pipelines trigger automated regression tests on each commit, providing rapid quality feedback.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "What is the difference between partial and full regression testing?",
        "Partial tests only affected areas; full tests the entire application", "They are identical", "Partial is always better", "Full regression is never needed",
        "A", "Partial regression focuses on changed areas for efficiency; full regression covers everything for thorough verification.")
    add(SUBJECT, "Regression Testing", "Medium", "mcq",
        "When is full regression testing most necessary?",
        "Before major releases, after significant architectural changes, or when risk is high", "After every minor fix", "Only once in the project", "Never",
        "A", "Full regression is warranted for major releases or significant changes where broader impact is possible.")

    # MCQ - Hard (6)
    add(SUBJECT, "Regression Testing", "Hard", "mcq",
        "What is regression test minimization and how does it differ from prioritization?",
        "Minimization reduces the suite size permanently; prioritization reorders without removing tests", "They are the same", "Minimization adds tests", "Prioritization removes tests",
        "A", "Minimization permanently removes redundant tests; prioritization changes execution order to front-load value.")
    add(SUBJECT, "Regression Testing", "Hard", "mcq",
        "How can code coverage data be used to optimize regression testing?",
        "By identifying which tests cover changed code and selecting only those for regression", "Code coverage is not relevant", "By running all tests regardless", "By removing covered tests",
        "A", "Coverage data maps tests to code, enabling precise selection of relevant tests for changed areas.")
    add(SUBJECT, "Regression Testing", "Hard", "mcq",
        "What is the regression testing challenge in a microservices architecture?",
        "Changes in one service can cascade to dependent services requiring cross-service regression strategies", "No challenge exists", "Each service is independent", "Only UI regression is needed",
        "A", "Microservices interdependencies require regression testing that spans service boundaries.")
    add(SUBJECT, "Regression Testing", "Hard", "mcq",
        "What is the concept of 'test debt' in relation to regression testing?",
        "Accumulated gaps in the regression suite that increase the risk of undetected regressions over time", "Financial debt from testing tools", "The time testers owe", "Budget overruns",
        "A", "Test debt represents missing or outdated regression tests that increase the risk of escaped defects.")
    add(SUBJECT, "Regression Testing", "Hard", "mcq",
        "How does model-based regression testing work?",
        "Uses models of the system to automatically generate and select regression test cases based on changes", "It is a manual technique", "It does not exist", "It uses only UI models",
        "A", "Model-based testing generates regression tests from system models, adapting automatically to changes.")
    add(SUBJECT, "Regression Testing", "Hard", "mcq",
        "What is visual regression testing?",
        "Automated comparison of UI screenshots before and after changes to detect unintended visual differences", "Manual visual inspection", "Testing display resolution", "Testing color schemes manually",
        "A", "Visual regression testing uses automated screenshot comparison to detect unexpected UI changes.")

    # Scenario - Easy (4)
    add(SUBJECT, "Regression Testing", "Easy", "scenario",
        "A developer fixed a bug in the login page. The tester wants to make sure the fix did not break the password reset feature. What type of testing should they do?",
        "Regression Testing on the password reset and related authentication features", "Only test the login fix", "Skip testing password reset", "Performance testing",
        "A", "Regression testing of related features ensures the fix did not introduce side effects.")
    add(SUBJECT, "Regression Testing", "Easy", "scenario",
        "A QA team has 1000 test cases in their regression suite. Executing all takes 5 days. They need results in 1 day. What should they do?",
        "Prioritize and select the most critical test cases based on risk and change impact", "Skip regression testing", "Run all 1000 in one day anyway", "Randomly select 200 tests",
        "A", "Risk-based prioritization ensures the most important tests run within the available time.")
    add(SUBJECT, "Regression Testing", "Easy", "scenario",
        "After a software update, users report that a feature that worked before is now broken. What does this indicate about the regression testing process?",
        "The regression test suite did not cover the affected feature or the test was not executed", "Regression testing is useless", "The feature was never working", "Users are confused",
        "A", "The regression gap indicates either missing test coverage or test execution failure for that feature.")
    add(SUBJECT, "Regression Testing", "Easy", "scenario",
        "A team automates their regression suite and can now run it overnight instead of over 3 days manually. What benefit does this provide?",
        "Faster feedback on quality, freeing testers for exploratory and new feature testing", "No benefit", "Slower testing", "More defects",
        "A", "Automation speeds regression feedback and frees testers for higher-value manual testing activities.")

    # Scenario - Medium (5)
    add(SUBJECT, "Regression Testing", "Medium", "scenario",
        "A monolithic application is being refactored into microservices. The existing regression suite is tightly coupled to the monolith. How should the regression strategy evolve?",
        "Create service-level regression suites for each microservice plus integration regression tests at boundaries", "Keep the monolithic regression suite", "Delete all regression tests", "Only test the UI",
        "A", "Microservice migration requires decomposed regression suites per service with integration testing between services.")
    add(SUBJECT, "Regression Testing", "Medium", "scenario",
        "A team notices that 40% of their regression test failures are due to test environment issues, not actual defects. How should this be addressed?",
        "Stabilize the test environment with better configuration management and add environment health checks before regression runs", "Ignore false failures", "Remove flaky tests", "Stop regression testing",
        "A", "Environment stability and health checks reduce false regression failures and improve test reliability.")
    add(SUBJECT, "Regression Testing", "Medium", "scenario",
        "The regression suite execution time has grown from 2 hours to 12 hours over a year. What optimization strategies should be applied?",
        "Parallelize execution, remove redundant tests, optimize slow tests, and implement selective regression", "Accept the 12-hour runtime", "Delete half the tests randomly", "Run regression less frequently",
        "A", "Multiple optimization strategies including parallelization and test minimization reduce execution time.")
    add(SUBJECT, "Regression Testing", "Medium", "scenario",
        "A release contains 50 bug fixes across 10 modules. The QA team needs to decide between full regression and selective regression. What factors should guide the decision?",
        "Number of affected modules, interconnections between modules, change complexity, and risk level", "Only team availability", "Only the deadline", "Only defect count",
        "A", "The decision should consider scope of changes, module dependencies, risk, and available time.")
    add(SUBJECT, "Regression Testing", "Medium", "scenario",
        "A CI pipeline runs regression tests on every commit but developers complain the 4-hour suite blocks their work. How should the regression strategy be adjusted?",
        "Run a fast critical subset on each commit and full regression nightly or on merge requests", "Remove regression from CI", "Let developers skip tests", "Make the pipeline optional",
        "A", "Tiered regression with fast checks on commits and full suites on nightly/merge provides balanced feedback.")

    # Scenario - Hard (4)
    add(SUBJECT, "Regression Testing", "Hard", "scenario",
        "A team discovers that their automated regression tests have not been updated in 6 months while the application has changed significantly. Many tests pass but no longer validate meaningful scenarios. What is this problem called and how should it be resolved?",
        "Test rot or test decay; resolve by auditing the suite against current requirements and updating or removing stale tests", "The tests are fine", "Delete all tests and start over", "Run them more often",
        "A", "Test rot occurs when tests become outdated; systematic audit and refresh restores suite effectiveness.")
    add(SUBJECT, "Regression Testing", "Hard", "scenario",
        "An organization has 50,000 automated regression tests. Running all takes 24 hours. They need to identify the minimal subset that provides equivalent defect detection. What approach should they use?",
        "Test suite minimization using coverage analysis, historical defect detection data, and risk-based filtering", "Run all 50000 every time", "Randomly select 10%", "Delete the oldest tests",
        "A", "Data-driven minimization using coverage and defect detection history identifies the most effective subset.")
    add(SUBJECT, "Regression Testing", "Hard", "scenario",
        "A team uses visual regression testing but gets many false positives due to dynamic content (timestamps, ads, user data). How should this be handled?",
        "Implement dynamic content masking, tolerance thresholds, and exclusion zones for known variable areas", "Stop visual regression testing", "Ignore all differences", "Only test static pages",
        "A", "Content masking and tolerance thresholds reduce false positives while maintaining visual regression value.")
    add(SUBJECT, "Regression Testing", "Hard", "scenario",
        "A company wants to implement AI-powered regression test selection that learns from historical test results to predict which tests are most likely to fail. What data would the AI model need?",
        "Historical test results, code change patterns, defect data, code coverage mappings, and dependency graphs", "Only test names", "Only pass/fail data", "No data needed",
        "A", "AI-powered test selection needs rich historical data about tests, changes, defects, and code relationships.")

    # ===================== UAT =====================
    # MCQ - Easy (6)
    add(SUBJECT, "UAT", "Easy", "mcq",
        "What does UAT stand for?",
        "User Acceptance Testing", "Universal Application Testing", "Unified Automation Testing", "User Automation Test",
        "A", "UAT stands for User Acceptance Testing, where end users validate the system meets their needs.")
    add(SUBJECT, "UAT", "Easy", "mcq",
        "Who typically performs UAT?",
        "End users or business stakeholders", "Developers", "Database administrators", "Network engineers",
        "A", "UAT is performed by actual end users or their representatives who will use the system.")
    add(SUBJECT, "UAT", "Easy", "mcq",
        "What is the primary purpose of UAT?",
        "To verify the system meets business requirements and is ready for production use", "To find all bugs", "To test performance", "To review code",
        "A", "UAT validates that the system satisfies business needs and is acceptable for production deployment.")
    add(SUBJECT, "UAT", "Easy", "mcq",
        "When in the SDLC does UAT typically occur?",
        "After system testing and before production deployment", "Before development", "During coding", "After deployment",
        "A", "UAT occurs after system testing, as the final validation before the system goes to production.")
    add(SUBJECT, "UAT", "Easy", "mcq",
        "What happens if UAT fails?",
        "The system is not deployed; issues are documented and sent back for resolution", "The system is deployed anyway", "Testing stops permanently", "The project is cancelled",
        "A", "Failed UAT means the system does not meet user expectations and needs remediation before release.")
    add(SUBJECT, "UAT", "Easy", "mcq",
        "What is a UAT sign-off?",
        "Formal approval by business stakeholders that the system is acceptable for production", "A developer code review", "A test plan approval", "A project kickoff",
        "A", "UAT sign-off is the formal business acceptance that authorizes production deployment.")

    # MCQ - Medium (8)
    add(SUBJECT, "UAT", "Medium", "mcq",
        "What is the difference between alpha testing and UAT?",
        "Alpha is internal testing at the developer site; UAT is business user validation against requirements", "They are identical", "Alpha is done after UAT", "UAT is done by developers",
        "A", "Alpha testing is internal; UAT is formal business validation typically done by actual users.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "What should a UAT test plan include?",
        "Business scenarios, acceptance criteria, test data, schedule, participants, and sign-off process", "Only test cases", "Only the schedule", "Only defect reports",
        "A", "A UAT plan covers all aspects needed for structured business validation including acceptance criteria.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "How should UAT test cases differ from system test cases?",
        "UAT test cases focus on business workflows and user scenarios rather than technical specifications", "They should be identical", "UAT cases are more technical", "UAT cases test only the database",
        "A", "UAT tests validate business processes from the user's perspective, not technical implementation details.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "What is the role of the QA team during UAT?",
        "Supporting users with environment setup, defect logging, and coordination while users drive testing", "Performing all the testing themselves", "No role at all", "Writing code",
        "A", "QA supports UAT by facilitating the process while business users execute the actual validation.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "What is business acceptance testing (BAT)?",
        "Testing that validates the system meets business objectives and regulatory requirements", "Testing that validates code syntax", "Testing network performance", "Testing hardware compatibility",
        "A", "BAT validates business objectives and may include regulatory compliance verification.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "How should UAT defects be categorized differently from system testing defects?",
        "By business impact and user workflow disruption rather than technical severity alone", "Same categories as system testing", "No categorization needed", "Only by priority",
        "A", "UAT defects are categorized by business impact to reflect the user-centric nature of acceptance testing.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "What is the risk of skipping UAT?",
        "The system may not meet actual business needs, leading to user rejection and costly post-deployment fixes", "No risk", "Faster deployment", "Better quality",
        "A", "Skipping UAT risks deploying a system that does not meet business needs, causing user dissatisfaction.")
    add(SUBJECT, "UAT", "Medium", "mcq",
        "What is contract acceptance testing?",
        "Verifying that the delivered system meets the contractual agreements and specifications", "Testing employment contracts", "Testing network contracts", "Testing license agreements",
        "A", "Contract acceptance testing validates deliverables against contractual obligations and acceptance criteria.")

    # MCQ - Hard (6)
    add(SUBJECT, "UAT", "Hard", "mcq",
        "How should UAT be managed when business users have limited availability?",
        "Prioritize critical business scenarios, pre-prepare test data, schedule focused sessions, and provide clear documentation", "Cancel UAT", "Have testers do it instead", "Delay indefinitely",
        "A", "Maximizing limited user time requires preparation, prioritization, and efficient session management.")
    add(SUBJECT, "UAT", "Hard", "mcq",
        "What is operational acceptance testing (OAT)?",
        "Testing operational readiness including backup/recovery, failover, monitoring, and maintenance procedures", "Testing user workflows", "Testing UI design", "Testing code structure",
        "A", "OAT validates that operational support processes are ready for production deployment.")
    add(SUBJECT, "UAT", "Hard", "mcq",
        "How does UAT differ in Agile versus Waterfall methodologies?",
        "In Agile, UAT is continuous with each increment; in Waterfall, it is a single phase near the end", "No difference", "Agile does not have UAT", "Waterfall UAT is continuous",
        "A", "Agile integrates UAT throughout sprints; Waterfall treats it as a distinct final phase.")
    add(SUBJECT, "UAT", "Hard", "mcq",
        "What is the challenge of UAT for enterprise systems with complex integrations?",
        "Ensuring realistic end-to-end business scenarios that span multiple integrated systems with consistent test data", "No challenges", "Only UI testing matters", "Integration does not affect UAT",
        "A", "Enterprise UAT must validate business processes that cross system boundaries with realistic integrated scenarios.")
    add(SUBJECT, "UAT", "Hard", "mcq",
        "How should UAT handle conflicting feedback from different user groups?",
        "Facilitate prioritization meetings with stakeholders to resolve conflicts based on business objectives and user impact", "Accept all feedback equally", "Ignore conflicting feedback", "Let developers decide",
        "A", "Stakeholder meetings resolve conflicts by aligning decisions with business priorities and user impact.")
    add(SUBJECT, "UAT", "Hard", "mcq",
        "What metrics should be tracked during UAT to assess readiness for go-live?",
        "Acceptance criteria pass rate, critical defect count, business scenario completion, and stakeholder satisfaction", "Only defect count", "Only time spent", "Only sign-off status",
        "A", "Multiple UAT metrics provide a holistic view of readiness including criteria, defects, completion, and satisfaction.")

    # Scenario - Easy (4)
    add(SUBJECT, "UAT", "Easy", "scenario",
        "An HR department is getting a new employee management system. Before deployment, the HR team needs to verify it handles their daily tasks. What type of testing is this?",
        "User Acceptance Testing (UAT)", "Unit Testing", "Performance Testing", "Code Review",
        "A", "UAT involves end users (HR team) validating the system meets their operational needs.")
    add(SUBJECT, "UAT", "Easy", "scenario",
        "During UAT, a business user finds that a report shows incorrect totals. They are unsure how to report this issue. What should the QA team do?",
        "Provide a simple defect reporting mechanism and assist the user in logging the issue", "Tell the user to fix it", "Ignore the issue", "Close UAT immediately",
        "A", "QA should support users with easy defect reporting tools and assistance during UAT.")
    add(SUBJECT, "UAT", "Easy", "scenario",
        "A UAT participant says the system works correctly but is too slow for their workflow. Should this be logged as a UAT issue?",
        "Yes, performance that impacts business workflows is a valid UAT concern", "No, performance is not UAT scope", "No, only functional issues count", "No, users should not complain about speed",
        "A", "Any issue affecting the user's ability to work effectively is a valid UAT finding.")
    add(SUBJECT, "UAT", "Easy", "scenario",
        "The project deadline is tomorrow but UAT has not been completed. The PM wants to deploy anyway. What should the QA lead advise?",
        "Advise against deployment and communicate the risks of releasing without completed UAT", "Deploy immediately", "Complete UAT in production", "Skip UAT permanently",
        "A", "Deploying without completed UAT risks user rejection and post-deployment issues; risks must be communicated.")

    # Scenario - Medium (6)
    add(SUBJECT, "UAT", "Medium", "scenario",
        "A banking application's UAT involves validating 200 business scenarios across 5 departments. Each department has only 2 days available. How should UAT be organized?",
        "Prioritize critical scenarios per department, pre-prepare test data, and schedule parallel sessions with QA support", "Test all 200 scenarios in sequence", "Let only one department test", "Skip less important departments",
        "A", "Parallel sessions with prioritized scenarios and preparation maximize limited user availability.")
    add(SUBJECT, "UAT", "Medium", "scenario",
        "UAT participants report that the system meets functional requirements but the user interface is confusing. Should this block UAT sign-off?",
        "It depends on whether usability is included in the acceptance criteria; if so, it should be addressed", "No, UI is not important", "Always block", "Never block",
        "A", "Whether usability issues block sign-off depends on the defined acceptance criteria for UAT.")
    add(SUBJECT, "UAT", "Medium", "scenario",
        "During UAT of a CRM system, sales managers want additional features not in the original requirements. How should these requests be handled?",
        "Log them as enhancement requests separate from UAT defects and evaluate for future releases", "Add them immediately", "Ignore them", "Cancel UAT until they are built",
        "A", "New feature requests during UAT should be tracked separately and evaluated for future release inclusion.")
    add(SUBJECT, "UAT", "Medium", "scenario",
        "A UAT tester reports that data migration from the old system has errors. Some customer records are corrupted. How should this be handled?",
        "Halt UAT for affected data areas, investigate the migration issue, fix data, and re-run affected UAT scenarios", "Continue UAT with corrupted data", "Ignore data issues", "Deploy anyway",
        "A", "Data migration errors invalidate UAT results for affected areas and must be resolved before resuming.")
    add(SUBJECT, "UAT", "Medium", "scenario",
        "Multiple UAT participants provide conflicting feedback on the same feature. One says it works correctly while another says it does not. What should the QA coordinator do?",
        "Investigate by understanding both users' scenarios, test data, and steps to determine if it is a legitimate defect", "Believe the first user", "Believe the second user", "Ignore the conflict",
        "A", "Investigating both perspectives reveals whether the discrepancy is a defect or a difference in usage scenarios.")
    add(SUBJECT, "UAT", "Medium", "scenario",
        "A company outsources software development. The contract requires UAT to be completed within 2 weeks. At the end of week 1, only 40% of scenarios are tested due to quality issues. What options should be considered?",
        "Request timeline extension, prioritize remaining critical scenarios, and negotiate contract terms based on quality findings", "Accept the current state", "Skip remaining scenarios", "Blame the vendor",
        "A", "Quality issues require transparent communication and negotiation on timeline and acceptance criteria.")

    # Scenario - Hard (4)
    add(SUBJECT, "UAT", "Hard", "scenario",
        "An organization is deploying an ERP system across 20 countries with different regulatory, language, and business process requirements. How should UAT be structured to cover all variants?",
        "Core UAT for shared functionality with country-specific UAT sessions for local regulations, language, and processes", "One UAT for all countries", "UAT only in headquarters", "Skip country-specific testing",
        "A", "A layered UAT approach with core and country-specific testing ensures both global and local requirements are validated.")
    add(SUBJECT, "UAT", "Hard", "scenario",
        "A UAT has been signed off but within the first week of production, critical issues surface that were not caught. Investigation reveals UAT scenarios did not cover real production data volumes. What process improvement is needed?",
        "Include production-representative data volumes and edge cases in UAT test data to better simulate real conditions", "Remove UAT from the process", "Increase UAT duration only", "Test only with production data",
        "A", "UAT test data must represent real production volumes and patterns to catch volume-related issues.")
    add(SUBJECT, "UAT", "Hard", "scenario",
        "A SaaS product serves multiple tenants with different configurations. UAT for one tenant's configuration passes but another's fails. How should multi-tenant UAT be managed?",
        "Implement configuration-specific UAT tracks with shared core validation and tenant-specific scenario sets", "Test only one tenant", "Use the same tests for all tenants", "Skip failing tenant",
        "A", "Multi-tenant SaaS requires both shared and tenant-specific UAT scenarios to cover configuration variations.")
    add(SUBJECT, "UAT", "Hard", "scenario",
        "An organization wants to shift from document-heavy UAT to a more Agile UAT approach. Business users are accustomed to formal sign-off processes. How should the transition be managed?",
        "Gradually introduce sprint-level UAT with lightweight acceptance criteria while maintaining formal sign-off for major milestones", "Eliminate all sign-offs immediately", "Keep the old process", "Stop doing UAT",
        "A", "Gradual transition preserves formal governance at key milestones while introducing Agile practices incrementally.")

    return questions


def main():
    questions = build_questions()
    df = pd.DataFrame(questions)

    cols = ["id", "subject", "topic", "difficulty", "type", "question",
            "option_a", "option_b", "option_c", "option_d", "correct_answer",
            "explanation", "code_snippet"]
    df = df[cols]

    output_path = r"D:\HackerRankSimulation\question_bank\manual_testing_questions.csv"
    df.to_csv(output_path, index=False, quoting=csv.QUOTE_ALL)
    print(f"CSV written to {output_path}")

    # Verification
    verify_df = pd.read_csv(output_path)
    print(f"\nTotal rows: {len(verify_df)}")
    print(f"\nType breakdown:")
    print(verify_df["type"].value_counts().to_string())
    print(f"\nDifficulty breakdown:")
    print(verify_df["difficulty"].value_counts().to_string())
    print(f"\nType x Difficulty breakdown:")
    print(verify_df.groupby(["type", "difficulty"]).size().to_string())
    print(f"\nTopics covered: {verify_df['topic'].nunique()}")
    print(verify_df["topic"].value_counts().to_string())
    print(f"\nUnique questions: {verify_df['question'].nunique()}")
    print(f"\nCode snippet empty check: {(verify_df['code_snippet'] == '').all() or verify_df['code_snippet'].isna().all()}")


if __name__ == "__main__":
    main()
