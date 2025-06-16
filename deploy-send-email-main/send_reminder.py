from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ✅ Environment variables
MAILJET_API_KEY = os.getenv("MAILJET_API_KEY")
MAILJET_SECRET_KEY = os.getenv("MAILJET_SECRET_KEY")

class ReminderRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: str
    subject: str
    html_body: str

@app.post("/send-reminder")
def send_reminder(req: ReminderRequest):
    if not MAILJET_API_KEY or not MAILJET_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Missing Mailjet credentials")

    email_data = {
        "Messages": [
            {
                "From": {
                    "Email": "khanarham0029@gmail.com",
                    "Name": "EduVantage"
                },
                "To": [
                    {
                        "Email": req.recipient_email,
                        "Name": req.recipient_name
                    }
                ],
                "Subject": req.subject,
                "HTMLPart": req.html_body
            }
        ]
    }

    response = requests.post(
        "https://api.mailjet.com/v3.1/send",
        auth=(MAILJET_API_KEY, MAILJET_SECRET_KEY),
        headers={"Content-Type": "application/json"},
        json=email_data
    )

    if response.ok:
        return {"success": True, "message": "Email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail=response.json())
