import { LanguageServiceClient } from '@google-cloud/language';

// Initialize Google Cloud Language client
const languageClient = new LanguageServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export interface EntityAnalysis {
  entities: Array<{
    name: string;
    type: string;
    salience: number;
    metadata?: Record<string, string>;
    mentions: Array<{
      text: string;
      type: string;
    }>;
  }>;
  language: string;
}

export interface SentimentAnalysis {
  documentSentiment: {
    score: number; // -1.0 to 1.0
    magnitude: number;
  };
  sentences: Array<{
    text: string;
    sentiment: {
      score: number;
      magnitude: number;
    };
  }>;
  language: string;
}

export interface ContentClassification {
  categories: Array<{
    name: string;
    confidence: number;
  }>;
  language: string;
}

export interface SyntaxAnalysis {
  tokens: Array<{
    text: string;
    partOfSpeech: {
      tag: string;
      aspect: string;
      case: string;
      form: string;
      gender: string;
      mood: string;
      number: string;
      person: string;
      proper: string;
      reciprocity: string;
      tense: string;
      voice: string;
    };
    dependencyEdge: {
      headTokenIndex: number;
      label: string;
    };
    lemma: string;
  }>;
  language: string;
}

export interface ComprehensiveTextAnalysis {
  entities: EntityAnalysis;
  sentiment: SentimentAnalysis;
  classification: ContentClassification;
  syntax: SyntaxAnalysis;
  summary: {
    keyEntities: string[];
    overallSentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    confidence: number;
    categories: string[];
    language: string;
  };
}

export class GoogleNlpService {
  /**
   * Analyze entities in text (organizations, locations, people, etc.)
   */
  async analyzeEntities(text: string): Promise<EntityAnalysis> {
    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT' as const,
      };

      const [result] = await languageClient.analyzeEntities({ document });
      
