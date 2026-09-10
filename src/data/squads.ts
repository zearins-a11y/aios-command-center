import { Squad, Agent, Command } from '../types';

// Common commands for all agents
const commonCommands: Command[] = [
  { id: 'build', icon: '🚀', label: 'Build', action: 'build' },
  { id: 'analyze', icon: '📊', label: 'Analyze', action: 'analyze' },
  { id: 'suggest', icon: '💡', label: 'Suggest', action: 'suggest' },
  { id: 'validate', icon: '✅', label: 'Validate', action: 'validate' },
  { id: 'create', icon: '📝', label: 'Create', action: 'create' },
  { id: 'sync', icon: '🔄', label: 'Sync', action: 'sync' },
];

// C-Level Squad with Advisory Board
export const advisoryBoard: Agent[] = [
  { id: 'naval', name: 'Naval Ravikant', role: 'Investor & Philosopher', specialty: ' Wealth & Mental Models', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'charlie', name: 'Charlie Munger', role: 'Vice Chairman', specialty: 'Decision Making', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'peter', name: 'Peter Thiel', role: 'Founder', specialty: 'Strategy & Competition', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'brene', name: 'Brené Brown', role: 'Researcher', specialty: 'Leadership & Vulnerability', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'derek', name: 'Derek Sivers', role: 'Entrepreneur', specialty: 'Business Philosophy', status: 'offline', commands: commonCommands, squadId: 'advisory' },
  { id: 'patrick', name: 'Patrick Lencioni', role: 'Author', specialty: 'Team Dynamics', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'ray', name: 'Ray Dalio', role: 'Founder Bridgewater', specialty: 'Principles & Economics', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'reid', name: 'Reid Hoffman', role: 'LinkedIn Co-founder', specialty: 'Networking & Startups', status: 'working', commands: commonCommands, squadId: 'advisory' },
  { id: 'simon', name: 'Simon Sinek', role: 'Author', specialty: 'Leadership & Purpose', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'yvon', name: 'Yvon Chouinard', role: 'Patagonia Founder', specialty: 'Sustainable Business', status: 'offline', commands: commonCommands, squadId: 'advisory' },
  { id: 'alex', name: 'Alex Hormozi', role: 'Acquisition.com', specialty: 'Business & Marketing', status: 'available', commands: commonCommands, squadId: 'advisory' },
  { id: 'dan', name: 'Dan Koe', role: 'Creator', specialty: 'Creator Economy', status: 'available', commands: commonCommands, squadId: 'advisory' },
];

// AIOS Squad - Core Engineering Team
export const aiosSquad: Agent[] = [
  { id: 'dev', name: 'Dev Agent', role: 'Developer', specialty: 'Code Implementation', status: 'working', commands: commonCommands, squadId: 'aios' },
  { id: 'qa', name: 'QA Agent', role: 'Quality Assurance', specialty: 'Testing & Validation', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'pm', name: 'PM Agent', role: 'Product Manager', specialty: 'Project Planning', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'po', name: 'PO Agent', role: 'Product Owner', specialty: 'Product Strategy', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'sm', name: 'SM Agent', role: 'Scrum Master', specialty: 'Agile Facilitation', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'architect', name: 'Architect Agent', role: 'Solution Architect', specialty: 'System Design', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'devops', name: 'DevOps Agent', role: 'DevOps Engineer', specialty: 'CI/CD & Infrastructure', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'data', name: 'Data Engineer', role: 'Data Engineer', specialty: 'Data Pipelines', status: 'available', commands: commonCommands, squadId: 'aios' },
  { id: 'ux', name: 'UX Design Expert', role: 'UX Designer', specialty: 'User Experience', status: 'working', commands: commonCommands, squadId: 'aios' },
  { id: 'squad-creator', name: 'Squad Creator', role: 'AI Orchestrator', specialty: 'Agent Coordination', status: 'available', commands: commonCommands, squadId: 'aios' },
];

