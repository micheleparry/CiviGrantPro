import { OpenAI } from "openai";
import { grantsGovApi } from "./grantsGovApi";
import { googleNlpService } from "./googleNlpService";

// MCP Tool Definitions for CiviGrantPro
interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export class MCPService {
  private openai: OpenAI;
  private tools: MCPTool[];

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    this.tools = this.initializeTools();
  }

  private initializeTools(): MCPTool[] {
    return [
      {
        name: "search_grants_gov",
        description: "Search for current grant opportunities on Grants.gov with real-time data",
        parameters: {
          type: "object",
          properties: {
            keywords: { type: "string", description: "Search keywords" },
            agency: { type: "string", description: "Funding agency filter" },
            category: { type: "string", description: "Funding category" },
            amount_min: { type: "number", description: "Minimum funding amount" },
            amount_max: { type: "number", description: "Maximum funding amount" },
            deadline_after: { type: "string", description: "Deadline after date (YYYY-MM-DD)" }
          }
        },
        execute: async (params) => {
          return await grantsGovApi.searchOpportunities(params);
        }
      },
      {
        name: "get_grant_details",
        description: "Get detailed information about a specific grant opportunity",
        parameters: {
          type: "object",
          properties: {
            opportunity_id: { type: "string", description: "Grants.gov opportunity ID" }
          }
        },
        execute: async (params) => {
          return await grantsGovApi.getOpportunityDetails(params.opportunity_id);
        }
      },
      {
        name: "analyze_document_requirements",
        description: "Analyze grant document requirements using NLP and AI",
        parameters: {
          type: "object",
          properties: {
            document_text: { type: "string", description: "Document content to analyze" },
            document_type: { type: "string", description: "Type of document (RFP, NOFO, etc.)" }
          }
        },
        execute: async (params) => {
          const nlpAnalysis = await googleNlpService.analyzeText(params.document_text);
          // Combine with AI analysis for comprehensive insights
          return {
            nlp_analysis: nlpAnalysis,
            requirements: await this.extractRequirements(params.document_text),
            deadlines: await this.extractDeadlines(params.document_text),
            eligibility: await this.extractEligibility(params.document_text)
          };
        }
      },
      {
        name: "search_funding_trends",
        description: "Search for current funding trends and policy updates",
        parameters: {
          type: "object",
          properties: {
            sector: { type: "string", description: "Sector to search (education, healthcare, etc.)" },
            timeframe: { type: "string", description: "Timeframe for trends (recent, annual, etc.)" }
          }
        },
        execute: async (params) => {
          // This would integrate with web search APIs or news APIs
          return await this.searchTrends(params);
        }
      },
      {
        name: "validate_application_requirements",
        description: "Validate application against current funder requirements",
        parameters: {
          type: "object",
          properties: {
            application_content: { type: "string", description: "Application content to validate" },
            funder_requirements: { type: "string", description: "Funder requirements document" }
          }
        },
        execute: async (params) => {
          return await this.validateRequirements(params);
        }
      },
      {
        name: "get_competitor_analysis",
        description: "Analyze recent successful applications and competitors",
        parameters: {
          type: "object",
          properties: {
            funder: { type: "string", description: "Funding organization" },
            sector: { type: "string", description: "Sector or field" },
            timeframe: { type: "string", description: "Analysis timeframe" }
          }
        },
        execute: async (params) => {
          return await this.analyzeCompetitors(params);
        }
      }
    ];
  }

  async processWithMCP(
    userQuery: string,
    context: {
      organizationProfile?: string;
      currentApplication?: string;
      focusAreas?: string[];
    }
  ) {
    try {
      // Create a comprehensive prompt with context
      const systemPrompt = `You are an expert grant writing assistant with access to real-time data and tools. 
      
Current Context:
- Organization Profile: ${context.organizationProfile || 'Not provided'}
- Focus Areas: ${context.focusAreas?.join(', ') || 'Not specified'}
- Current Application: ${context.currentApplication ? 'In progress' : 'Not started'}

You have access to the following tools to provide real-time, accurate assistance:
${this.tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

Use these tools to provide the most current and relevant information. Always cite your sources and explain your reasoning.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        tools: this.tools.map(tool => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }
        })),
        tool_choice: "auto"
      });

      const message = response.choices[0].message;
      
      // Handle tool calls if any
      if (message.tool_calls) {
        const toolResults = await Promise.all(
          message.tool_calls.map(async (toolCall) => {
            const tool = this.tools.find(t => t.name === toolCall.function.name);
            if (!tool) {
              throw new Error(`Unknown tool: ${toolCall.function.name}`);
            }
            
            const params = JSON.parse(toolCall.function.arguments);
            const result = await tool.execute(params);
            
            return {
              tool_call_id: toolCall.id,
              role: "tool",
              content: JSON.stringify(result)
            };
          })
        );

        // Get final response with tool results
        const finalResponse = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery },
            message,
            ...toolResults
          ]
        });

        return finalResponse.choices[0].message.content;
      }

      return message.content;
    } catch (error) {
      console.error("MCP processing error:", error);
      throw new Error(`MCP processing failed: ${(error as Error).message}`);
    }
  }

  // Helper methods for tool execution
  private async extractRequirements(documentText: string) {
    // AI-powered requirement extraction
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract all requirements from this grant document. Return as JSON array."
        },
        { role: "user", content: documentText }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content || "[]");
  }

  private async extractDeadlines(documentText: string) {
    // Extract and parse deadlines
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract all deadlines and important dates from this document. Return as JSON with dates and descriptions."
        },
        { role: "user", content: documentText }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async extractEligibility(documentText: string) {
    // Extract eligibility criteria
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract eligibility criteria from this document. Return as JSON with eligible and ineligible entities."
        },
        { role: "user", content: documentText }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async searchTrends(params: any) {
    // This would integrate with news APIs or web search
    // For now, return mock data
    return {
      trends: [
        "Increased focus on climate resilience projects",
        "Growing support for digital equity initiatives",
        "Rising interest in community health partnerships"
      ],
      sources: ["Federal Register", "Agency Announcements", "Policy Updates"]
    };
  }

  private async validateRequirements(params: any) {
    // Validate application against requirements
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Validate the application content against the funder requirements. Return validation results as JSON."
        },
        {
          role: "user",
          content: `Application: ${params.application_content}\n\nRequirements: ${params.funder_requirements}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async analyzeCompetitors(params: any) {
    // Analyze recent successful applications
    return {
      recent_awards: [
        {
          organization: "Sample Organization",
          amount: "$500,000",
          project_type: "Community Development",
          success_factors: ["Strong partnerships", "Clear metrics", "Innovative approach"]
        }
      ],
      common_patterns: [
        "Emphasis on measurable outcomes",
        "Strong stakeholder engagement",
        "Clear sustainability plans"
      ]
    };
  }
}

export const mcpService = new MCPService(); 