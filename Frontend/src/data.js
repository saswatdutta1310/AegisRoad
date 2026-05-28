// AegisRoad High-Fidelity Dataset
// All values model the official municipal records and real-time state telemetry

export const INITIAL_HAZARDS = [
  {
    id: "HAZ-9821",
    title: "Pothole Cluster - NH65",
    location: "Sectors 12-14, Downtown Flyover",
    severity: "critical",
    reporter: "AegisScan Bot 04",
    status: "unassigned",
    contractor: "BuildFast Pvt. Ltd.",
    description: "Multiple dangerous deep craters formed on downtown asphalt lane. High vehicle damage risk with multi-car swerves reported in mid-turn.",
    coordinates: { x: 30, y: 35 },
    reportedTimeAgo: "10m ago",
    photoUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    depth: "12cm",
    affectedArea: "15m lane sweep"
  },
  {
    id: "HAZ-8742",
    title: "Surface Cracking (Major)",
    location: "Industrial Zone B, Entry Ramp",
    severity: "high",
    reporter: "Manual Patrol",
    status: "in-progress",
    contractor: "BuildRight Co.",
    completionPercent: 65,
    description: "Deep continuous alligator cracking extending 15m. Requires immediate seal overlay before seasonal monsoon washouts.",
    coordinates: { x: 45, y: 55 },
    reportedTimeAgo: "2h ago",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
    depth: "4cm",
    affectedArea: "45m alignment"
  },
  {
    id: "HAZ-1002",
    title: "Guardrail Degradation",
    location: "Riverside Pkwy, Southbound",
    severity: "medium",
    reporter: "Citizen Report",
    status: "in-progress",
    contractor: "BuildFast Pvt. Ltd.",
    description: "Impact-damaged metallic guardrail. Unstable foundation supports at the Southbound curve over river edge. High risk of run-off road crash.",
    coordinates: { x: 65, y: 70 },
    reportedTimeAgo: "4h ago",
    photoUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600",
    depth: "N/A",
    affectedArea: "3m crumpled rail"
  },
  {
    id: "HAZ-4421",
    title: "Severe Asphalt Breach",
    location: "West Wacker Dr, North Side Intersection",
    severity: "critical",
    reporter: "AegisScan Bot 01",
    status: "in-progress",
    contractor: "BuildFast Pvt. Ltd.",
    completionPercent: 30,
    timeRemaining: "01:22:45",
    description: "Deep pothole matching tyre diameter. High dynamic load pavement failure right in the middle of pedestrian crosswalk corridor.",
    coordinates: { x: 20, y: 20 },
    reportedTimeAgo: "14m ago",
    photoUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    depth: "15cm",
    affectedArea: "1.2m diameter circle"
  },
  {
    id: "HAZ-4422",
    title: "Unstable Construction Shoring",
    location: "Lexington Ave, Midtown Tunnel Approach",
    severity: "high",
    reporter: "Citizen App",
    status: "in-progress",
    contractor: "Z-Force Roads",
    completionPercent: 45,
    timeRemaining: "03:41:10",
    description: "Alligator cracking on temporary retaining wall binding. High water permeability risking sub-base layer erosion.",
    coordinates: { x: 50, y: 25 },
    reportedTimeAgo: "42m ago",
    photoUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=600",
    depth: "9cm",
    affectedArea: "8m vertical shoring"
  },
  {
    id: "HAZ-4423",
    title: "Drainage Blockage & Pooling",
    location: "Rainier Ave S, Culvert Section 4",
    severity: "medium",
    reporter: "District Sensor",
    status: "in-progress",
    contractor: "Apex Infrastruct",
    completionPercent: 80,
    timeRemaining: "11:15:30",
    description: "Silt flood debris and blocking sediment of flood bypass duct causing minor visual lanes flooding on rain episodes.",
    coordinates: { x: 75, y: 40 },
    reportedTimeAgo: "1h ago",
    photoUrl: "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?auto=format&fit=crop&q=80&w=600",
    depth: "30cm water",
    affectedArea: "20m single lane"
  },
  {
    id: "HAZ-4424",
    title: "Expansion Joint Separation",
    location: "I-5 North Bound, Exit 128 Ramp Bridge",
    severity: "critical",
    reporter: "AegisScan Bot 02",
    status: "in-progress",
    contractor: "BuildRight Co.",
    completionPercent: 15,
    timeRemaining: "00:08:12",
    description: "Structural separation block of safety bridge deck expansion strip. Loud thuds and vehicle alignment shifts reported.",
    coordinates: { x: 60, y: 65 },
    reportedTimeAgo: "3h ago",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600",
    depth: "5cm metal lip",
    affectedArea: "Full lane width"
  },
  {
    id: "HAZ-4425",
    title: "Signage Disorientation",
    location: "Main St & Commerce, Historic District",
    severity: "low",
    reporter: "Manual Patrol",
    status: "unassigned",
    description: "Regulatory speed limit sign is practically unreadable due to strong reflectivity damage and graffiti overlay.",
    coordinates: { x: 80, y: 15 },
    reportedTimeAgo: "5h ago",
    photoUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600",
    depth: "N/A",
    affectedArea: "1 post"
  }
];