      return {
        entities: result.entities?.map(entity => ({
          name: entity.name || '',
          type: entity.type || 'UNKNOWN',
          salience: entity.salience || 0,
          metadata: entity.metadata || {},
          mentions: entity.mentions?.map(mention => ({
            text: mention.text?.content || '',
            type: mention.type || 'COMMON',
          })) || [],
        })) || [],
        language: result.language || 'en',
      };
    } catch (error) {
      console.error('Entity analysis error:', error);
      throw new Error(`Failed to analyze entities: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze sentiment in text
   */
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT' as const,
      };

      const [result] = await languageClient.analyzeSentiment({ document });
      
      return {
        documentSentiment: {
          score: result.documentSentiment?.score || 0,
          magnitude: result.documentSentiment?.magnitude || 0,
        },
        sentences: result.sentences?.map(sentence => ({
          text: sentence.text?.content || '',
          sentiment: {
            score: sentence.sentiment?.score || 0,
            magnitude: sentence.sentiment?.magnitude || 0,
          },
        })) || [],
        language: result.language || 'en',
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw new Error(`Failed to analyze sentiment: ${(error as Error).message}`);
    }
  }

  /**
   * Classify content into categories
   */
  async classifyContent(text: string): Promise<ContentClassification> {
    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT' as const,
      };

      const [result] = await languageClient.classifyText({ document });
      
      return {
        categories: result.categories?.map(category => ({
          name: category.name || '',
          confidence: category.confidence || 0,
        })) || [],
        language: result.language || 'en',
      };
    } catch (error) {
      console.error('Content classification error:', error);
      throw new Error(`Failed to classify content: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze syntax and grammar
   */
  async analyzeSyntax(text: string): Promise<SyntaxAnalysis> {
    try {
      const document = {
        content: text,
        type: 'PLAIN_TEXT' as const,
      };

      const [result] = await languageClient.analyzeSyntax({ document });
      
      return {
        tokens: result.tokens?.map(token => ({
          text: token.text?.content || '',
          partOfSpeech: {
            tag: token.partOfSpeech?.tag || '',
            aspect: token.partOfSpeech?.aspect || '',
            case: token.partOfSpeech?.case || '',
            form: token.partOfSpeech?.form || '',
            gender: token.partOfSpeech?.gender || '',
            mood: token.partOfSpeech?.mood || '',
            number: token.partOfSpeech?.number || '',
            person: token.partOfSpeech?.person || '',
            proper: token.partOfSpeech?.proper || '',
            reciprocity: token.partOfSpeech?.reciprocity || '',
            tense: token.partOfSpeech?.tense || '',
            voice: token.partOfSpeech?.voice || '',
          },
          dependencyEdge: {
            headTokenIndex: token.dependencyEdge?.headTokenIndex || 0,
            label: token.dependencyEdge?.label || '',
          },
          lemma: token.lemma || '',
        })) || [],
        language: result.language || 'en',
      };
    } catch (error) {
      console.error('Syntax analysis error:', error);
      throw new Error(`Failed to analyze syntax: ${(error as Error).message}`);
    }
  }

  /**
   * Perform comprehensive text analysis
   */
  async analyzeText(text: string): Promise<ComprehensiveTextAnalysis> {
    try {
      const [entities, sentiment, classification, syntax] = await Promise.all([
        this.analyzeEntities(text),
        this.analyzeSentiment(text),
        this.classifyContent(text),
        this.analyzeSyntax(text),
      ]);

      // Generate summary
      const keyEntities = entities.entities
        .filter(entity => entity.salience > 0.1)
        .slice(0, 10)
        .map(entity => entity.name);

      const overallSentiment = sentiment.documentSentiment.score > 0.1 
        ? 'positive' 
        : sentiment.documentSentiment.score < -0.1 
          ? 'negative' 
          : 'neutral';

      const categories = classification.categories
        .filter(cat => cat.confidence > 0.5)
        .map(cat => cat.name);

      return {
        entities,
        sentiment,
        classification,
        syntax,
        summary: {
          keyEntities,
          overallSentiment,
          sentimentScore: sentiment.documentSentiment.score,
          confidence: sentiment.documentSentiment.magnitude,
          categories,
          language: entities.language,
        },
      };
    } catch (error) {
      console.error('Comprehensive text analysis error:', error);
      throw new Error(`Failed to analyze text: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze grant document with NLP insights
   */
  async analyzeGrantDocument(text: string): Promise<{
    entities: EntityAnalysis;
    sentiment: SentimentAnalysis;
    classification: ContentClassification;
    grantInsights: {
      fundingAgencies: string[];
      eligibleEntities: string[];
      keyRequirements: string[];
      programAreas: string[];
      geographicFocus: string[];
      fundingAmounts: string[];
      deadlines: string[];
      contactInfo: string[];
      documentTone: 'formal' | 'informal' | 'technical' | 'accessible';
      complexityLevel: 'low' | 'medium' | 'high';
      urgencyIndicators: string[];
    };
  }> {
    try {
      const analysis = await this.analyzeText(text);
      
      // Extract grant-specific insights
      const fundingAgencies = analysis.entities.entities
        .filter(entity => 
          entity.type === 'ORGANIZATION' && 
          (entity.name.toLowerCase().includes('department') || 
           entity.name.toLowerCase().includes('agency') ||
           entity.name.toLowerCase().includes('bureau') ||
           entity.name.toLowerCase().includes('foundation'))
        )
        .map(entity => entity.name);

      const eligibleEntities = analysis.entities.entities
        .filter(entity => 
          entity.type === 'ORGANIZATION' && 
          (entity.name.toLowerCase().includes('government') ||
           entity.name.toLowerCase().includes('nonprofit') ||
           entity.name.toLowerCase().includes('university') ||
           entity.name.toLowerCase().includes('institution'))
        )
        .map(entity => entity.name);

      const keyRequirements = analysis.entities.entities
        .filter(entity => 
          entity.type === 'OTHER' && 
          (entity.name.toLowerCase().includes('requirement') ||
           entity.name.toLowerCase().includes('criteria') ||
           entity.name.toLowerCase().includes('eligibility'))
        )
        .map(entity => entity.name);

      const programAreas = analysis.classification.categories
        .filter(cat => cat.confidence > 0.3)
        .map(cat => cat.name);

      const geographicFocus = analysis.entities.entities
        .filter(entity => entity.type === 'LOCATION')
        .map(entity => entity.name);

      const fundingAmounts = analysis.entities.entities
        .filter(entity => 
          entity.type === 'OTHER' && 
          (entity.name.includes('$') || 
           entity.name.toLowerCase().includes('million') ||
           entity.name.toLowerCase().includes('thousand'))
        )
        .map(entity => entity.name);

      const deadlines = analysis.entities.entities
        .filter(entity => 
          entity.type === 'OTHER' && 
          (entity.name.toLowerCase().includes('deadline') ||
           entity.name.toLowerCase().includes('due') ||
           entity.name.toLowerCase().includes('date'))
        )
        .map(entity => entity.name);

      const contactInfo = analysis.entities.entities
        .filter(entity => 
          entity.type === 'PERSON' || 
          (entity.type === 'OTHER' && 
           (entity.name.toLowerCase().includes('contact') ||
            entity.name.toLowerCase().includes('email') ||
            entity.name.toLowerCase().includes('phone')))
        )
        .map(entity => entity.name);

      // Determine document tone
      const sentimentScore = analysis.sentiment.documentSentiment.score;
      const magnitude = analysis.sentiment.documentSentiment.magnitude;
      
      let documentTone: 'formal' | 'informal' | 'technical' | 'accessible';
      if (magnitude > 2.0) {
        documentTone = 'technical';
      } else if (sentimentScore > 0.1) {
        documentTone = 'accessible';
      } else if (sentimentScore < -0.1) {
        documentTone = 'formal';
      } else {
        documentTone = 'informal';
      }

      // Determine complexity level
      const avgSentenceLength = analysis.sentiment.sentences.length > 0 
        ? analysis.sentiment.sentences.reduce((sum, sent) => sum + sent.text.split(' ').length, 0) / analysis.sentiment.sentences.length
        : 0;
      
      let complexityLevel: 'low' | 'medium' | 'high';
      if (avgSentenceLength > 25) {
        complexityLevel = 'high';
      } else if (avgSentenceLength > 15) {
        complexityLevel = 'medium';
      } else {
        complexityLevel = 'low';
      }

      // Extract urgency indicators
      const urgencyIndicators = analysis.sentiment.sentences
        .filter(sentence => 
          sentence.text.toLowerCase().includes('urgent') ||
          sentence.text.toLowerCase().includes('immediate') ||
          sentence.text.toLowerCase().includes('deadline') ||
          sentence.text.toLowerCase().includes('due') ||
          sentence.text.toLowerCase().includes('time-sensitive')
        )
        .map(sentence => sentence.text);

      return {
        entities: analysis.entities,
        sentiment: analysis.sentiment,
        classification: analysis.classification,
        grantInsights: {
          fundingAgencies,
          eligibleEntities,
          keyRequirements,
          programAreas,
          geographicFocus,
          fundingAmounts,
          deadlines,
          contactInfo,
          documentTone,
          complexityLevel,
          urgencyIndicators,
        },
      };
    } catch (error) {
      console.error('Grant document NLP analysis error:', error);
      throw new Error(`Failed to analyze grant document: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze application content for improvement suggestions
   */
  async analyzeApplicationContent(content: string): Promise<{
    sentiment: SentimentAnalysis;
    entities: EntityAnalysis;
    writingQuality: {
      tone: 'professional' | 'casual' | 'technical' | 'persuasive';
      clarity: 'high' | 'medium' | 'low';
      impact: 'strong' | 'moderate' | 'weak';
      suggestions: string[];
    };
    keyMessages: string[];
    strengths: string[];
    areasForImprovement: string[];
  }> {
    try {
      const analysis = await this.analyzeText(content);
      
      // Analyze writing quality
      const sentimentScore = analysis.sentiment.documentSentiment.score;
      const magnitude = analysis.sentiment.documentSentiment.magnitude;
      
      let tone: 'professional' | 'casual' | 'technical' | 'persuasive';
      if (magnitude > 2.0) {
        tone = 'technical';
      } else if (sentimentScore > 0.3) {
        tone = 'persuasive';
      } else if (sentimentScore > 0) {
        tone = 'professional';
      } else {
        tone = 'casual';
      }

      // Assess clarity based on sentence complexity
      const avgSentenceLength = analysis.sentiment.sentences.length > 0 
        ? analysis.sentiment.sentences.reduce((sum, sent) => sum + sent.text.split(' ').length, 0) / analysis.sentiment.sentences.length
        : 0;
      
      let clarity: 'high' | 'medium' | 'low';
      if (avgSentenceLength < 15) {
        clarity = 'high';
      } else if (avgSentenceLength < 25) {
        clarity = 'medium';
      } else {
        clarity = 'low';
      }

      // Assess impact based on sentiment and entity salience
      const highSalienceEntities = analysis.entities.entities.filter(entity => entity.salience > 0.1);
      let impact: 'strong' | 'moderate' | 'weak';
      if (sentimentScore > 0.2 && highSalienceEntities.length > 5) {
        impact = 'strong';
      } else if (sentimentScore > 0 && highSalienceEntities.length > 2) {
        impact = 'moderate';
      } else {
        impact = 'weak';
      }

      // Generate suggestions
      const suggestions: string[] = [];
      if (clarity === 'low') {
        suggestions.push('Consider breaking down complex sentences for better clarity');
      }
      if (tone === 'casual') {
        suggestions.push('Use more professional language appropriate for grant applications');
      }
      if (impact === 'weak') {
        suggestions.push('Strengthen impact statements with more compelling language');
      }
      if (highSalienceEntities.length < 3) {
        suggestions.push('Include more specific details about your organization and project');
      }

      // Extract key messages
      const keyMessages = analysis.sentiment.sentences
        .filter(sentence => sentence.sentiment.magnitude > 1.0)
        .map(sentence => sentence.text)
        .slice(0, 5);

      // Identify strengths
      const strengths: string[] = [];
      if (tone === 'professional') strengths.push('Professional tone appropriate for grant writing');
      if (clarity === 'high') strengths.push('Clear and concise writing');
      if (impact === 'strong') strengths.push('Strong impact statements');
      if (highSalienceEntities.length > 5) strengths.push('Comprehensive coverage of key topics');

      // Identify areas for improvement
      const areasForImprovement: string[] = [];
      if (tone === 'casual') areasForImprovement.push('Improve professional tone');
      if (clarity === 'low') areasForImprovement.push('Enhance clarity and readability');
      if (impact === 'weak') areasForImprovement.push('Strengthen impact and persuasiveness');
      if (highSalienceEntities.length < 3) areasForImprovement.push('Add more specific details and examples');

      return {
        sentiment: analysis.sentiment,
        entities: analysis.entities,
        writingQuality: {
          tone,
          clarity,
          impact,
          suggestions,
        },
        keyMessages,
        strengths,
        areasForImprovement,
      };
    } catch (error) {
      console.error('Application content analysis error:', error);
      throw new Error(`Failed to analyze application content: ${(error as Error).message}`);
    }
  }
}

export const googleNlpService = new GoogleNlpService(); 