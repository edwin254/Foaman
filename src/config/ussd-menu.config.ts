/**
 * FOAMAN USSD CONFIGURATION
 * Logic: Sequential Data Capture with State Persistence
 */

export type UssdStepType = 'input' | 'choice' | 'final';

interface UssdMenuScreen {
  text: string;
  type: UssdStepType;
  options?: Record<number, string>; // Used for 'choice' type
  next?: string; // Used for 'input' type to define the sequential jump
  property?: string; // The database field this input populates
}

export const ussdMenus: Record<string, UssdMenuScreen> = {
  // --- START ---
  welcome: {
    text: `Welcome to Foaman\nChoose language\n1. English\n2. Kiswahili`,
    type: 'choice',
    options: { 1: "en", 2: "sw" },
  },

  main: {
    text: `Foaman: Building & Construction\n1. Onboard as Customer\n2. Apply as Worker (Fundi)\n3. Advertise a Job\n4. Suppliers Market\n5. Ready to Occupy (Housing)\n6. My Requests\n7. Settings`,
    type: 'choice',
    options: {
      1: "customerName",
      2: "workerName",
      3: "jobSkill",
      4: "supplierMarket",
      5: "houseType",
      6: "myRequests",
      7: "settings",
    },
  },

  // --- 1. CUSTOMER ONBOARDING (SEQUENTIAL) ---
  customerName: {
    text: `Foaman Onboarding\nEnter your Full Name:`,
    type: 'input',
    property: 'fullName',
    next: 'customerLocation',
  },
  customerLocation: {
    text: `Enter your Location:\n(e.g., Roysambu, Kasarani)`,
    type: 'input',
    property: 'location',
    next: 'customerComplete',
  },
  customerComplete: {
    text: `Profile saved successfully!\n1. Advertise a Job\n2. Main Menu`,
    type: 'choice',
    options: { 1: "jobSkill", 2: "main" },
  },

  // --- 2. WORKER (FUNDI) APPLICATION (SEQUENTIAL) ---
  workerName: {
    text: `Worker Application\nEnter your Full Name:`,
    type: 'input',
    property: 'fullName',
    next: 'workerId',
  },
  workerId: {
    text: `Enter your National ID Number:`,
    type: 'input',
    property: 'idNumber',
    next: 'workerSkill',
  },
  workerSkill: {
    text: `Select your Primary Skill:\n1. Plumber\n2. Electrician\n3. Carpenter\n4. Mason\n5. Painter`,
    type: 'choice',
    options: { 1: "workerLocation", 2: "workerLocation", 3: "workerLocation", 4: "workerLocation", 5: "workerLocation" },
  },
  workerLocation: {
    text: `Enter your current Work Area:\n(e.g., Kahawa West)`,
    type: 'input',
    property: 'location',
    next: 'workerSubmit',
  },
  workerSubmit: {
    text: `Submit Application?\n1. Confirm\n0. Cancel`,
    type: 'choice',
    options: { 1: "workerSuccess", 0: "main" },
  },
  workerSuccess: {
    text: `Application submitted.\nStatus: Pending Verification.\nUpload ID to WhatsApp: 0731866331`,
    type: 'final',
  },

  // --- 3. ADVERTISE A JOB (SEQUENTIAL) ---
  jobSkill: {
    text: `What professional do you need?\n1. Plumber\n2. Electrician\n3. Mason\n4. Painter\n5. Interior Deco`,
    type: 'choice',
    options: { 1: "jobLocation", 2: "jobLocation", 3: "jobLocation", 4: "jobLocation", 5: "jobLocation" },
  },
  jobLocation: {
    text: `Enter Job Location:\n(e.g., Marda Estate)`,
    type: 'input',
    property: 'jobLocation',
    next: 'jobDescription',
  },
  jobDescription: {
    text: `Enter short description of the work:`,
    type: 'input',
    property: 'description',
    next: 'jobConfirm',
  },
  jobConfirm: {
    text: `Post this job?\n1. Confirm & Match\n0. Cancel`,
    type: 'choice',
    options: { 1: "jobPosted", 0: "main" },
  },
  jobPosted: {
    text: `Job posted! We are matching you with local pros.\nYou will receive an SMS shortly.`,
    type: 'final',
  },

  // --- 4. SUPPLIER MARKET (PAGINATED) ---
  supplierMarket: {
    text: `Foaman Suppliers\n1. Gen. Hardwares\n2. Cement\n3. Paints\n4. Steel\n5. Sand\n6. Ballast\n7. Stones\n8. NEXT (10 Airtime)`,
    type: 'choice',
    options: { 1: "supplierList", 2: "supplierList", 8: "supplierMarketP2" },
  },
  supplierMarketP2: {
    text: `Foaman Suppliers P2\n1. Timber\n2. Ironsheets\n3. Ndarugo stones\n4. Excavators\n0. Back`,
    type: 'choice',
    options: { 1: "supplierList", 0: "supplierMarket" },
  },
  supplierList: {
    text: `Available Suppliers\n1. Francis M. (Kasarani)\n2. Paul M. (Roysambu)\n8. View Contacts (10 Airtime)`,
    type: 'choice',
    options: { 1: "premiumCheck", 2: "premiumCheck", 8: "premiumCheck" },
  },

  // --- 5. READY TO OCCUPY (REAL ESTATE) ---
  houseType: {
    text: `Find Housing\n1. Mansionette\n2. 3-Bedroom\n3. 1-Bedroom\n4. Bedsitter\n0. Back`,
    type: 'choice',
    options: { 1: "houseSearchLoc", 2: "houseSearchLoc", 3: "houseSearchLoc", 4: "houseSearchLoc", 0: "main" },
  },
  houseSearchLoc: {
    text: `Enter preferred Area:\n(e.g., Ruaka, Kikuyu)`,
    type: 'input',
    property: 'searchArea',
    next: 'houseResults',
  },
  houseResults: {
    text: `Houses Found\n1. 20k - Roysambu\n2. 35k - Ruaka\n8. Get Owner Contact (10 Airtime)`,
    type: 'choice',
    options: { 1: "premiumCheck", 2: "premiumCheck", 8: "premiumCheck" },
  },

  // --- MONETIZATION & UTILS ---
  premiumCheck: {
    text: `This contact costs 10 KSh Airtime.\n1. Proceed\n0. Back`,
    type: 'choice',
    options: { 1: "premiumSuccess", 0: "main" },
  },
  premiumSuccess: {
    text: `Contact: 0720459045\nName: Francis M.\nDetails also sent via SMS.`,
    type: 'final',
  },
  myRequests: {
    text: `My Requests\n1. Active Jobs\n2. Completed\n0. Back`,
    type: 'choice',
    options: { 1: "activeList", 2: "historyList", 0: "main" },
  },
  settings: {
    text: `Settings\n1. Change Language\n2. Terms of Service\n0. Back`,
    type: 'choice',
    options: { 1: "welcome", 2: "main", 0: "main" },
  }
};