// Brand Squad
export const brandSquad: Agent[] = [
  { id: 'brand-chief', name: 'Brand Chief', role: 'Chief Brand Officer', specialty: 'Brand Strategy', status: 'available', commands: commonCommands, squadId: 'brand' },
  { id: 'david-aaker', name: 'David Aaker', role: 'Brand Consultant', specialty: 'Brand Equity', status: 'available', commands: commonCommands, squadId: 'brand' },
  { id: 'al-ries', name: 'Al Ries', role: 'Positioning Expert', specialty: 'Brand Positioning', status: 'available', commands: commonCommands, squadId: 'brand' },
  { id: 'byron', name: 'Byron Sharp', role: 'Marketing Professor', specialty: 'Brand Growth', status: 'offline', commands: commonCommands, squadId: 'brand' },
  { id: 'marty', name: 'Marty Neumeier', role: 'Brand Designer', specialty: 'Brand Design', status: 'available', commands: commonCommands, squadId: 'brand' },
  { id: 'kevin', name: 'Kevin Keller', role: 'Brand Strategist', specialty: 'Brand Architecture', status: 'available', commands: commonCommands, squadId: 'brand' },
  { id: 'denise', name: 'Denise Yohn', role: 'Brand Leader', specialty: 'Brand Culture', status: 'available', commands: commonCommands, squadId: 'brand' },
  { id: 'emily', name: 'Emily Heyward', role: 'Brand Consultant', specialty: 'Brand Identity', status: 'available', commands: commonCommands, squadId: 'brand' },
];

// Copy Squad
export const copySquad: Agent[] = [
  { id: 'copy-chief', name: 'Copy Chief', role: 'Chief Copywriter', specialty: 'Copy Strategy', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'ogilvy', name: 'David Ogilvy', role: 'Legendary Copywriter', specialty: 'Classic Copywriting', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'halbert', name: 'Gary Halbert', role: 'Copywriting Legend', specialty: 'Direct Response', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'schwartz', name: 'Eugene Schwartz', role: 'Marketing Legend', specialty: 'Mass Persuasion', status: 'offline', commands: commonCommands, squadId: 'copy' },
  { id: 'kennedy', name: 'Dan Kennedy', role: 'Copywriter', specialty: 'Direct Marketing', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'hopkins', name: 'Claude Hopkins', role: 'Advertising Pioneer', specialty: 'Scientific Advertising', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'brunson', name: 'Russell Brunson', role: 'ClickFunnels', specialty: 'Sales Funnels', status: 'working', commands: commonCommands, squadId: 'copy' },
  { id: 'chaperon', name: 'Andre Chaperon', role: 'Email Expert', specialty: 'Email Marketing', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'voss', name: 'Chris Voss', role: 'Negotiation Expert', specialty: 'Negotiation Copy', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'joanna', name: 'Joanna Wiebe', role: 'Conversion Writer', specialty: 'Copy Testing', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'sugarman', name: 'Joe Sugarman', role: 'Copywriter', specialty: 'Blueprints', status: 'available', commands: commonCommands, squadId: 'copy' },
  { id: 'stefan', name: 'Stefan Georgi', role: 'Copywriter', specialty: 'High-Ticket Sales', status: 'available', commands: commonCommands, squadId: 'copy' },
];

