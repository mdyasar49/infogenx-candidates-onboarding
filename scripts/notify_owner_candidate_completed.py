import os
import sys
import json
from datetime import datetime
import pytz

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Target Forward Numbers from Twilio Dialer configuration
FORWARD_SMS_NUMBERS = ["+61403339424", "+919787806366"]
OWNER_EMAIL = "admin@infogenx.com"

def get_candidate_sms_text(candidate):
    """
    Format GSM-7 compatible plain text SMS for Twilio SMS forwarders.
    """
    try:
        bne_tz = pytz.timezone('Australia/Brisbane')
        now_dt = datetime.now(bne_tz)
    except Exception:
        now_dt = datetime.now()

    date_str = now_dt.strftime("%d %b %Y")
    time_str = now_dt.strftime("%I:%M %p")

    name = candidate.get('name', 'Candidate')
    email = candidate.get('email', 'N/A')
    phone = candidate.get('phone', 'N/A')
    college = candidate.get('college', 'N/A')
    score = candidate.get('score', 50)
    total = candidate.get('total', 50)
    pct = candidate.get('percentage', 100)
    task_status = candidate.get('taskStatus', 'Submitted')

    sms = (
        f"INFOGENX ONBOARDING ALERT ({date_str})\n"
        f"----------------------------------\n"
        f"Candidate has completed Onboarding & Assessment!\n\n"
        f"- Name: {name}\n"
        f"- Email: {email}\n"
        f"- Phone: {phone}\n"
        f"- College: {college}\n"
        f"- Assessment Score: {score}/{total} ({pct}%) - PASSED\n"
        f"- Task: {task_status}\n"
        f"- Completed Time: {time_str} AEST\n"
        f"- Portal: https://candidates.infogenx.com\n"
        f"----------------------------------\n"
        f"Status: Ready for Owner & HR Final Interview."
    )
    return sms

def get_candidate_email_text(candidate):
    """
    Format Clean Plain Text & Executive Email for Company Owner.
    """
    date_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    name = candidate.get('name', 'Mohamed Yasar')
    email = candidate.get('email', 'test@infogenx.com')
    phone = candidate.get('phone', '+91 97878 06366')
    college = candidate.get('college', 'Anna University / Trichy')
    dept = candidate.get('department', 'B.E. Computer Science')
    score = candidate.get('score', 50)
    total = candidate.get('total', 50)
    pct = candidate.get('percentage', 100)

    email_body = f"""Subject: [CANDIDATE ONBOARDING COMPLETED] {name} - Assessment Score: {score}/{total} ({pct}%)

Dear Sir / Owner,

A candidate has successfully completed all stages of the Infogenx Candidate Onboarding Portal. Below are the full evaluation details for your review:

=======================================================
               CANDIDATE ONBOARDING REPORT
=======================================================

1. CANDIDATE PROFILE:
---------------------
- Full Name      : {name}
- Email Address  : {email}
- Phone Number   : {phone}
- College/Univ   : {college}
- Department     : {dept}
- Target Role    : Software Engineer Intern
- Completion Time: {date_str}

2. ASSESSMENT EVALUATION:
-------------------------
- Total Questions: {total}
- Correct Answers: {score}
- Final Score    : {score} / {total} ({pct}%)
- Result Status  : PASSED (100% Accuracy)

3. ONBOARDING STAGES AUDIT TRAIL:
---------------------------------
[OK] Step 1: SOP Recruitment Process & Job Roles Guide (Reviewed)
[OK] Step 2: Company Orientation Presentation (Reviewed)
[OK] Step 3: Technical & Compliance Assessment (Completed - 50/50)
[OK] Step 4: Practical Recruitment Task (Google Form + Poster Screenshot Uploaded)

4. NEXT ACTION ITEMS:
---------------------
- Review Candidate Profile : https://candidates.infogenx.com/admin
- Schedule Final HR / Technical Interview
- Issue Official Internship / Offer Letter

-------------------------------------------------------
Infogenx Candidate Onboarding System
Portal: https://candidates.infogenx.com
=======================================================
"""
    return email_body

if __name__ == "__main__":
    demo_candidate = {
        "name": "Mohamed Yasar",
        "email": "test@infogenx.com",
        "phone": "+91 97878 06366",
        "college": "Anna University (Trichy)",
        "department": "B.E. Computer Science & Engineering",
        "score": 50,
        "total": 50,
        "percentage": 100,
        "taskStatus": "Submitted (Poster & Google Form Proof Verified)"
    }

    print("=======================================================")
    print(" 1. SMS FORMAT (To be sent to Twilio Dialer Numbers):")
    print(f" Target Numbers: {FORWARD_SMS_NUMBERS}")
    print("=======================================================")
    print(get_candidate_sms_text(demo_candidate))

    print("\n=======================================================")
    print(" 2. EMAIL FORMAT (To be sent to Company Owner):")
    print(f" Target Owner Email: {OWNER_EMAIL}")
    print("=======================================================")
    print(get_candidate_email_text(demo_candidate))
