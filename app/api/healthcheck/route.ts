import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

// GET method to retrieve health status and git information
export async function GET(request: NextRequest) {
  try {
    const currentDateTime = new Date().toISOString();
    
    // Get git commit SHA and time for main branch
    let gitCommitSha = 'unknown';
    let gitCommitTime = 'unknown';
    
    try {
      // Get the latest commit SHA on main branch
      gitCommitSha = execSync('git rev-parse HEAD', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      // Get the commit time for the latest commit
      gitCommitTime = execSync('git log -1 --format=%cd --date=iso', { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
    } catch (gitError) {
      console.warn('Could not retrieve git information:', gitError);
      // Keep default values if git commands fail
    }
    
    const healthData = {
      status: 'healthy',
      timestamp: currentDateTime,
      git: {
        commit_sha: gitCommitSha,
        commit_time: gitCommitTime
      }
    };
    
    return NextResponse.json(healthData);
    
  } catch (error) {
    console.error('Error retrieving health status:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Failed to retrieve health status',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 
