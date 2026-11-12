export function genrateOTP(){
    return Math.floor(100000 + Math.random() * 900000);
}

export function getOTPhtml(otp){
    return `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
        </head>
        <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="text-align: center; color: #333;">OTP Verification</h2>

                <p style="font-size: 16px; color: #555;">
                    Your OTP for verification is:
                </p>

                <h1 style="text-align: center; color: #007BFF; letter-spacing: 5px;">
                    ${otp}
                </h1>

                <p style="font-size: 14px; color: #999;">
                    Please use this OTP to complete your verification process.
                    This OTP is valid for 5 minutes.
                </p>

                <p style="font-size: 12px; color: #999;">
                    If you did not request this OTP, please ignore this email.
                </p>
            </div>
        </body>
    </html>`; }
