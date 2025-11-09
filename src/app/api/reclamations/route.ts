import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Reclamation } from '@/lib/models';
import { generateReclamationDoc } from '@/lib/docx-generator';
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

    // Validate required fields (matching the actual schema)
    const {
      date,
      stationName,
      reclamationType,
      description,
      photoUrl,
      recipientEmails
    } = body;

    if (!date || !stationName || !reclamationType || !description || !recipientEmails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate reclamationType
    const validTypes = ['hydraulic', 'electric', 'mechanic'];
    if (!validTypes.includes(reclamationType)) {
      return NextResponse.json(
        { error: 'Invalid reclamationType. Must be one of: hydraulic, electric, mechanic' },
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

    // Create new reclamation (use correct schema fields)
    const reclamation = new Reclamation({
      userId: session.user.id,
      date: new Date(date),
      stationName,
      reclamationType,
      description,
      photoUrl,
      recipientEmails
    });

    // Save to database
    const savedReclamation = await reclamation.save();

    // Generate DOCX report
    const docxData = {
      _id: savedReclamation._id.toString(),
      employeeName: session.user.name || 'N/A',
      employeeId: `EMP-${Date.now()}`,
      siteName: stationName,
      stationName: stationName,
      reclamationType: reclamationType,
      description: description,
      priority: 'Medium',
      status: 'Pending',
      photoUrl: photoUrl,
      recipientEmails: recipientEmails,
      createdAt: savedReclamation.createdAt,
      updatedAt: savedReclamation.updatedAt
    };

    const docxBuffer = await generateReclamationDoc(docxData);

    // Send email with attachment using SMTP (fallback to Resend if available)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Reclamation_Report_${timestamp}.docx`;

    try {
      // Try Resend first if API key is available and not restricted
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy-key') {
        await resend.emails.send({
          from: 'noreply@srm-sm.com',
          to: recipientEmails,
          subject: `New Reclamation Report - ${stationName}`,
          text: 'Please find the attached reclamation report.',
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
          subject: `New Reclamation Report - ${stationName}`,
          text: 'Please find the attached reclamation report.',
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
      ...savedReclamation.toObject(),
      message: 'Reclamation submitted successfully and report sent to provided emails.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reclamation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
