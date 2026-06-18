export type UssdStepType = 'input' | 'choice' | 'final' | 'dynamic-lookup' | 'payment';

export type PaymentActionKey = 'JOB_POSTING' | 'WORKER_VERIFICATION' | 'SUPPLIER_LISTING';

export interface UssdMenuScreen {
  text: string;
  type: UssdStepType;
  options?: Record<number, string>;
  next?: string;
  property?: string;
  paymentAction?: PaymentActionKey;
  amount?: number;
}

export const ussdMenus: Record<string, UssdMenuScreen> = {
  // --- INITIAL CHECKPOINT ---
  welcome: {
    text: "Welcome to Foaman\nChoose language\n1. English\n2. Kiswahili",
    type: "choice",
    options: {
      1: "selectPersona",
      2: "selectPersona"
    }
  },

  // --- UNIFIED ONBOARDING ENTRY ---
  selectPersona: {
    text: "Join Foaman as:\n1. Customer (Build/Renovate)\n2. Fundi (Skilled Worker)\n3. Employer (Contractor/Supplier)",
    type: "choice",
    options: {
      1: "customerOnboard",
      2: "workerOnboard",
      3: "employerOnboard"
    }
  },

  // --- CUSTOMER FLOW ---
  customerOnboard: {
    text: "Foaman Customer Onboarding\n1. Register Name\n2. Main Menu",
    type: "choice",
    options: {
      1: "customerName",
      2: "mainMenu"
    }
  },
  customerName: {
    text: "Enter your Full Name:",
    type: "input",
    property: "fullName",
    next: "customerLocation"
  },
  customerLocation: {
    text: "Enter your Location (e.g., Roysambu, Juja):",
    type: "input",
    property: "location",
    next: "mainMenu"
  },

  // --- EMPLOYER FLOW ---
  employerOnboard: {
    text: "Foaman Employer Onboarding\n1. Register Company/Name\n2. Main Menu",
    type: "choice",
    options: {
      1: "employerName",
      2: "mainMenu"
    }
  },
  employerName: {
    text: "Enter Company or Employer Name:",
    type: "input",
    property: "employerName",
    next: "employerLocation"
  },
  employerLocation: {
    text: "Enter your Business Location:",
    type: "input",
    property: "employerLocation",
    next: "mainMenu"
  },

  // --- MAIN MENU ---
  mainMenu: {
    text: "Foaman Menu\n1. Onboard Profile\n2. Apply as Worker (Fundi)\n3. Request a Fundi\n4. Suppliers Market\n5. Ready to Occupy\n0. Exit",
    type: "choice",
    options: {
      1: "selectPersona",
      2: "workerName", // Changed entry point to capture name first
      3: "jobSkillInput",
      4: "suppliersMarket",
      5: "readyToOccupy",
      0: "exitMenu"
    }
  },

  // --- APPLY AS WORKER (FUNDI) FLOW WITH NAME & DB LOOKUP ---
  workerOnboard: {
    text: "Welcome Fundi! Let's set up your profile.\n1. Register Profile\n2. Back to Main Menu",
    type: "choice",
    options: {
      1: "workerName",
      2: "mainMenu"
    }
  },
  workerName: {
    text: "Enter your Full Name:",
    type: "input",
    property: "fullName",
    next: "workerLocation"
  },
  workerLocation: {
    text: "Enter your Location (e.g., Kahawa West, Pipeline):",
    type: "input",
    property: "location",
    next: "workerSkillInput"
  },
  workerSkillInput: {
    text: "What is your primary skill?\n(e.g., Plumber, Mason, Electrician)",
    type: "input",
    property: "typedSkill",
    next: "workerSkillLookup"
  },
  workerSkillLookup: {
    text: "Confirm your skill profile:\n",
    type: "dynamic-lookup",
    property: "confirmedSkill",
    next: "workerIdNumber"
  },
  workerIdNumber: {
    text: "Enter your National ID Number:",
    type: "input",
    property: "idNumber",
    next: "workerSuccess"
  },
  workerSuccess: {
    text: "Fundi registration complete! We will verify your profile within 24 hours.",
    type: "final"
  },

  // --- REQUEST A FUNDI FLOW WITH DB LOOKUP ---
  jobSkillInput: {
    text: "What kind of Fundi do you need?\n(e.g., Painter, Welder, Carpenter)",
    type: "input",
    property: "requestedSkill",
    next: "jobSkillLookup"
  },
  jobSkillLookup: {
    text: "Select matching category:\n",
    type: "dynamic-lookup",
    property: "matchedSkill",
    next: "jobLocation"
  },
  jobLocation: {
    text: "Enter job location:",
    type: "input",
    property: "jobLocation",
    next: "jobPayment"
  },
  jobPayment: {
    text: "Pay KES 50 via M-Pesa to post your Fundi request.\nWe will send a prompt to your phone.",
    type: "payment",
    paymentAction: "JOB_POSTING",
    amount: 50,
    next: "jobPosted"
  },
  jobPosted: {
    text: "Fundi request broadcasted! Nearby certified matches will contact you.",
    type: "final"
  },

  // --- SUPPLEMENTARY PLACEHOLDER SECTIONS ---
  suppliersMarket: {
    text: "Welcome to Suppliers Market.\n1. View Materials\n2. Back to Menu",
    type: "choice",
    options: {
      1: "viewMaterials",
      2: "mainMenu"
    }
  },
  viewMaterials: {
    text: "1. Cement\n2. Ballast\n3. Steel T bars\n0. Back",
    type: "choice",
    options: {
      0: "mainMenu"
    }
  },
  readyToOccupy: {
    text: "Explore verified listings ready to occupy.\n1. View Houses\n2. Back to Menu",
    type: "choice",
    options: {
      1: "viewHouses",
      2: "mainMenu"
    }
  },
  viewHouses: {
    text: "1. 1 Bedroom Roysambu - KES 15,000\n2. 2 Bedroom Juja - KES 22,000\n0. Back",
    type: "choice",
    options: {
      0: "mainMenu"
    }
  },
  exitMenu: {
    text: "Thank you for choosing Foaman. Jenga na sisi!",
    type: "final"
  }
};