import { Resend } from 'resend';

// NOTE: Add RESEND_API_KEY to your .env file
export async function sendWelcomeEmail(toEmail: string, userName: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ [PrepEdge] Skipping Welcome Email: RESEND_API_KEY is not defined in .env");
    return { success: false, error: "API Key missing" };
  }

  const resend = new Resend(apiKey);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prepedge-mock.vercel.app';

  try {
    const { data, error } = await resend.emails.send({
      from: 'PrepEdge <onboarding@resend.dev>', // Update this with your verified domain in Production
      to: [toEmail],
      subject: `Welcome to PrepEdge, ${userName}! Your AI Interview Journey Starts Here!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #11111d; border: 1px solid #1e1e2e; border-radius: 32px; padding: 40px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            .logo-container { display: flex; align-items: center; justify-content: center; gap: 12px; text-decoration: none; margin-bottom: 30px; }
            .logo-img { padding: 4px; background-color: #f9fafb; border-radius: 12px; }
            .logo-text { color: #ffffff; font-weight: 800; font-size: 30px; margin: 0; letter-spacing: -0.5px; font-family: sans-serif; }
            .logo-span { color: #3b82f6; }
            h1 { font-size: 28px; font-weight: 700; margin-bottom: 20px; color: #fff; line-height: 1.3; }
            p { font-size: 16px; line-height: 1.6; color: #9ca3af; margin-bottom: 24px; text-align: left; }
            .founders-note { background: rgba(59, 130, 246, 0.05); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: left; }
            .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 16px 32px; border-radius: 16px; font-weight: 700; font-size: 16px; margin: 20px 0; }
            .social-section { margin-top: 40px; padding-top: 30px; border-top: 1px solid #1e1e2e; }
            .social-title { font-size: 14px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
            .social-links { display: flex; justify-content: center; gap: 15px; }
            .social-icon { display: inline-block; width: 40px; height: 40px; line-height: 40px; background: #1e1e2e; border-radius: 10px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; }
            .footer p { font-size: 12px; color: #52525b; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <!-- Text-only Branding Link -->
              <a href="${baseUrl}" class="logo-container">
                  <h1 class="logo-text">Prep<span class="logo-span">Edge</span></h1>
              </a>

              <h1>Hi ${userName},</h1>
              <p>
                Welcome to <strong>PrepEdge</strong>, your new partner in mastering the art of the interview.
              </p>

              <div class="founders-note">
                <p style="margin-bottom: 0;">
                  Founded by <strong>Sudeep Verma</strong> and <strong>Piyush Mahale</strong>, PrepEdge was built with one goal in mind: 
                  to give you the edge you need to land your dream job using the power of AI. 
                  Whether you're here to polish your speaking skills or tackle technical questions, we’ve got you covered.
                </p>
              </div>
              
              <p>Ready to dive in and transform your carrier prospects?</p>
              
              <a href="${baseUrl}/interview" class="btn">Start Your First Mock Interview</a>

              <p style="text-align: center; margin-top: 30px;">
                Cheers,<br/>
                <strong>The PrepEdge Team</strong>
              </p>

              <div class="social-section" style="border-top: 1px solid #1e1e2e; padding-top: 30px; margin-top: 40px;">
                <div class="social-title" style="font-size: 14px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">Stay Connected</div>
                <div class="social-links" style="display: flex; justify-content: center; gap: 20px; font-weight: bold;">
                  <a href="https://in.linkedin.com/in/sudeep9111" style="color: #3b82f6; text-decoration: none;">LinkedIn</a>
                  <a href="https://www.instagram.com/_sudeepver/" style="color: #3b82f6; text-decoration: none;">Instagram</a>
                  <a href="https://github.com/sudeep9111" style="color: #3b82f6; text-decoration: none;">GitHub</a>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>© 2026 PrepEdge • Built with ❤️ by Sudeep & Piyush</p>
              <p>You received this email because you signed up for PrepEdge.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Email Error:", error);
      return { success: false, error };
    }

    console.log("✅ Welcome Email sent to:", toEmail);
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Send Email Error Details:", {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack
    });
    return { success: false, error: err };
  }
}

export async function sendInterviewReminderEmail(toEmail: string, userName: string, date: string, time?: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ [PrepEdge] Skipping Reminder Email: RESEND_API_KEY is not defined in .env");
    return { success: false, error: "API Key missing" };
  }

  const resend = new Resend(apiKey);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://prepedge-mock.vercel.app';

  const formattedDate = new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeDisplay = time ? `at ${time}` : '';
  const subjectTime = time ? ` at ${time}` : '';

  try {
    const { data, error } = await resend.emails.send({
      from: 'PrepEdge <onboarding@resend.dev>', // Update this with your verified domain in Production
      to: [toEmail],
      subject: `Interview Reminder: ${formattedDate}${subjectTime} — It's your PrepEdge Day!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #11111d; border: 1px solid #1e1e2e; border-radius: 32px; padding: 40px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            .logo-text { color: #ffffff; font-weight: 800; font-size: 30px; margin: 0; letter-spacing: -1px; font-family: sans-serif; text-decoration: none; }
            .logo-span { color: #3b82f6; }
            h1 { font-size: 28px; font-weight: 700; margin-bottom: 20px; color: #fff; line-height: 1.3; }
            p { font-size: 16px; line-height: 1.6; color: #9ca3af; margin-bottom: 24px; text-align: left; }
            .highlight-box { background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1); padding: 30px; border-radius: 20px; margin: 30px 0; text-align: center; }
            .date-text { font-size: 24px; font-weight: 800; color: #3b82f6; margin: 10px 0; }
            .time-text { font-size: 20px; font-weight: 800; color: #818cf8; margin: 8px 0 0 0; }
            .time-badge { display: inline-block; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); padding: 8px 20px; border-radius: 12px; margin-top: 12px; }
            .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 18px 36px; border-radius: 16px; font-weight: 700; font-size: 16px; margin: 20px 0; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2); }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #52525b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div style="margin-bottom: 30px;">
                <h2 class="logo-text">Prep<span class="logo-span">Edge</span></h2>
              </div>
              
              <h1>Hello ${userName},</h1>
              <p>It's your scheduled interview day on <strong>PrepEdge</strong>! You set this goal to master your skills, and now it's time to take the next step.</p>
              
              <div class="highlight-box">
                <p style="text-align: center; margin-bottom: 5px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Scheduled For</p>
                <div class="date-text">${formattedDate}</div>
                ${time ? `
                <div class="time-badge">
                  <span style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px;">⏰ Time</span>
                  <div class="time-text">${time}</div>
                </div>
                ` : ''}
                <p style="text-align: center; margin-top: 15px; color: #9ca3af;">Status: <span style="color: #fbbf24; font-weight: 700;">Action Required</span></p>
              </div>

              <h1>Let's start your interview${timeDisplay}!</h1>
              <p>Ready to crush it? Our AI is waiting to give you real-time feedback and help you land that dream job.</p>
              
              <a href="${baseUrl}/interview" class="btn">Start Your Interview Now</a>

              <p style="text-align: center; margin-top: 30px; color: #71717a;">
                Go get 'em!<br/>
                <strong>The PrepEdge Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>© 2026 PrepEdge • Built with Master Intelligence</p>
              <p>Master the Art of the Interview</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Email Reminder Error:", error);
      return { success: false, error };
    }

    console.log("✅ Interview Reminder Email sent to:", toEmail);
    return { success: true, data };
  } catch (err: any) {
    console.error("❌ Send Email Error Details:", err);
    return { success: false, error: err };
  }
}
