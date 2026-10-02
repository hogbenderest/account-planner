// GENERATED from the source workbook via codegen (see README). Do not hand-edit content.
// Tool text is debranded: no customer, vendor, or methodology product names.

export interface ScoreOption { label: string; score: number }
export interface Band { min: number; max: number; label: string }
export interface QualifierQuestion { title: string; guidance: string[]; options: ScoreOption[] }
export interface QualifierSection { title: string; questions: QualifierQuestion[]; bands: Band[] }
export interface ProfilerCriterion { title: string; consideration: string }
export interface ProfilerSection { name: string; criteria: ProfilerCriterion[] }

export const QUALIFIER: { shouldWeSell: QualifierSection; canWeSell: QualifierSection } = {
  "shouldWeSell": {
    "title": "Should We Sell?",
    "questions": [
      {
        "title": "Initial Revenue and Volume",
        "guidance": [
          "Size of this opportunity compared to others in your pipeline."
        ],
        "options": [
          {
            "label": "Smaller than average",
            "score": -1
          },
          {
            "label": "Average",
            "score": 0
          },
          {
            "label": "Somewhat larger than average",
            "score": 1
          },
          {
            "label": "Significantly larger than average",
            "score": 2
          }
        ]
      },
      {
        "title": "Potential Revenue Growth",
        "guidance": [
          "Renewal and repeat business",
          "Cross-selling other products & services",
          "New geographies",
          "More \"wallet share\" of client's budget",
          "Client's business has good growth rate",
          "Expansion to other divisions or affiliates"
        ],
        "options": [
          {
            "label": "No known growth potential",
            "score": -1
          },
          {
            "label": "Small growth potential",
            "score": 0
          },
          {
            "label": "Moderate growth potential",
            "score": 1
          },
          {
            "label": "Good growth potential",
            "score": 2
          },
          {
            "label": "Significant growth potential",
            "score": 3
          }
        ]
      },
      {
        "title": "Our Risk",
        "guidance": [
          "Higher than usual client needs or service expectations or tougher satisfaction levels",
          "Client’s financial stability",
          "Anticipate special terms of sale or unusual legal, liability or contract issues"
        ],
        "options": [
          {
            "label": "Very high risk",
            "score": -2
          },
          {
            "label": "High risk",
            "score": -1
          },
          {
            "label": "Moderate risk",
            "score": 0
          },
          {
            "label": "Low risk",
            "score": 1
          },
          {
            "label": "Very low risk",
            "score": 2
          }
        ]
      },
      {
        "title": "Margin Potential",
        "guidance": [
          "Forecasted overall margin vs. company targets",
          "Cost of expected service and support costs",
          "Uses underutilized assets or excess capacity",
          "Potential for hidden costs in execution"
        ],
        "options": [
          {
            "label": "Risk for much reduced margins",
            "score": -2
          },
          {
            "label": "Risk for reduced margins",
            "score": -1
          },
          {
            "label": "Expected at company-targeted margins",
            "score": 0
          },
          {
            "label": "Expected at somewhat better margins",
            "score": 1
          },
          {
            "label": "Expected at much better margins",
            "score": 2
          },
          {
            "label": "Expected to have greatly better margins",
            "score": 3
          }
        ]
      },
      {
        "title": "Market Expansion",
        "guidance": [
          "Likely client reference",
          "Well known market leader",
          "New client",
          "New industry or segment",
          "New geography",
          "New area or division within an account"
        ],
        "options": [
          {
            "label": "Outside our targeted markets",
            "score": -1
          },
          {
            "label": "Expands wallet share of existing client",
            "score": 0
          },
          {
            "label": "New client in existing market",
            "score": 1
          },
          {
            "label": "New client in desired market",
            "score": 2
          },
          {
            "label": "Very desirous new market",
            "score": 3
          }
        ]
      },
      {
        "title": "Resource Alignment",
        "guidance": [
          "Good seasonality match to our capacity",
          "Good equipment or facility or product component match",
          "Staffing capabilities match",
          "Unusual resourcing needs"
        ],
        "options": [
          {
            "label": "Very misaligned",
            "score": -2
          },
          {
            "label": "Somewhat misaligned",
            "score": -1
          },
          {
            "label": "Somewhat aligned",
            "score": 0
          },
          {
            "label": "Mostly aligned",
            "score": 1
          },
          {
            "label": "Completely aligned",
            "score": 2
          }
        ]
      },
      {
        "title": "Fit with Current Solutions and Product Strategy",
        "guidance": [
          "Established solution set",
          "Advances our desired product strategy",
          "Low solution or service delivery confidence",
          "Customization needed",
          "Likely need to include new partners"
        ],
        "options": [
          {
            "label": "Very high solution risk",
            "score": -2
          },
          {
            "label": "Somewhat higher solution risk",
            "score": -1
          },
          {
            "label": "Typical solution risk",
            "score": 0
          },
          {
            "label": "Somewhat lower solution risk",
            "score": 1
          },
          {
            "label": "Low solution risk",
            "score": 2
          },
          {
            "label": "No risk - standard solution",
            "score": 3
          }
        ]
      }
    ],
    "bands": [
      {
        "min": -11,
        "max": -2,
        "label": "Undesirable Business"
      },
      {
        "min": -1,
        "max": 11,
        "label": "Acceptable Business"
      },
      {
        "min": 12,
        "max": 18,
        "label": "Premium Business"
      }
    ]
  },
  "canWeSell": {
    "title": "Can We Sell?",
    "questions": [
      {
        "title": "Current Emotional Momentum",
        "guidance": [
          "Are the decision makers and influencers disturbed about today's situation or excited about the potential change?",
          "Do key client people feel this is important to them personally?",
          "Can we align to important political agendas?",
          "Can we effectively assure the client we can get it done well?"
        ],
        "options": [
          {
            "label": "Strong resistance",
            "score": -3
          },
          {
            "label": "Moderate resistance",
            "score": -2
          },
          {
            "label": "Existing, but limited resistance",
            "score": -1
          },
          {
            "label": "No emotional momentum",
            "score": 0
          },
          {
            "label": "Existing, but limited, interest",
            "score": 1
          },
          {
            "label": "Moderate interest",
            "score": 2
          },
          {
            "label": "Strong interest",
            "score": 3
          },
          {
            "label": "Very strong interest",
            "score": 4
          }
        ]
      },
      {
        "title": "Current Business Momentum",
        "guidance": [
          "Have we identified potential benefits we can provide them?",
          "How good is our financial business case?",
          "Can we improve the client's key metrics?",
          "Can we tie into their most important initiatives this year?"
        ],
        "options": [
          {
            "label": "Undefined direct business benefits",
            "score": -3
          },
          {
            "label": "Limited direct business benefits",
            "score": -2
          },
          {
            "label": "Emerging business case",
            "score": -1
          },
          {
            "label": "Positive client ROI",
            "score": 0
          },
          {
            "label": "Good business case",
            "score": 1
          },
          {
            "label": "Strong business case tied to client metrics",
            "score": 2
          },
          {
            "label": "Significant impact on key business metrics",
            "score": 3
          }
        ]
      },
      {
        "title": "Relationship Connections",
        "guidance": [
          "Are we connected to key influencers and decision makers?",
          "Do we have a connection to the \"Maestro\" for this opportunity?",
          "Do we see a realistic path to meet with the Maestro if we don’t know him or her already?",
          "At what organizational level do we have strong relationships?"
        ],
        "options": [
          {
            "label": "Some relationship damage exists",
            "score": -2
          },
          {
            "label": "Good landscape for building relationships",
            "score": -1
          },
          {
            "label": "Good relationships with or path to the Maestro",
            "score": 0
          },
          {
            "label": "Good relationships & introduction to Maestro",
            "score": 1
          },
          {
            "label": "Positive relationship with Maestro or Execs",
            "score": 2
          },
          {
            "label": "Strong relationship with Maestro or Execs",
            "score": 3
          }
        ]
      },
      {
        "title": "Client Justification Issues",
        "guidance": [
          "Do they have the needed financial budget or assured access to budget?",
          "Do they have enough resources available to assign to make this project successful?",
          "Do they have the right people assigned to evaluate this opportunity?",
          "Do we have access to client provided data needed to create a good business case?"
        ],
        "options": [
          {
            "label": "No budget yet & has not shared data",
            "score": -2
          },
          {
            "label": "No budget yet but has shared data",
            "score": -1
          },
          {
            "label": "Has budget & supportive internal data",
            "score": 0
          },
          {
            "label": "Acceptable client justification and staffing",
            "score": 1
          },
          {
            "label": "Good client justification and staffing",
            "score": 2
          },
          {
            "label": "Strong client justification and staffing",
            "score": 3
          }
        ]
      },
      {
        "title": "Our Service History and Reputation",
        "guidance": [
          "What is our current reputation compared to our competitors?",
          "If they participated, did they rank us high in our Client Satisfaction Survey?",
          "Do they feel it is easy to buy or order from us?",
          "Is our invoicing accurate and timely?",
          "Do we hear frequent negative comments about our company within this client?"
        ],
        "options": [
          {
            "label": "Tarnished reputation",
            "score": -3
          },
          {
            "label": "Moderately negative reputation",
            "score": -2
          },
          {
            "label": "Slightly negative reputation",
            "score": -1
          },
          {
            "label": "Neutral reputation",
            "score": 0
          },
          {
            "label": "Slightly positive reputation",
            "score": 1
          },
          {
            "label": "Good reputation",
            "score": 2
          },
          {
            "label": "Very good reputation",
            "score": 3
          }
        ]
      },
      {
        "title": "Solution Differentiation",
        "guidance": [
          "Can we clearly explain to the client what makes our services and products better than those offered by the competition?",
          "Does the client acknowledge and value the difference in our solutions?",
          "If our price is higher, can we reasonably explain the added value we provide?"
        ],
        "options": [
          {
            "label": "No solution differentiation & higher price",
            "score": -2
          },
          {
            "label": "Minimal solution differentiation & higher price",
            "score": -1
          },
          {
            "label": "At parity with the competition",
            "score": 0
          },
          {
            "label": "Minimal solution superiority",
            "score": 1
          },
          {
            "label": "Solution superiority",
            "score": 2
          },
          {
            "label": "Clear, client-valued differentiation",
            "score": 3
          }
        ]
      },
      {
        "title": "Knowledge of Decision Making Process",
        "guidance": [
          "Are the client’s decision making process and timelines well defined?",
          "Are the timelines achievable for us?",
          "Do we know the buying criteria and who set the criteria?",
          "Do we understand who the key influencers and decision makers are for this opportunity?"
        ],
        "options": [
          {
            "label": "Undefined decision process",
            "score": -3
          },
          {
            "label": "Unreasonable process or expectations",
            "score": -2
          },
          {
            "label": "Somewhat unreasonable",
            "score": -1
          },
          {
            "label": "Emerging definition & reasonable",
            "score": 0
          },
          {
            "label": "Mostly defined process & reasonable",
            "score": 1
          },
          {
            "label": "Clearly defined and reasonable",
            "score": 2
          }
        ]
      }
    ],
    "bands": [
      {
        "min": -18,
        "max": -3,
        "label": "High Difficulty"
      },
      {
        "min": -2,
        "max": 13,
        "label": "Medium Difficulty"
      },
      {
        "min": 14,
        "max": 21,
        "label": "Low Difficulty"
      }
    ]
  }
};

