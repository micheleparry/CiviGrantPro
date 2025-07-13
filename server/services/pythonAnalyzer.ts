import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { writeFile, unlink } from 'fs/promises';

interface GrantAnalysisResult {
  document_info: {
    funding_opportunity_number: string;
    program_title: string;
    issuing_agency: string;
    document_name: string;
    word_count: number;
    character_count: number;
  };
  basic_information: {
    program_description: string;
  };
  eligibility_requirements: {
    eligible_applicants: string[];
    ineligible_applicants: string[];
    additional_requirements: string[];
  };
  funding_details: {
    funding_amounts: string[];
    cost_sharing_requirement: string;
  };
  evaluation_criteria: {
    evaluation_criteria: Array<{
      category: string;
      weight: string;
      description: string;
    }>;
    rating_scale: string[];
  };
  application_requirements: {
    required_documents: string[];
    page_limits: string[];
    format_requirements: string[];
  };
  deadlines_and_dates: {
    submission_deadline: string;
    important_dates: string[];
  };
  program_priorities: {
    program_priorities: string[];
    program_goals: string[];
  };
  compliance_requirements: {
    compliance_requirements: Array<{
      requirement: string;
      context: string;
    }>;
  };
  strategic_insights: {
    strategic_insights: string[];
    competitiveness_level: string;
    key_success_factors: string[];
  };
  competitive_analysis: {
    competitive_volume_indicators: string[];
    differentiation_opportunities: string[];
    recommended_positioning: string[];
  };
  analysis_metadata: {
    timestamp: string;
    document_name: string;
    analyzer_version: string;
  };
  error?: string;
}

export class PythonGrantAnalyzer {
  private pythonScriptPath: string;

  constructor() {
    this.pythonScriptPath = path.join(__dirname, 'grant_analyzer.py');
  }

  async analyzeGrantDocument(documentText: string, documentName: string = "Grant Document"): Promise<GrantAnalysisResult> {
    try {
      // Run the Python script with the document text
      const result = await this.runPythonScript(documentText, documentName);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing grant document:', error);
      throw new Error(`Grant analysis failed: ${error.message}`);
    }
  }

  private async runPythonScript(documentText: string, documentName: string): Promise<GrantAnalysisResult> {
    return new Promise((resolve, reject) => {
      // Escape the document text for command line
      const escapedText = documentText.replace(/"/g, '\\"');
      const escapedName = documentName.replace(/"/g, '\\"');
      
      const pythonProcess = spawn('python3', [
        this.pythonScriptPath,
        escapedText,
        escapedName
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python script output: ${parseError.message}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python script: ${error.message}`));
      });
    });
  }

  async processUploadedFile(filePath: string, fileType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [
        '-c',
        `
import sys
import os
sys.path.append('${path.dirname(this.pythonScriptPath)}')
from grant_analyzer import process_file_content

try:
    result = process_file_content('${filePath}', '${fileType}')
    print(result)
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
        `
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`File processing failed: ${stderr}`));
          return;
        }

        if (stdout.startsWith('ERROR:')) {
          reject(new Error(stdout.replace('ERROR:', '').trim()));
          return;
        }

        resolve(stdout.trim());
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to process file: ${error.message}`));
      });
    });
  }
}

export const pythonAnalyzer = new PythonGrantAnalyzer();