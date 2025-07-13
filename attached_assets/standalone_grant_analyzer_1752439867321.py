"""
Standalone Enhanced Grant Analysis System for CiviGrantAI
Version without Streamlit dependencies for Flask/Replit integration
"""

import re
import json
from datetime import datetime
from typing import Dict, List, Any

class EnhancedGrantAnalyzer:
    """
    Comprehensive grant document analyzer that extracts key information
    from grant announcements, RFPs, and funding opportunity notices
    """
    
    def __init__(self):
        self.analysis_results = {}
        
    def analyze_grant_document(self, document_text: str, document_name: str = "Grant Document") -> Dict[str, Any]:
        """
        Perform comprehensive analysis of grant document
        """
        
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
            'competitive_analysis': self._analyze_competitive_factors(document_text)
        }
        
        return analysis
    
    def _extract_document_info(self, text: str, document_name: str) -> Dict[str, Any]:
        """Extract basic document information"""
        
        # Extract funding opportunity number
        fonum_patterns = [
            r'Funding Opportunity Number[:\s]+([A-Z0-9]+)',
            r'NOFO[:\s]+([A-Z0-9]+)',
            r'Opportunity Number[:\s]+([A-Z0-9]+)'
        ]
        
        funding_opp_number = None
        for pattern in fonum_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                funding_opp_number = match.group(1)
                break
        
        # Extract program title
        title_patterns = [
            r'Program Title[:\s]+(.+?)(?:\n|$)',
            r'Funding Opportunity Title[:\s]+(.+?)(?:\n|$)',
            r'Notice of Funding Opportunity[:\s\n]+(.+?)(?:\n|Funding)'
        ]
        
        program_title = None
        for pattern in title_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                program_title = match.group(1).strip()
                break
        
        # Extract issuing agency
        agency_patterns = [
            r'Bureau of Land Management',
            r'Department of Transportation',
            r'National Science Foundation',
            r'Department of Health',
            r'Environmental Protection Agency',
            r'Department of Agriculture'
        ]
        
        issuing_agency = None
        for pattern in agency_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                issuing_agency = pattern
                break
        
        return {
            'document_name': document_name,
            'funding_opportunity_number': funding_opp_number,
            'program_title': program_title,
            'issuing_agency': issuing_agency,
            'analysis_date': datetime.now().isoformat(),
            'word_count': len(text.split()),
            'character_count': len(text)
        }
    
    def _extract_basic_information(self, text: str) -> Dict[str, Any]:
        """Extract basic grant information"""
        
        # Extract assistance listing number
        assistance_listing = None
        al_match = re.search(r'Assistance Listing Number[:\s]+([0-9.]+)', text, re.IGNORECASE)
        if al_match:
            assistance_listing = al_match.group(1)
        
        # Extract announcement type
        announcement_type = None
        at_match = re.search(r'Announcement Type[:\s]+(\w+)', text, re.IGNORECASE)
        if at_match:
            announcement_type = at_match.group(1)
        
        return {
            'assistance_listing_number': assistance_listing,
            'announcement_type': announcement_type
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
        applicant_patterns = [
            r'State governments?',
            r'County governments?',
            r'City or township governments?',
            r'Public and State controlled institutions of higher education',
            r'Native American tribal governments?',
            r'Nonprofits? having a 501\(c\)\(3\) status',
            r'Nonprofits? without 501\(c\)\(3\) status',
            r'Private institutions of higher education',
            r'501\(c\)\(3\) organizations?'
        ]
        
        for pattern in applicant_patterns:
            if re.search(pattern, eligibility_section, re.IGNORECASE):
                eligible_applicants.append(pattern.replace('?', ''))
        
        # Extract ineligible applicants
        ineligible_applicants = []
        if re.search(r'Individuals.*ineligible', text, re.IGNORECASE):
            ineligible_applicants.append('Individuals')
        if re.search(r'for-profit.*ineligible', text, re.IGNORECASE):
            ineligible_applicants.append('For-profit organizations')
        
        # Extract specific requirements
        requirements = []
        req_patterns = [
            r'must have.*?(?:\.|$)',
            r'required to.*?(?:\.|$)',
            r'shall.*?(?:\.|$)'
        ]
        
        for pattern in req_patterns:
            matches = re.findall(pattern, eligibility_section, re.IGNORECASE)
            requirements.extend([match.strip() for match in matches[:5]])  # Limit to 5
        
        return {
            'eligible_applicants': eligible_applicants,
            'ineligible_applicants': ineligible_applicants,
            'specific_requirements': requirements
        }
    
    def _extract_funding_details(self, text: str) -> Dict[str, Any]:
        """Extract funding information"""
        
        # Extract funding amounts
        amount_patterns = [
            r'\$[\d,]+(?:\.\d{2})?',
            r'up to \$[\d,]+',
            r'maximum of \$[\d,]+',
            r'not to exceed \$[\d,]+'
        ]
        
        funding_amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            funding_amounts.extend(matches)
        
        # Extract cost sharing requirements
        cost_sharing = None
        if re.search(r'cost shar|match|matching', text, re.IGNORECASE):
            cost_sharing_match = re.search(r'cost shar.*?(?:\.|$)', text, re.IGNORECASE)
            if cost_sharing_match:
                cost_sharing = cost_sharing_match.group(0).strip()
        
        # Extract project period
        project_period = None
        period_patterns = [
            r'project period.*?(?:\.|$)',
            r'performance period.*?(?:\.|$)',
            r'award period.*?(?:\.|$)'
        ]
        
        for pattern in period_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                project_period = match.group(0).strip()
                break
        
        return {
            'funding_amounts': funding_amounts[:5],  # Limit to 5
            'cost_sharing_requirement': cost_sharing,
            'project_period': project_period
        }
    
    def _extract_evaluation_criteria(self, text: str) -> Dict[str, Any]:
        """Extract evaluation criteria and scoring information"""
        
        # Find evaluation/merit review section
        eval_section = ""
        eval_match = re.search(r'(MERIT REVIEW|EVALUATION CRITERIA|REVIEW CRITERIA).*?(?=\n[A-Z]{2,}|\Z)', 
                              text, re.IGNORECASE | re.DOTALL)
        if eval_match:
            eval_section = eval_match.group(0)
        
        # Extract criteria categories
        criteria_patterns = [
            r'APPLICANT STATEMENT OF NEED',
            r'TECHNICAL APPROACH',
            r'PUBLIC BENEFIT',
            r'QUALIFICATIONS',
            r'PAST PERFORMANCE',
            r'BUDGET',
            r'PROJECT DESCRIPTION',
            r'METHODOLOGY',
            r'EVALUATION PLAN'
        ]
        
        evaluation_criteria = []
        for pattern in criteria_patterns:
            if re.search(pattern, eval_section, re.IGNORECASE):
                # Extract the section content
                section_match = re.search(f'{pattern}.*?(?=\n[A-Z]{{2,}}|\Z)', 
                                        eval_section, re.IGNORECASE | re.DOTALL)
                if section_match:
                    evaluation_criteria.append({
                        'category': pattern.title(),
                        'description': section_match.group(0).strip()[:500]  # Limit length
                    })
        
        # Extract scoring information
        scoring_info = []
        scoring_patterns = [
            r'Exceeds.*?(?=Meets|Does not meet|\n[A-Z])',
            r'Meets.*?(?=Does not meet|\n[A-Z])',
            r'Does not meet.*?(?=\n[A-Z])'
        ]
        
        for pattern in scoring_patterns:
            match = re.search(pattern, eval_section, re.IGNORECASE | re.DOTALL)
            if match:
                scoring_info.append(match.group(0).strip())
        
        return {
            'evaluation_criteria': evaluation_criteria,
            'scoring_methodology': scoring_info,
            'rating_scale': self._extract_rating_scale(eval_section)
        }
    
    def _extract_rating_scale(self, text: str) -> List[str]:
        """Extract rating scale information"""
        scales = []
        scale_patterns = [
            r'Exceeds.*expectations',
            r'Meets.*expectations', 
            r'Does not meet.*expectations',
            r'Outstanding',
            r'Good',
            r'Fair',
            r'Poor'
        ]
        
        for pattern in scale_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                scales.append(pattern)
        
        return scales
    
    def _extract_application_requirements(self, text: str) -> Dict[str, Any]:
        """Extract application requirements and documents needed"""
        
        # Find application section
        app_section = ""
        app_match = re.search(r'(APPLICATION|PREPARE YOUR APPLICATION).*?(?=\n[A-Z]{2,}|\Z)', 
                             text, re.IGNORECASE | re.DOTALL)
        if app_match:
            app_section = app_match.group(0)
        
        # Extract required documents
        required_docs = []
        doc_patterns = [
            r'project narrative',
            r'budget.*justification',
            r'letters? of support',
            r'organizational chart',
            r'staff qualifications',
            r'environmental compliance',
            r'monitoring.*plan',
            r'evaluation plan'
        ]
        
        for pattern in doc_patterns:
            if re.search(pattern, app_section, re.IGNORECASE):
                required_docs.append(pattern.title())
        
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
            r'submission.*deadline[:\s]+([^.\n]+)',
            r'applications.*due[:\s]+([^.\n]+)',
            r'deadline[:\s]+([^.\n]+)'
        ]
        
        submission_deadline = None
        for pattern in deadline_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                submission_deadline = match.group(1).strip()
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
            'submission_deadline': submission_deadline,
            'important_dates': list(set(important_dates))[:10]  # Remove duplicates, limit to 10
        }
    
    def _extract_program_priorities(self, text: str) -> Dict[str, Any]:
        """Extract program priorities and focus areas"""
        
        # Find program overview/description section
        program_section = ""
        program_match = re.search(r'(PROGRAM OVERVIEW|PROGRAM DESCRIPTION).*?(?=\n[A-Z]{2,}|\Z)', 
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
            priorities.extend([match.strip() for match in matches[:3]])  # Limit to 3 per keyword
        
        # Extract program goals
        goals = []
        goal_patterns = [
            r'goal.*?(?:\.|$)',
            r'objective.*?(?:\.|$)',
            r'purpose.*?(?:\.|$)'
        ]
        
        for pattern in goal_patterns:
            matches = re.findall(pattern, program_section, re.IGNORECASE)
            goals.extend([match.strip() for match in matches[:5]])
        
        return {
            'program_priorities': priorities[:10],  # Limit to 10
            'program_goals': goals[:10]
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
            success_factors.extend([match.strip() for match in matches[:3]])
        
        return success_factors[:8]  # Limit to 8
    
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
        
        return recommendations[:5]  # Limit to 5

# Demo function
def demo_analysis():
    """Demonstrate the enhanced analyzer with BLM grant sample"""
    
    blm_grant_text = '''
Bureau of Land Management
Notice of Funding Opportunity
FY25 Bureau of Land Management Wildlife Resource Management Program- Bureau wide
Funding Opportunity Number: L25AS00308

ELIGIBILITY
Eligible Applicants:
State governments
County governments  
City or township governments
Public and State controlled institutions of higher education
Native American tribal governments (Federally recognized)
Nonprofits having a 501(c)(3) status with the IRS, other than institutions of higher education

Additional Information on Eligibility:
Individuals and for-profit organizations are ineligible to apply for awards under this NOFO.

Estimated Total Program Funding: $10,000,000
Expected Number of Awards: 90
Award Ceiling: $1,500,000
Award Floor: $10,000
Cost Sharing Required: No

Closing Date: Applications must be submitted no later than 5:00 p.m., ET, July 23, 2025.

MERIT REVIEW
Proposals will be evaluated using the following merit review criteria:

APPLICANT STATEMENT OF NEED
• Mission and objectives, including achievable project goals and how they relate to Wildlife Resource Management
• Objectives of the project
• DOI priorities met

APPLICANT TECHNICAL APPROACH AND MONITORING
• Development and management plans
• Techniques, processes, and methodologies
• Data collection, analysis, and means of interpretation
• Environmental compliance plan
• Project monitoring and evaluation plan

PUBLIC BENEFIT AND PROGRAM INTEREST OF THE BLM
• Direct Public Benefit
• Projects in which the BLM receive the indirect benefit of conservation activities

APPLICANT QUALIFICATIONS/PAST PERFORMANCE
• Key project personnel experience and qualifications
• Qualifications of any contractors, subrecipients and/or consultants

Program priorities include:
• Conserving priority wildlife habitat
• Monitoring and inventorying wildlife populations
• Assessing wildlife habitat and measuring related resource management goals
• Enhancing the understanding of opportunities to conserve wildlife populations
• Supporting education opportunities to facilitate wildlife stewardship
'''

    analyzer = EnhancedGrantAnalyzer()
    analysis = analyzer.analyze_grant_document(blm_grant_text, 'BLM Wildlife Grant Demo')
    
    print('=== ENHANCED GRANT ANALYSIS DEMO ===')
    print()
    print('📄 DOCUMENT INFORMATION:')
    doc_info = analysis['document_info']
    print(f'  • Funding Opportunity Number: {doc_info.get("funding_opportunity_number", "N/A")}')
    print(f'  • Program Title: {doc_info.get("program_title", "N/A")}')
    print(f'  • Issuing Agency: {doc_info.get("issuing_agency", "N/A")}')
    print(f'  • Word Count: {doc_info.get("word_count", 0):,}')
    print()

    print('✅ ELIGIBILITY REQUIREMENTS:')
    eligibility = analysis['eligibility_requirements']
    if eligibility['eligible_applicants']:
        print('  Eligible Applicants:')
        for applicant in eligibility['eligible_applicants'][:5]:
            print(f'    • {applicant}')
    if eligibility['ineligible_applicants']:
        print('  Ineligible Applicants:')
        for applicant in eligibility['ineligible_applicants']:
            print(f'    • {applicant}')
    print()

    print('💰 FUNDING DETAILS:')
    funding = analysis['funding_details']
    if funding['funding_amounts']:
        print('  Funding Amounts:')
        for amount in funding['funding_amounts'][:3]:
            print(f'    • {amount}')
    print(f'  Cost Sharing: {funding.get("cost_sharing_requirement", "Not specified")}')
    print()

    print('⭐ EVALUATION CRITERIA:')
    evaluation = analysis['evaluation_criteria']
    if evaluation['evaluation_criteria']:
        for criteria in evaluation['evaluation_criteria'][:3]:
            print(f'  • {criteria["category"]}')
    print()

    print('🎯 STRATEGIC INSIGHTS:')
    insights = analysis['strategic_insights']
    print(f'  • Competitiveness Level: {insights.get("competitiveness_level", "N/A")}')
    if insights['strategic_insights']:
        print('  Key Insights:')
        for insight in insights['strategic_insights'][:3]:
            print(f'    • {insight}')
    print()

    print('🏆 COMPETITIVE ANALYSIS:')
    competitive = analysis['competitive_analysis']
    if competitive['recommended_positioning']:
        print('  Recommended Positioning:')
        for rec in competitive['recommended_positioning'][:3]:
            print(f'    • {rec}')
    print()

    print('✅ Analysis completed successfully!')
    print('This demonstrates the comprehensive analysis your enhanced system will provide.')
    
    return analysis

if __name__ == "__main__":
    demo_analysis()

