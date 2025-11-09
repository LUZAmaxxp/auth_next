import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention } from '@/lib/models';
import { generateInterventionDoc } from '@/lib/docx-generator';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key');

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse request body
    const body = await request.json();

    // Validate required fields (matching frontend form)
    const {
      startDate,
      endDate,
      entrepriseName,
      responsable,
      teamMembers,
      siteName,
      recipientEmails,
      photoUrl
    } = body;

    if (!startDate || !endDate || !entrepriseName || !responsable ||
        !teamMembers || !siteName || !recipientEmails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate teamMembers is an array
    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'teamMembers must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate recipientEmails is an array of valid emails
    if (!Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json(
        { error: 'recipientEmails must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create new intervention (use the correct schema fields)
    const intervention = new Intervention({
      userId: session.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      entrepriseName,
      responsable,
      teamMembers,
      siteName,
      photoUrl,
      recipientEmails
    });

    // Save to database
    const savedIntervention = await intervention.save();

    // Generate DOCX report (map to expected format for docx generator)
    const docxData = {
      _id: savedIntervention._id,
      employeeName: responsable,
      employeeId: `EMP-${Date.now()}`,
      siteName,
      stationName: siteName,
      interventionType: 'Maintenance',
      description: `Intervention by ${responsable} at ${siteName}. Team: ${teamMembers.join(', ')}. Dates: ${startDate} to ${endDate}. Company: ${entrepriseName}`,
      priority: 'Medium',
      status: 'Pending',
      photoUrl: photoUrl, // Add this line
      recipientEmails,
      createdAt: savedIntervention.createdAt,
      updatedAt: savedIntervention.updatedAt
    };

    const docxBuffer = await generateInterventionDoc(docxData);

    // Send email with attachment (only if API key is available)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Intervention_Report_${timestamp}.docx`;

    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key') {
        await resend.emails.send({
          from: 'noreply@srm-sm.com',
          to: recipientEmails,
          subject: `New Intervention Report - ${siteName}`,
          text: 'Please find the attached intervention report.',
          attachments: [
            {
              filename: fileName,
              content: docxBuffer.toString('base64'),
              contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
          ],
        });
      } else {
        // Fallback to SMTP using nodemailer
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@srm-sm.com',
          to: recipientEmails.join(', '),
          subject: `New Intervention Report - ${siteName}`,
          text: 'Please find the attached intervention report.',
          attachments: [
            {
              filename: fileName,
              content: docxBuffer,
              contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
          ],
        });
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      ...savedIntervention.toObject(),
      message: 'Intervention submitted successfully and report sent to provided emails.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating intervention:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
