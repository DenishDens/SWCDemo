import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { message, userId, userRole, userProjects } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Extract query intent
    const queryType = extractQueryType(message);
    
    let response;
    
    switch (queryType) {
      case 'project':
        response = await handleProjectQuery(message, userId, userRole, userProjects);
        break;
      case 'incident':
        response = await handleIncidentQuery(message, userId, userRole, userProjects);
        break;
      case 'business_unit':
        response = await handleBusinessUnitQuery(message, userId, userRole, userProjects);
        break;
      default:
        response = await handleGeneralQuery(message);
    }
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json({ error: 'Failed to process your request' }, { status: 500 });
  }
}

function extractQueryType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
    return 'project';
  }
  
  if (lowerMessage.includes('incident') || lowerMessage.includes('incidents')) {
    return 'incident';
  }
  
  if (lowerMessage.includes('business unit') || lowerMessage.includes('business units')) {
    return 'business_unit';
  }
  
  return 'general';
}

async function handleProjectQuery(message: string, userId: string, userRole: string, userProjects: string[]) {
  // Apply role-based access control
  let projectQuery = supabase.from('projects').select('*');
  
  // For non-admin users, restrict to their projects
  if (userRole !== 'admin' && userProjects && userProjects.length > 0) {
    projectQuery = projectQuery.in('id', userProjects);
  }
  
  const { data: projects, error } = await projectQuery;
  
  if (error) {
    console.error('Error fetching projects:', error);
    return 'Sorry, I couldn\'t retrieve project information at this time.';
  }
  
  // Simple response based on available projects
  if (!projects || projects.length === 0) {
    return 'I couldn\'t find any projects matching your query.';
  }
  
  return `I found ${projects.length} projects. Here are some details:\n\n` +
    projects.slice(0, 5).map((project: any) => 
      `- ${project.name} (${project.status}): ${project.description?.substring(0, 100)}...`
    ).join('\n\n');
}

async function handleIncidentQuery(message: string, userId: string, userRole: string, userProjects: string[]) {
  // Apply role-based access control
  let incidentQuery = supabase.from('incidents').select('*, projects:project_id(name)');
  
  // For non-admin users, restrict to their projects
  if (userRole !== 'admin' && userProjects && userProjects.length > 0) {
    incidentQuery = incidentQuery.in('project_id', userProjects);
  }
  
  const { data: incidents, error } = await incidentQuery;
  
  if (error) {
    console.error('Error fetching incidents:', error);
    return 'Sorry, I couldn\'t retrieve incident information at this time.';
  }
  
  // Simple response based on available incidents
  if (!incidents || incidents.length === 0) {
    return 'I couldn\'t find any incidents matching your query.';
  }
  
  return `I found ${incidents.length} incidents. Here are some details:\n\n` +
    incidents.slice(0, 5).map((incident: any) => 
      `- ${incident.title} (${incident.status}): Project: ${incident.projects?.name || 'Unknown'}`
    ).join('\n\n');
}

async function handleBusinessUnitQuery(message: string, userId: string, userRole: string, userProjects: string[]) {
  // Apply role-based access control
  let buQuery = supabase.from('projects')
    .select('*')
    .eq('type', 'business_unit');
  
  // For non-admin users, restrict to their business units
  if (userRole !== 'admin' && userProjects && userProjects.length > 0) {
    buQuery = buQuery.in('id', userProjects);
  }
  
  const { data: businessUnits, error } = await buQuery;
  
  if (error) {
    console.error('Error fetching business units:', error);
    return 'Sorry, I couldn\'t retrieve business unit information at this time.';
  }
  
  // Simple response based on available business units
  if (!businessUnits || businessUnits.length === 0) {
    return 'I couldn\'t find any business units matching your query.';
  }
  
  return `I found ${businessUnits.length} business units. Here are some details:\n\n` +
    businessUnits.slice(0, 5).map((bu: any) => 
      `- ${bu.name} (${bu.status}): ${bu.description?.substring(0, 100)}...`
    ).join('\n\n');
}

async function handleGeneralQuery(message: string) {
  // Handle common queries
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! How can I assist you today?";
  }
  
  if (lowerMessage.includes('help')) {
    return "I can help you with information about your projects, business units, and incidents. You can ask questions like:\n\n" +
      "- Show me my projects\n" +
      "- List recent incidents\n" +
      "- Tell me about business unit X\n" +
      "- What's the status of project Y?";
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Let me know if you need anything else.";
  }
  
  // Default response for other queries
  return "I understand you're asking about: " + message + "\n\nFor specific project or incident information, please mention 'project', 'business unit', or 'incident' in your query.";
} 