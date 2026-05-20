export type UssdStepType = 'input' | 'choice' | 'final' | 'dynamic-lookup';

export interface UssdMenuScreen {
  text: string;
  type: UssdStepType;
  options?: Record<number, string>;
  next?: string;
  property?: string;
}

export const ussdMenus: Record<string, UssdMenuScreen> = {
  welcome: {
    text: `Welcome to Foaman\nChoose language\n1. English\n2. Kiswahili`,
    type: 'choice',
    options: { 1: "selectPersona", 2: "selectPersona" },
  },
  // Unified Onboarding/Persona selection step
  selectPersona: {
    text: `Join Foaman as:\n1. Customer (Build/Renovate)\n2. Fundi (Skilled Worker)\n3. Employer (Contractor/Supplier)`,
    type: 'choice',
    options: {
      1: "customerOnboard",
      2: "workerOnboard",
      3: "employerOnboard"
    }
  },
  // --- Customer Flow ---
  customerOnboard: {
    text: `Foaman Customer Onboarding\n1. Register Name\n2. Main Menu`,
    type: 'choice',
    options: { 1: "customerName", 2: "mainMenu" },
  },
  customerName: {
    text: `Enter your Full Name:`,
    type: 'input',
    property: 'fullName',
    next: 'customerLocation',
  },
  customerLocation: {
    text: `Enter your Location (e.g., Roysambu, Juja):`,
    type: 'input',
    property: 'location',
    next: 'mainMenu',
  },
  // --- Main Menu (Renamed Option 3) ---
  mainMenu: {
    text: `Foaman Menu\n1. Onboard Profile\n2. Apply as Worker (Fundi)\n3. Request a Fundi\n4. Suppliers Market\n5. Ready to Occupy\n0. Exit`,
    type: 'choice',
    options: {
      1: "selectPersona",
      2: "workerSkillInput", // Route directly to skill entry
      3: "jobSkillInput",    // Route directly to skill entry
    },
  },
  // --- Worker Skill Lookup Step ---
  workerSkillInput: {
    text: `What is your primary skill?\n(e.g., Plumber, Mason, Electrician)`,
    type: 'input',
    property: 'typedSkill',
    next: 'workerSkillLookup', // Triggers backend lookups
  },
  workerSkillLookup: {
    text: `Confirm your skill profile:\n`, // Populated dynamically by engine
    type: 'dynamic-lookup',
    property: 'confirmedSkill',
    next: 'workerIdNumber'
  },
  workerIdNumber: {
    text: `Enter your National ID Number:`,
    type: 'input',
    property: 'idNumber',
    next: 'workerSuccess',
  },
  workerSuccess: {
    text: `Foaman registration complete! We will verify your profile within 24 hours.`,
    type: 'final',
  },
  // --- Request a Fundi Skill Lookup Step ---
  jobSkillInput: {
    text: `What kind of Fundi do you need?\n(e.g., Painter, Welder, Carpenter)`,
    type: 'input',
    property: 'requestedSkill',
    next: 'jobSkillLookup',
  },
  jobSkillLookup: {
    text: `Select matching category:\n`, // Populated dynamically by engine
    type: 'dynamic-lookup',
    property: 'matchedSkill',
    next: 'jobLocation',
  },
  jobLocation: {
    text: `Enter job location:`,
    type: 'input',
    property: 'jobLocation',
    next: 'jobPosted',
  },
  jobPosted: {
    text: `Fundi request broadcasted! Nearby certified matches will contact you.`,
    type: 'final',
  },
};