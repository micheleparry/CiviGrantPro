#!/usr/bin/env python3
"""
Enhanced Grant Analysis System for CiviGrantAI
Integrated version for TypeScript/React application
"""

import json
import re
import sys
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import PyPDF2
import docx
import io

class EnhancedGrantAnalyzer:
    """
    Comprehensive grant document analyzer that extracts key information
    from grant announcements, RFPs, and funding opportunity notices
    """
    
    def __init__(self):
        self.analysis_timestamp = datetime.now().isoformat()
    
    def analyze_grant_document(self, document_text: str, document_name: str = "Grant Document") -> Dict[str, Any]:
        """
        Perform comprehensive analysis of grant document
        """
        try:
            # Comprehensive analysis structure
            analysis = {
                'document_info': self._extract_document_info(document_text, document_name),
                'basic_information': self._extract_basic_information(document_text),
                'eligibility_requirements': self._extract_eligibility_requirements(document_text),
                'funding_details': self._extract_funding_details(document_text),
                'evaluation_criteria': self._extract_evaluation_criteria(document_text),
                'application_requirements': self._extract_application_requirements(document_text),
                'deadlines_and_dates': self._extract_deadlines_and_dates(document_text),
                'program_priorities': self._extract_program_priorities(document_text),
                'compliance_requirements': self._extract_compliance_requirements(document_text),
                'strategic_insights': self._generate_strategic_insights(document_text),
                'competitive_analysis': self._analyze_competitive_factors(document_text),
                'analysis_metadata': {
                    'timestamp': self.analysis_timestamp,
                    'document_name': document_name,
                    'analyzer_version': '2.0'
                }
            }
            
            return analysis
            
        except Exception as e:
            return {
                'error': f"Analysis failed: {str(e)}",
                'document_name': document_name,
                'timestamp': self.analysis_timestamp
            }
    
    def _extract_document_info(self, text: str, document_name: str) -> Dict[str, Any]:
        """Extract basic document information"""
        
        # Extract funding opportunity number
        fonum_patterns = [
            r'Funding Opportunity Number:\s*([A-Z0-9]+)',
            r'FONUM:\s*([A-Z0-9]+)',
            r'Opportunity Number:\s*([A-Z0-9]+)'
        ]
        
        funding_opportunity_number = None
        for pattern in fonum_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                funding_opportunity_number = match.group(1)
                break
        
        # Extract program title
        title_patterns = [
            r'Program Title:\s*([^\n]+)',
            r'TITLE:\s*([^\n]+)',
            r'Notice of Funding Opportunity\s*([^\n]+)'
        ]
        
        program_title = None
        for pattern in title_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                program_title = match.group(1).strip()
                break
        
        # Extract issuing agency
        agency_patterns = [
            r'Bureau of ([^\n]+)',
            r'Department of ([^\n]+)',
            r'Agency:\s*([^\n]+)'
        ]
        
        issuing_agency = None
        for pattern in agency_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                issuing_agency = match.group(0).strip()
                break
        
        return {
            'funding_opportunity_number': funding_opportunity_number or "Not specified",
            'program_title': program_title or "Not specified",
            'issuing_agency': issuing_agency or "Not specified",
            'document_name': document_name,
            'word_count': len(text.split()),
            'character_count': len(text)
        }
    
    def _extract_basic_information(self, text: str) -> Dict[str, Any]:
        """Extract basic grant information"""
        
        # Extract program description
        desc_patterns = [
            r'Program Description\s*([^A-Z]{100,})',
            r'DESCRIPTION\s*([^A-Z]{100,})',
            r'Overview\s*([^A-Z]{100,})'
        ]
        
        program_description = None
        for pattern in desc_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                program_description = match.group(1).strip()[:500]  # Limit to 500 chars
                break
        
        return {
            'program_description': program_description or "Not specified"
        }
    
    def _extract_eligibility_requirements(self, text: str) -> Dict[str, Any]:
        """Extract eligibility requirements"""
        
        # Find eligibility section
        eligibility_section = ""
        eligibility_match = re.search(r'ELIGIBILITY.*?(?=\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
        if eligibility_match:
            eligibility_section = eligibility_match.group(0)
        
        # Extract eligible applicants
        eligible_applicants = []
        eligible_patterns = [
            r'State governments',
            r'Local governments',
            r'County governments',
            r'City.*governments',
            r'Township governments',
            r'Tribal governments',
            r'Native American.*governments',
            r'Public.*institutions',
            r'Private.*institutions',
            r'Higher education',
            r'Nonprofits',
            r'501\(c\)\(3\)',
            r'For-profit.*organizations',
            r'Small businesses'
        ]
        
        for pattern in eligible_patterns:
            if re.search(pattern, eligibility_section, re.IGNORECASE):
                eligible_applicants.append(pattern.replace('.*', ' ').replace('\\', ''))
        
        # Extract ineligible applicants
        ineligible_applicants = []
        ineligible_patterns = [
            r'Individuals.*ineligible',
            r'For-profit.*ineligible',
            r'Foreign.*entities.*ineligible'
        ]
        
        for pattern in ineligible_patterns:
            if re.search(pattern, eligibility_section, re.IGNORECASE):
                ineligible_applicants.append("Individuals and for-profit organizations")
        
        return {
            'eligible_applicants': eligible_applicants[:10],  # Limit to 10
            'ineligible_applicants': ineligible_applicants[:5],  # Limit to 5
            'additional_requirements': []
        }
    
    def _extract_funding_details(self, text: str) -> Dict[str, Any]:
        """Extract funding information"""
        
        # Extract funding amounts
        amount_patterns = [
            r'Award Ceiling:\s*\$([0-9,]+)',
            r'Award Floor:\s*\$([0-9,]+)',
            r'Total.*Funding:\s*\$([0-9,]+)',
            r'Maximum.*Award:\s*\$([0-9,]+)',
            r'Minimum.*Award:\s*\$([0-9,]+)'
        ]
        
        funding_amounts = []
        for pattern in amount_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                amount_type = match.group(0).split(':')[0].strip()
                amount_value = match.group(1)
                funding_amounts.append(f"{amount_type}: ${amount_value}")
        
        # Extract cost sharing requirement
        cost_sharing_requirement = "Not specified"
        if re.search(r'Cost Sharing.*Required:\s*No', text, re.IGNORECASE):
            cost_sharing_requirement = "No"
        elif re.search(r'Cost Sharing.*Required:\s*Yes', text, re.IGNORECASE):
            cost_sharing_requirement = "Yes"
        
        return {
            'funding_amounts': funding_amounts[:5],  # Limit to 5
            'cost_sharing_requirement': cost_sharing_requirement
        }
    
    def _extract_evaluation_criteria(self, text: str) -> Dict[str, Any]:
        """Extract evaluation criteria and scoring information"""
        
        # Find merit review section
        merit_section = ""
        merit_match = re.search(r'MERIT REVIEW.*?(?=\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
        if merit_match:
            merit_section = merit_match.group(0)
        
        # Extract evaluation criteria
        evaluation_criteria = []
        
        # Look for section headers in caps
        criteria_patterns = [
            r'([A-Z\s]+STATEMENT[A-Z\s]+)',
            r'([A-Z\s]+TECHNICAL[A-Z\s]+)',
            r'([A-Z\s]+APPROACH[A-Z\s]+)',
            r'([A-Z\s]+BENEFIT[A-Z\s]+)',
            r'([A-Z\s]+QUALIFICATIONS[A-Z\s]+)',
            r'([A-Z\s]+PERFORMANCE[A-Z\s]+)'
        ]
        
        for pattern in criteria_patterns:
            matches = re.finditer(pattern, merit_section)
            for match in matches:
                criteria_name = match.group(1).strip()
                if len(criteria_name) > 10:  # Filter out very short matches
                    evaluation_criteria.append({
                        'category': criteria_name,
                        'weight': 'Not specified',
                        'description': 'Extracted from merit review section'
                    })
        
        return {
            'evaluation_criteria': evaluation_criteria[:6],  # Limit to 6
            'rating_scale': self._extract_rating_scale(merit_section)
        }
    
    def _extract_rating_scale(self, text: str) -> List[str]:
        """Extract rating scale information"""
        
        rating_scales = []
        
        # Common rating scale patterns
        scale_patterns = [
            r'Exceeds.*meets.*does not meet',
            r'Excellent.*Good.*Fair.*Poor',
            r'Outstanding.*Satisfactory.*Unsatisfactory',
            r'Superior.*Acceptable.*Unacceptable'
        ]
        
        for pattern in scale_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                rating_scales.append(pattern.replace('.*', ' - '))
        
        return rating_scales[:3]  # Limit to 3
    
    def _extract_application_requirements(self, text: str) -> Dict[str, Any]:
        """Extract application requirements and documents needed"""
        
        # Find application section
        app_section = ""
        app_match = re.search(r'APPLICATION.*?(?=\n[A-Z]{2,}|\Z)', text, re.IGNORECASE | re.DOTALL)
        if app_match:
            app_section = app_match.group(0)
        
        # Extract required documents
        required_docs = []
        doc_patterns = [
            r'SF-424',
            r'Budget Information',
            r'Project Narrative',
            r'Budget Narrative',
            r'Biographical Sketch',
            r'Current and Pending Support',
            r'Letters of Support',
            r'Curriculum Vitae',
            r'Project Abstract'
        ]
        
        for pattern in doc_patterns:
            if re.search(pattern, app_section, re.IGNORECASE):
                required_docs.append(pattern)
        
        # Extract page limits
        page_limits = []
        page_matches = re.findall(r'(\d+)\s*pages?', app_section, re.IGNORECASE)
        if page_matches:
            page_limits = [f"{match} pages" for match in page_matches]
        
        # Extract format requirements
        format_requirements = []
        format_patterns = [
            r'double.?spaced',
            r'single.?spaced',
            r'12.?point font',
            r'Times New Roman',
            r'Arial',
            r'PDF format'
        ]
        
        for pattern in format_patterns:
            if re.search(pattern, app_section, re.IGNORECASE):
                format_requirements.append(pattern)
        
        return {
            'required_documents': required_docs,
            'page_limits': page_limits,
            'format_requirements': format_requirements
        }
    
    def _extract_deadlines_and_dates(self, text: str) -> Dict[str, Any]:
        """Extract important dates and deadlines"""
        
        # Extract submission deadline
        deadline_patterns = [
            r'Closing Date.*?(\d{2}/\d{2}/\d{4})',
            r'deadline.*?(\d{2}/\d{2}/\d{4})',
            r'due.*?(\d{2}/\d{2}/\d{4})',
            r'July \d{1,2}, \d{4}',
            r'(\d{2}/\d{2}/\d{4})'
        ]
        
        submission_deadline = None
        for pattern in deadline_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                submission_deadline = match.group(0).strip()
                break
        
        # Extract other important dates
        date_patterns = [
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
            r'\b\d{1,2}/\d{1,2}/\d{4}\b',
            r'\b\d{4}-\d{2}-\d{2}\b'
        ]
        
        important_dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            important_dates.extend(matches)
        
        return {
            'submission_deadline': submission_deadline or "Not specified",
            'important_dates': list(set(important_dates))[:10]  # Remove duplicates, limit to 10
        }
    
    def _extract_program_priorities(self, text: str) -> Dict[str, Any]:
        """Extract program priorities and focus areas"""
        
        # Find program overview/description section
        program_section = ""
        program_match = re.search(r'(Program.*Description|PROGRAM.*OVERVIEW).*?(?=\n[A-Z]{2,}|\Z)', 
                                 text, re.IGNORECASE | re.DOTALL)
        if program_match:
            program_section = program_match.group(0)
        
        # Extract priority areas
        priority_keywords = [
            'priority', 'focus', 'emphasis', 'important', 'critical', 
            'essential', 'key', 'primary', 'main', 'principal'
        ]
        
        priorities = []
        for keyword in priority_keywords:
            pattern = f'{keyword}.*?(?:\.|$)'
            matches = re.findall(pattern, program_section, re.IGNORECASE)
            priorities.extend([match.strip() for match in matches[:2]])  # Limit to 2 per keyword
        
        # Extract program goals
        goals = []
        goal_patterns = [
            r'goal.*?(?:\.|$)',
            r'objective.*?(?:\.|$)',
            r'purpose.*?(?:\.|$)'
        ]
        
        for pattern in goal_patterns:
            matches = re.findall(pattern, program_section, re.IGNORECASE)
            goals.extend([match.strip() for match in matches[:3]])
        
        return {
            'program_priorities': priorities[:8],  # Limit to 8
            'program_goals': goals[:8]
        }
    
    def _extract_compliance_requirements(self, text: str) -> Dict[str, Any]:
        """Extract compliance and regulatory requirements"""
        
        compliance_keywords = [
            'environmental compliance',
            'NEPA',
            'civil rights',
            'equal opportunity',
            'accessibility',
            'reporting requirements',
            'audit',
            'federal regulations'
        ]
        
        compliance_requirements = []
        for keyword in compliance_keywords:
            if re.search(keyword, text, re.IGNORECASE):
                # Extract surrounding context
                pattern = f'.{{0,100}}{keyword}.{{0,100}}'
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    compliance_requirements.append({
                        'requirement': keyword,
                        'context': match.group(0).strip()
                    })
        
        return {
            'compliance_requirements': compliance_requirements
        }
    
    def _generate_strategic_insights(self, text: str) -> Dict[str, Any]:
        """Generate strategic insights for competitive advantage"""
        
        insights = []
        
        # Analyze competitive factors
        if re.search(r'partnership|collaboration|cooperative', text, re.IGNORECASE):
            insights.append("Partnership/collaboration emphasis - consider forming strategic partnerships")
        
        if re.search(r'innovation|innovative|novel', text, re.IGNORECASE):
            insights.append("Innovation focus - highlight unique/innovative approaches in proposal")
        
        if re.search(r'community|public benefit|stakeholder', text, re.IGNORECASE):
            insights.append("Community engagement important - emphasize stakeholder involvement")
        
        if re.search(r'data|monitoring|evaluation|assessment', text, re.IGNORECASE):
            insights.append("Data-driven approach valued - include robust monitoring and evaluation plan")
        
        if re.search(r'sustainability|long.?term|ongoing', text, re.IGNORECASE):
            insights.append("Sustainability focus - develop strong continuation plan beyond grant period")
        
        # Analyze funding competitiveness
        competitiveness_score = 0
        if re.search(r'limited funding|competitive', text, re.IGNORECASE):
            competitiveness_score += 1
        if re.search(r'merit review|peer review', text, re.IGNORECASE):
            competitiveness_score += 1
        if re.search(r'exceeds.*meets.*does not meet', text, re.IGNORECASE):
            competitiveness_score += 1
        
        competitiveness_level = "High" if competitiveness_score >= 2 else "Medium" if competitiveness_score == 1 else "Low"
        
        return {
            'strategic_insights': insights,
            'competitiveness_level': competitiveness_level,
            'key_success_factors': self._identify_success_factors(text)
        }
    
    def _identify_success_factors(self, text: str) -> List[str]:
        """Identify key success factors from the grant text"""
        
        success_factors = []
        
        # Look for emphasized terms and phrases
        emphasis_patterns = [
            r'must demonstrate.*?(?:\.|$)',
            r'should include.*?(?:\.|$)', 
            r'required to.*?(?:\.|$)',
            r'essential.*?(?:\.|$)',
            r'critical.*?(?:\.|$)'
        ]
        
        for pattern in emphasis_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            success_factors.extend([match.strip() for match in matches[:2]])
        
        return success_factors[:6]  # Limit to 6
    
    def _analyze_competitive_factors(self, text: str) -> Dict[str, Any]:
        """Analyze competitive factors and positioning"""
        
        # Analyze application volume indicators
        volume_indicators = []
        if re.search(r'limited.*fund|competitive.*process', text, re.IGNORECASE):
            volume_indicators.append("Highly competitive funding process")
        
        if re.search(r'merit.*review|peer.*review', text, re.IGNORECASE):
            volume_indicators.append("Merit-based review process")
        
        # Analyze differentiation opportunities
        differentiation_ops = []
        if re.search(r'innovation|novel|unique', text, re.IGNORECASE):
            differentiation_ops.append("Innovation and uniqueness valued")
        
        if re.search(r'partnership|collaboration', text, re.IGNORECASE):
            differentiation_ops.append("Strategic partnerships can provide advantage")
        
        if re.search(r'experience|track record|past performance', text, re.IGNORECASE):
            differentiation_ops.append("Demonstrated experience is important")
        
        return {
            'competitive_volume_indicators': volume_indicators,
            'differentiation_opportunities': differentiation_ops,
            'recommended_positioning': self._generate_positioning_recommendations(text)
        }
    
    def _generate_positioning_recommendations(self, text: str) -> List[str]:
        """Generate positioning recommendations based on grant analysis"""
        
        recommendations = []
        
        if re.search(r'public benefit|community', text, re.IGNORECASE):
            recommendations.append("Position project as high-impact community benefit initiative")
        
        if re.search(r'data|evidence|research', text, re.IGNORECASE):
            recommendations.append("Emphasize evidence-based approach and data-driven methodology")
        
        if re.search(r'partnership|collaboration', text, re.IGNORECASE):
            recommendations.append("Highlight strategic partnerships and collaborative approach")
        
        if re.search(r'innovation|cutting.edge', text, re.IGNORECASE):
            recommendations.append("Showcase innovative methods and cutting-edge approaches")
        
        if re.search(r'sustainability|long.term', text, re.IGNORECASE):
            recommendations.append("Develop strong sustainability and long-term impact narrative")
        
        return recommendations[:4]  # Limit to 4

def process_file_content(file_path: str, file_type: str) -> str:
    """Process uploaded file and extract text content"""
    
    try:
        if file_type == 'pdf':
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        
        elif file_type == 'docx':
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        
        elif file_type == 'txt':
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
            
    except Exception as e:
        raise Exception(f"Error processing file: {str(e)}")

def main():
    """Main function to handle command line arguments and process grant analysis"""
    
    try:
        # Check if we have the correct number of arguments
        if len(sys.argv) < 2:
            print(json.dumps({"error": "Usage: python grant_analyzer.py <document_text> [document_name]"}))
            sys.exit(1)
        
        document_text = sys.argv[1]
        document_name = sys.argv[2] if len(sys.argv) > 2 else "Grant Document"
        
        # Initialize analyzer
        analyzer = EnhancedGrantAnalyzer()
        
        # Perform analysis
        analysis_result = analyzer.analyze_grant_document(document_text, document_name)
        
        # Output JSON result
        print(json.dumps(analysis_result, indent=2))
        
    except Exception as e:
        error_result = {
            "error": f"Analysis failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()