import json
import sys
import os
import requests
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from datetime import datetime
from email_templates import get_welcome_email_html, WELCOME_EMAIL_SUBJECT

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

SPREADSHEET_ID = "1tEjn1hJ0rd2pNV3kaLyv4SitFyoRLwCKb5loAdEvjoM"
CLASPRC_PATH = Path(os.path.expanduser("~/.clasprc.json"))

PORTAL_URL = "https://candidates.infogenx.com/login"
DIALER_SMS_URL = "https://twilliodialer.infogenx.com/dialer/send-sms/"
DIALER_API_KEY = "infogenx-secret-2026"
CANDIDATE_API_URL = "https://api.infogenx.com/api/candidate-auth/users"

def get_auth_token():
    with open(CLASPRC_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    token_dict = data.get("tokens", {}).get("default", {})
    if not token_dict and "token" in data:
        token_dict = data.get("token", {})
    if not token_dict:
        token_dict = data
        
    access_token = token_dict.get("access_token")
    refresh_token = token_dict.get("refresh_token")
    client_id = token_dict.get("client_id")
    client_secret = token_dict.get("client_secret")

    if refresh_token and client_id and client_secret:
        refresh_data = {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        try:
            r = requests.post("https://oauth2.googleapis.com/token", data=refresh_data, timeout=15)
            if r.status_code == 200:
                access_token = r.json().get("access_token", access_token)
        except Exception as e:
            print(f"Token refresh note: {e}")
            
    return access_token

def generate_password(full_name, dob):
    clean_name = "".join(c for c in full_name.upper() if c.isalpha())
    if len(clean_name) < 4:
        clean_name = (clean_name + "INFO")[:4]
    else:
        clean_name = clean_name[:4]
    
    year = "2000"
    if dob:
        digits = "".join(c for c in dob if c.isdigit())
        if len(digits) >= 4:
            year = digits[:4] if int(digits[:4]) > 1950 and int(digits[:4]) < 2030 else digits[-4:]
    return f"{clean_name}{year}"

def send_gmail(to_email, full_name, password):
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    subject = WELCOME_EMAIL_SUBJECT
    html_content = get_welcome_email_html(full_name=full_name, to_email=to_email, password=password, portal_url=PORTAL_URL)

    msg = MIMEMultipart("alternative")
    msg["To"] = to_email
    msg["From"] = "infogenx.jobs@gmail.com"
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
    
    send_url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
    r = requests.post(send_url, headers=headers, json={"raw": raw_message})
    print(f"[*] Gmail API dispatch status: {r.status_code}")
    if r.status_code == 200:
        print(f"✅ Welcome email delivered to {to_email} successfully!")
        return True
    else:
        print(f"[!] Gmail API response: {r.text}")
        return False

def register_in_cpanel_db(candidate_data, password):
    payload = {
        "name": candidate_data["fullName"],
        "email": candidate_data["email"],
        "password": password,
        "role": "candidate",
        "max_attempts": 1,
        "mobile": candidate_data.get("mobile", ""),
        "location": candidate_data.get("city", ""),
        "qualification": candidate_data.get("qualification", "")
    }
    r = requests.post(CANDIDATE_API_URL, json=payload, timeout=10)
    print(f"[*] cPanel MySQL Candidate User Registration status: {r.status_code}")
    if r.status_code == 200:
        print(f"✅ User registered in cPanel DB: {r.json().get('message')}")
        return True
    return False

def process_candidate_onboarding(candidate):
    print("=" * 60)
    print("INFOGENX FULL ONBOARDING PIPELINE EXECUTION")
    print("=" * 60)
    print(f"Candidate: {candidate['fullName']}")
    print(f"Email:     {candidate['email']}")
    print(f"Mobile:    {candidate['mobile']}")
    print("=" * 60)

    # 1. Generate Password
    pwd = generate_password(candidate["fullName"], candidate["dob"])
    print(f"[+] Generated Password: {pwd}")

    # 2. Register in cPanel MySQL DB for Candidate Portal Login
    register_in_cpanel_db(candidate, pwd)

    # 3. Dispatch Official Welcome Email from infogenx.jobs@gmail.com
    send_gmail(candidate["email"], candidate["fullName"], pwd)

    print("\n" + "=" * 60)
    print("🎉 FULL ONBOARDING & ASSESSMENT TEST ACCESS COMPLETE!")
    print("=" * 60)
    print(f"1. Login Portal:     {PORTAL_URL}")
    print(f"2. Registered Email: {candidate['email']}")
    print(f"3. Password:         {pwd}")
    print(f"4. Attempt Rule:     Strictly 1 Attempt")
    print(f"5. Google Sheet:     https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit")
    print("=" * 60)
    return {
        "email": candidate["email"],
        "password": pwd,
        "portal": PORTAL_URL,
        "status": "SUCCESS"
    }

if __name__ == "__main__":
    # Test candidate execution
    test_cand = {
        "fullName": "Mohamed Yasar",
        "dob": "2000-08-15",
        "email": "infogenx.jobs@gmail.com",
        "mobile": "+919787806366",
        "city": "Chennai, Tamil Nadu",
        "qualification": "B.E. Computer Science & Engineering",
        "college": "Anna University",
        "department": "Computer Science",
        "yearOfPassing": "2024"
    }
    process_candidate_onboarding(test_cand)