export const PROFILER: { sections: ProfilerSection[]; scale: ScoreOption[] } = {
  "sections": [
    {
      "name": "Competitive Strategy",
      "criteria": [
        {
          "title": "Win Theme",
          "consideration": "Our Win Theme is being spoken frequently within the client and continues to be primarily associated with us rather than the competition."
        },
        {
          "title": "Defined Strategy",
          "consideration": "We are executing a well-defined strategy that leverages our strengths and exploits the weaknesses of our competition."
        },
        {
          "title": "Countertactics",
          "consideration": "We have executed competitive tactics to counter anticipated strategies and tactics of our competition. "
        },
        {
          "title": "Thought Leadership",
          "consideration": "Our unique thought leadership is bringing value which the client appreciates and wants or needs to be successful."
        }
      ]
    },
    {
      "name": "Decision Making Process",
      "criteria": [
        {
          "title": "Clarity of Process",
          "consideration": "The client has a well-defined decision making process that has been shared with us including the complete steps of who, when and how the decision will be made."
        },
        {
          "title": "Alignment to the People in the Decision Process",
          "consideration": "Compared to the competition, we know and are well leveraged with both those making and influencing the buying decision."
        },
        {
          "title": "Alignment to the Decision Criteria",
          "consideration": "As compared to the competition, we know and are well aligned to each of the specific buying decision criterion."
        },
        {
          "title": "Alignment to the Timing of the Decision Process",
          "consideration": "We understand the expectations for each gate or milestone of the buying decision process and are fully prepared to meet or exceed them on time."
        }
      ]
    },
    {
      "name": "Relational Superiority",
      "criteria": [
        {
          "title": "Executive Relationships",
          "consideration": "Compared to the competition, we have achieved stronger executive support and sponsorship."
        },
        {
          "title": "Decision Maker Relationships",
          "consideration": "We have no Detractors or Potential Adversaries and a minimum of one partnering Ally with the client's decision makers for this purchase."
        },
        {
          "title": "Financial Justification Relationships",
          "consideration": "We have access to and support of those empowered to make financial buying recommendations for our offering."
        },
        {
          "title": "Subject Matter Expert Relationships",
          "consideration": "Compared to the competition, the client’s Subject Matter Experts (internal and/or external) are more supportive of our solution."
        }
      ]
    },
    {
      "name": "Political Alignment",
      "criteria": [
        {
          "title": "Base of Power Alignment",
          "consideration": "Within the Base of Power, we have a minimum of one Partner Ally, with no Detractors and no more than one Neutral individual. "
        },
        {
          "title": "Political Strategy",
          "consideration": "Powerful people in the client organization have something significant to gain by implementing our solution over that of any competitor."
        },
        {
          "title": "Power Struggle Alignment",
          "consideration": "We are appropriately positioned in the client’s internal power struggles."
        },
        {
          "title": "Political Coaching",
          "consideration": "We are regularly receiving insightful coaching from a Maestro or Power Base member on how to win this opportunity."
        }
      ]
    },
    {
      "name": "Our Value Proposition",
      "criteria": [
        {
          "title": "Client Validated Alignment",
          "consideration": "The client stakeholder(s) stated and verified clear prioritized business issues or opportunities to which our Value Proposition is tightly linked."
        },
        {
          "title": "Business Metric Based",
          "consideration": "If asked, the appropriate client personnel can identify operational and financial metrics that will be positively impacted by our proposed solution."
        },
        {
          "title": "Co-Developed",
          "consideration": "Our Value Proposition has been constructed through collaboration with the client and reflects their unique business assumptions, concerns and expectations."
        },
        {
          "title": "Innovative",
          "consideration": "Influential client personnel have validated that our business arrangement and solution is differentiated from our competitors."
        }
      ]
    },
    {
      "name": "Pursuit Momentum",
      "criteria": [
        {
          "title": "How Much?",
          "consideration": "The client understands and is pleased with the financial return for moving forward with our solution."
        },
        {
          "title": "How Soon?",
          "consideration": "The timing for realizing the operational and financial benefits from our offering is compelling to the client."
        },
        {
          "title": "How Sure?",
          "consideration": "The client finds our operational and financial projections believable, our solution credible and our recommended approach defendable."
        },
        {
          "title": "How Ready?",
          "consideration": "The client finds our timetable attractive and compatible with his business plans and objectives."
        }
      ]
    }
  ],
  "scale": [
    {
      "label": "Don’t Know",
      "score": 0
    },
    {
      "label": "Strongly Disagree",
      "score": 1
    },
    {
      "label": "Disagree",
      "score": 2
    },
    {
      "label": "Agree",
      "score": 4
    },
    {
      "label": "Strongly Agree",
      "score": 5
    }
  ]
};

export const VULNERABILITY_CATEGORIES: string[] = [
  "Competitive Strategy",
  "Decision Making Process",
  "Relational Superiority",
  "Political Alignment",
  "Value Proposition Superiority",
  "Pursuit Momentum"
];

export const WORKBOOK_CONSTANTS = {
  "sectionMax": 20,
  "sectionCount": 6,
  "totalMax": 120,
  "matrixXMax": 39,
  "matrixYMax": 29,
  "radarVertexSectionOrder": [
    1,
    2,
    3,
    4,
    5,
    0
  ]
} as const;

export const ATTRIBUTION =
  "Account Planner uses qualification and competitive-advantage concepts inspired by the Revenue Storm sales methodology.";