// Cybersecurity Squad
export const cybersecuritySquad: Agent[] = [
  { id: 'cyber-chief', name: 'Cyber Chief', role: 'CISO', specialty: 'Security Strategy', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'georgia', name: 'Georgia Weidman', role: 'Penetration Tester', specialty: 'Mobile Security', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'chris-sanders', name: 'Chris Sanders', role: 'Security Analyst', specialty: 'Intrusion Detection', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'jim-manico', name: 'Jim Manico', role: 'AppSec Expert', specialty: 'Application Security', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'marcus', name: 'Marcus Carey', role: 'Security Researcher', specialty: 'Threat Intelligence', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'omar', name: 'Omar Santos', role: 'Security Architect', specialty: 'Network Security', status: 'working', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'peter-kim', name: 'Peter Kim', role: 'Hacker', specialty: 'Penetration Testing', status: 'offline', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'cartographer', name: 'Cartographer', role: 'Security Analyst', specialty: 'Asset Mapping', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'dirber', name: 'Dirber', role: 'Recon Expert', specialty: 'Directory Enumeration', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'fuzzer', name: 'Fuzzer', role: 'Bug Hunter', specialty: 'Fuzz Testing', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'ripper', name: 'Ripper', role: 'Security Tool', specialty: 'Password Cracking', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'rogue', name: 'Rogue', role: 'Red Team', specialty: 'Social Engineering', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'shannon', name: 'Shannon Runner', role: 'Security Analyst', specialty: 'Log Analysis', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'busterer', name: 'Busterer', role: 'DDoS Analyst', specialty: 'DDoS Mitigation', status: 'offline', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'command-gen', name: 'Command Generator', role: 'Security Tool', specialty: 'Exploit Creation', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
  { id: 'cyber-advisor', name: 'Cyber Advisor', role: 'Consultant', specialty: 'Compliance', status: 'available', commands: commonCommands, squadId: 'cybersecurity' },
];

// Data Squad
export const dataSquad: Agent[] = [
  { id: 'data-chief', name: 'Data Chief', role: 'Chief Data Officer', specialty: 'Data Strategy', status: 'available', commands: commonCommands, squadId: 'data' },
  { id: 'avinash', name: 'Avinash Kaushik', role: 'Analytics Expert', specialty: 'Web Analytics', status: 'available', commands: commonCommands, squadId: 'data' },
  { id: 'sean', name: 'Sean Ellis', role: 'Growth Expert', specialty: 'Growth Hacking', status: 'available', commands: commonCommands, squadId: 'data' },
  { id: 'morgan', name: 'Morgan Brown', role: 'Growth Leader', specialty: 'Product Growth', status: 'available', commands: commonCommands, squadId: 'data' },
  { id: 'peter-fader', name: 'Peter Fader', role: 'Professor', specialty: 'Customer Analytics', status: 'available', commands: commonCommands, squadId: 'data' },
  { id: 'wes', name: 'Wes Kao', role: 'Brand Expert', specialty: 'Brand Positioning', status: 'offline', commands: commonCommands, squadId: 'data' },
  { id: 'nick', name: 'Nick Mehta', role: 'CEO Gainsight', specialty: 'Customer Success', status: 'available', commands: commonCommands, squadId: 'data' },
];

// Design Squad
export const designSquad: Agent[] = [
  { id: 'design-chief', name: 'Design Chief', role: 'Head of Design', specialty: 'Design Leadership', status: 'available', commands: commonCommands, squadId: 'design' },
  { id: 'brad-frost', name: 'Brad Frost', role: 'Web Designer', specialty: 'Atomic Design', status: 'available', commands: commonCommands, squadId: 'design' },
  { id: 'dan-mall', name: 'Dan Mall', role: 'Design Systems', specialty: 'Design Systems', status: 'working', commands: commonCommands, squadId: 'design' },
  { id: 'dave-malouf', name: 'Dave Malouf', role: 'Design Leader', specialty: 'Design Management', status: 'available', commands: commonCommands, squadId: 'design' },
  { id: 'ui-engineer', name: 'UI Engineer', role: 'UI Developer', specialty: 'Interface Development', status: 'available', commands: commonCommands, squadId: 'design' },
  { id: 'ux-designer', name: 'UX Designer', role: 'UX Specialist', specialty: 'User Research', status: 'available', commands: commonCommands, squadId: 'design' },
  { id: 'visual-gen', name: 'Visual Generator', role: 'Visual Designer', specialty: 'Visual Design', status: 'available', commands: commonCommands, squadId: 'design' },
  { id: 'design-sys-arch', name: 'Design System Architect', role: 'Architect', specialty: 'Design Architecture', status: 'available', commands: commonCommands, squadId: 'design' },
];

// Hormozi Squad
export const hormoziSquad: Agent[] = [
  { id: 'hormozi-chief', name: 'Hormozi Chief', role: 'Strategy Lead', specialty: 'Business Strategy', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-ads', name: 'Hormozi Ads', role: 'Ads Expert', specialty: 'Paid Advertising', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-copy', name: 'Hormozi Copy', role: 'Copywriter', specialty: 'Acquisition Copy', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-content', name: 'Hormozi Content', role: 'Content Strategist', specialty: 'Content Strategy', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-hooks', name: 'Hormozi Hooks', role: 'Hook Specialist', specialty: 'Hook Development', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-offers', name: 'Hormozi Offers', role: 'Offer Strategist', specialty: 'Offer Construction', status: 'working', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-pricing', name: 'Hormozi Pricing', role: 'Pricing Expert', specialty: 'Pricing Strategy', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-launch', name: 'Hormozi Launch', role: 'Launch Strategist', specialty: 'Product Launch', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-scale', name: 'Hormozi Scale', role: 'Scale Expert', specialty: 'Business Scaling', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-leads', name: 'Hormozi Leads', role: 'Lead Gen Expert', specialty: 'Lead Generation', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-closer', name: 'Hormozi Closer', role: 'Sales Expert', specialty: 'Sales & Closing', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-retention', name: 'Hormozi Retention', role: 'Retention Expert', specialty: 'Customer Retention', status: 'offline', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-models', name: 'Hormozi Models', role: 'Model Builder', specialty: 'Business Models', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-workshop', name: 'Hormozi Workshop', role: 'Workshop Leader', specialty: 'Training', status: 'available', commands: commonCommands, squadId: 'hormozi' },
  { id: 'hormozi-audit', name: 'Hormozi Audit', role: 'Auditor', specialty: 'Business Audit', status: 'available', commands: commonCommands, squadId: 'hormozi' },
];

// Movement Squad
export const movementSquad: Agent[] = [
  { id: 'movement-chief', name: 'Movement Chief', role: 'Movement Leader', specialty: 'Movement Building', status: 'available', commands: commonCommands, squadId: 'movement' },
  { id: 'fenomenologo', name: 'Fenomenologo', role: 'Cultural Analyst', specialty: 'Cultural Analysis', status: 'available', commands: commonCommands, squadId: 'movement' },
  { id: 'identitario', name: 'Identitario', role: 'Identity Specialist', specialty: 'Identity Design', status: 'available', commands: commonCommands, squadId: 'movement' },
  { id: 'manifestador', name: 'Manifestador', role: 'Manifesto Writer', specialty: 'Narrative Creation', status: 'available', commands: commonCommands, squadId: 'movement' },
  { id: 'estrategista', name: 'Estrategista de Ciclo', role: 'Cycle Strategist', specialty: 'Life Cycles', status: 'working', commands: commonCommands, squadId: 'movement' },
  { id: 'analista-impacto', name: 'Analista de Impacto', role: 'Impact Analyst', specialty: 'Impact Measurement', status: 'available', commands: commonCommands, squadId: 'movement' },
  { id: 'movement-arch', name: 'Movement Architect', role: 'Architect', specialty: 'Movement Design', status: 'available', commands: commonCommands, squadId: 'movement' },
  { id: 'culture-arch', name: 'Culture Architect', role: 'Culture Designer', specialty: 'Culture Building', status: 'available', commands: commonCommands, squadId: 'movement' },
];

// Storytelling Squad
export const storytellingSquad: Agent[] = [
  { id: 'story-chief', name: 'Story Chief', role: 'Chief Storyteller', specialty: 'Story Strategy', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'campbell', name: 'Joseph Campbell', role: 'Mythology Expert', specialty: 'Hero\'s Journey', status: 'offline', commands: commonCommands, squadId: 'storytelling' },
  { id: 'harmon', name: 'Dan Harmon', role: 'Storyteller', specialty: 'Story Circles', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'snyder', name: 'Blake Snyder', role: 'Screenwriter', specialty: 'Save the Cat', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'coyne', name: 'Shawn Coyne', role: 'Story Editor', specialty: 'Story Theory', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'duarte', name: 'Nancy Duarte', role: 'Presentation Expert', specialty: 'Visual Stories', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'klaff', name: 'Oren Klaff', role: 'Pitch Expert', specialty: 'Pitching', status: 'working', commands: commonCommands, squadId: 'storytelling' },
  { id: 'howell', name: 'Park Howell', role: 'Brand Storyteller', specialty: 'Brand Stories', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'hall', name: 'Kindra Hall', role: 'Story Collector', specialty: 'Stories that Sell', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'ganz', name: 'Marshall Ganz', role: 'Organizer', specialty: 'Public Narrative', status: 'available', commands: commonCommands, squadId: 'storytelling' },
  { id: 'johnstone', name: 'Keith Johnstone', role: 'Improviser', specialty: 'Improvisational Stories', status: 'offline', commands: commonCommands, squadId: 'storytelling' },
  { id: 'dicks', name: 'Matthew Dicks', role: 'Storyteller', specialty: 'Storytelling for Business', status: 'available', commands: commonCommands, squadId: 'storytelling' },
];

// Traffic Masters Squad
export const trafficMastersSquad: Agent[] = [
  { id: 'traffic-chief', name: 'Traffic Chief', role: 'Traffic Director', specialty: 'Traffic Strategy', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'tom-breeze', name: 'Tom Breeze', role: 'Video Ads Expert', specialty: 'YouTube Ads', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'depesh', name: 'Depesh Mandalia', role: 'FB Ads Expert', specialty: 'Facebook Ads', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'ralph', name: 'Ralph Burns', role: 'Traffic Expert', specialty: 'Paid Traffic', status: 'working', commands: commonCommands, squadId: 'traffic' },
  { id: 'kasim', name: 'Kasim Aslam', role: 'Ads Strategist', specialty: 'Google Ads', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'molly', name: 'Molly Pittman', role: 'Ad Expert', specialty: 'Creative Strategy', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'media-buyer', name: 'Media Buyer', role: 'Media Buyer', specialty: 'Media Buying', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'ad-midas', name: 'Ad Midas', role: 'ROI Expert', specialty: 'Ad ROI', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'creative-analyst', name: 'Creative Analyst', role: 'Analyst', specialty: 'Creative Analysis', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'ads-analyst', name: 'Ads Analyst', role: 'Ads Analyst', specialty: 'Performance Analysis', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'performance-analyst', name: 'Performance Analyst', role: 'Analyst', specialty: 'KPI Analysis', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'pixel-spec', name: 'Pixel Specialist', role: 'Tech Expert', specialty: 'Pixel Setup', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'scale-opt', name: 'Scale Optimizer', role: 'Optimizer', specialty: 'Campaign Scaling', status: 'offline', commands: commonCommands, squadId: 'traffic' },
  { id: 'nicholas', name: 'Nicholas Kusmich', role: 'Facebook Expert', specialty: 'Facebook Strategy', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'pedro', name: 'Pedro Sobral', role: 'Growth Expert', specialty: 'Growth Strategy', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'fiscal', name: 'Fiscal', role: 'Budget Analyst', specialty: 'Budget Allocation', status: 'available', commands: commonCommands, squadId: 'traffic' },
  { id: 'media-strategist', name: 'Media Strategist', role: 'Strategist', specialty: 'Media Strategy', status: 'available', commands: commonCommands, squadId: 'traffic' },
];

// All Squads
export const allSquads: Squad[] = [
  {
    id: 'clevel',
    name: 'C-Level Squad',
    icon: '📊',
    parentId: null,
    color: '#6366f1',
    description: 'Executive leadership and strategic direction',
    agents: []
  },
  {
    id: 'advisory',
    name: 'Advisory Board',
    icon: '🧠',
    parentId: 'clevel',
    color: '#8b5cf6',
    description: 'Strategic advisors and mentors',
    agents: advisoryBoard
  },
  {
    id: 'aios',
    name: 'AIOS',
    icon: '⚙️',
    parentId: null,
    color: '#06b6d4',
    description: 'Engineering & Development',
    agents: aiosSquad
  },
  {
    id: 'brand',
    name: 'Brand Squad',
    icon: '🎨',
    parentId: null,
    color: '#ec4899',
    description: 'Brand identity and positioning',
    agents: brandSquad
  },
  {
    id: 'copy',
    name: 'Copy Squad',
    icon: '📝',
    parentId: null,
    color: '#f59e0b',
    description: 'Copywriting and content creation',
    agents: copySquad
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    icon: '🔒',
    parentId: null,
    color: '#ef4444',
    description: 'Security specialists and pentesters',
    agents: cybersecuritySquad
  },
  {
    id: 'data',
    name: 'Data Squad',
    icon: '📈',
    parentId: null,
    color: '#22c55e',
    description: 'Data analytics and insights',
    agents: dataSquad
  },
  {
    id: 'design',
    name: 'Design Squad',
    icon: '🎯',
    parentId: null,
    color: '#a855f7',
    description: 'UI/UX design and visual design',
    agents: designSquad
  },
  {
    id: 'hormozi',
    name: 'Hormozi Squad',
    icon: '💰',
    parentId: null,
    color: '#eab308',
    description: 'Business strategy and acquisition',
    agents: hormoziSquad
  },
  {
    id: 'movement',
    name: 'Movement',
    icon: '🚀',
    parentId: null,
    color: '#14b8a6',
    description: 'Movement building and culture',
    agents: movementSquad
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    icon: '📖',
    parentId: null,
    color: '#f97316',
    description: 'Narrative and storytelling experts',
    agents: storytellingSquad
  },
  {
    id: 'traffic',
    name: 'Traffic Masters',
    icon: '📢',
    parentId: null,
    color: '#3b82f6',
    description: 'Traffic and paid acquisition',
    agents: trafficMastersSquad
  },
];

// Get all agents across all squads
export const getAllAgents = (): Agent[] => {
  return allSquads.flatMap(squad => squad.agents);
};

// Get squad by ID
export const getSquadById = (id: string): Squad | undefined => {
  return allSquads.find(squad => squad.id === id);
};

// Get agent by ID
export const getAgentById = (id: string): Agent | undefined => {
  return getAllAgents().find(agent => agent.id === id);
};

// Get squads by project
export const getSquadsForProject = (squadIds: string[]): Squad[] => {
  return allSquads.filter(squad => squadIds.includes(squad.id));
};

// System Status
export const systemStatus = {
  api: true,
  database: true,
  activeAgents: getAllAgents().filter(a => a.status === 'available' || a.status === 'working').length,
  totalAgents: getAllAgents().length,
};