export const INITIAL_CONTRACTS = [
  {
    id: "AR-7782",
    contractor: "BuildFast Pvt. Ltd.",
    name: "Main Trunk Road Expansion - Zone 4",
    status: "optimal",
    tenderValue: 4.20, // in Cr
    budgetAllocated: 5.0,
    amountDisbursed: 4.20,
    efficiencyScore: 96,
    sector: "Metro-01",
    timeline: "Jan 2026 - Jun 2026",
    qualityRating: "A+",
    milestones: ["Surface Milling Done", "Sub-base Stabilized", "Asphalt Laying Initiated"]
  },
  {
    id: "AR-9104",
    contractor: "Urban Grid Core",
    name: "Elevated Flyover Bypass Infrastructure",
    status: "on-schedule",
    tenderValue: 12.85,
    budgetAllocated: 15.0,
    amountDisbursed: 10.50,
    efficiencyScore: 89,
    sector: "NH-65",
    timeline: "Nov 2025 - Oct 2026",
    qualityRating: "A-",
    milestones: ["Pier Foundations Placed", "Pre-cast Girders Transported", "Deck Slab Cast-1"]
  },
  {
    id: "AR-4421",
    contractor: "Metro Build Co.",
    name: "Sector 12 Smart Lighting & CCTV Gateways",
    status: "delayed",
    tenderValue: 1.50,
    budgetAllocated: 2.0,
    amountDisbursed: 1.20,
    efficiencyScore: 72,
    sector: "Industrial Zone",
    timeline: "Mar 2026 - Aug 2026",
    qualityRating: "B-",
    milestones: ["Pole Foundations Bored", "Cables Routed", "Optical Fibres Stalled"]
  },
  {
    id: "AR-5563",
    contractor: "Civic Infra Solutions",
    name: "Waterway Canal Bridge Structural Retrofit",
    status: "optimal",
    tenderValue: 3.15,
    budgetAllocated: 4.0,
    amountDisbursed: 3.15,
    efficiencyScore: 84,
    sector: "Metro-02",
    timeline: "Jan 2026 - May 2026",
    qualityRating: "B+",
    milestones: ["Shoring Installed", "Bearing Replacement Complete", "Seismic Dampers Routed"]
  },
  {
    id: "AR-2289",
    contractor: "Tecta Foundations",
    name: "Arterial Drainage Retrofit & Trenching",
    status: "warning",
    tenderValue: 2.80,
    budgetAllocated: 3.5,
    amountDisbursed: 1.80,
    efficiencyScore: 65,
    sector: "Metro-03",
    timeline: "Feb 2026 - Sep 2026",
    qualityRating: "C",
    milestones: ["Excavation Completed", "Culvert Segments Sunk", "Sealing Phase Backlogged"]
  }
];

export const INITIAL_CONTRACTOR_HEALTH = [
  {
    name: "Apex Infrastruct",
    status: "optimal",
    activeJobs: 34,
    successRate: 99.2,
    responseTime: "2.1h",
    slaBreaches: 0,
    averageCostVariance: "-5.4%",
    totalPenalties: "0.00 Cr"
  },
  {
    name: "BuildFast Pvt. Ltd.",
    status: "optimal",
    activeJobs: 18,
    successRate: 94.5,
    responseTime: "2.5h",
    slaBreaches: 1,
    averageCostVariance: "-1.2%",
    totalPenalties: "0.05 Cr"
  },
  {
    name: "BuildRight Co.",
    status: "warning",
    activeJobs: 12,
    successRate: 74.1,
    responseTime: "4.8h",
    slaBreaches: 4,
    averageCostVariance: "+8.3%",
    totalPenalties: "0.45 Cr"
  },
  {
    name: "Z-Force Roads",
    status: "critical",
    activeJobs: 45,
    successRate: 48.5,
    responseTime: "9.6h",
    slaBreaches: 18,
    averageCostVariance: "+24.8%",
    totalPenalties: "2.80 Cr"
  }
];

export const INITIAL_SLA_BREACHES = [
  {
    id: "SLA-101",
    title: "Major Pothole Escalation",
    sector: "Sector 12 Flyover",
    lateness: "-14m late",
    description: "Downtown Flyover critical pothole unresolved past standard 4-hour high priority SLA. Automated bypass penalty calculation cycle triggered.",
    status: "active",
    priority: "critical",
    penaltyRate: "₹45,000 / hr"
  },
  {
    id: "SLA-102",
    title: "Traffic Signal Failure Timeout",
    sector: "Broadway Crossing",
    lateness: "-2h late",
    description: "Heavy congestion node. Fiber outage on controller reported at 06:12 AM, scheduled fix timeframe breached. Backlog accumulation critical.",
    status: "active",
    priority: "critical",
    penaltyRate: "₹80,000 / hr"
  },
  {
    id: "SLA-103",
    title: "Safety Barrier Debris Delay",
    sector: "Industrial Zone Ramp",
    lateness: "-4.5h late",
    description: "Crumpled barrier blocks bypass merge lane. Initial dispatch notification response acknowledgment timeout.",
    status: "escalated",
    priority: "high",
    penaltyRate: "₹25,000 / hr"
  }
];

export const DRI_ROUTING_INFO = {
  route: "NH65 EXP - DOWNTOWN LINK",
  nextHazardDistance: "450m",
  hazardType: "Pothole Cluster",
  coordinates: { x: 30, y: 35 },
  safetyRating: 88, // %
  currentSpeed: "56 km/h",
  limitSpeed: "60 km/h"
};
