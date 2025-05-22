const logo = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/egarant-email.png`;

export const emailHtml = (otp: string, validUntil: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          html, body {
            font-family: Arial, sans-serif;
            background-color: #394559;
            margin: 0;
            padding: 20px;
            height: 100%;
          }
          .email-container {
            max-width: 600px;
            margin: 0px auto;
            background-color: #394559;
            padding: 20px;
           
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 220px;
          }
          .content {
            text-align: center;
            color: #fff;
          }
          .content span.otp {
            display: inline-block;
            margin: 0px 10px;
            padding: 5px 10px;
            background-color: #DB5C45FF;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .note {
            margin-top: 20px;
            color: #A1A4BEFF;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="${logo}" alt="eGarant" />
          </div>
          <div class="content">
            <p>Vaš OTP kod <span class="otp">${otp}</p>
            <p>OTP kod je validan do: ${validUntil}</p>
            <p class="note">Ako Vi niste zahtevali OTP kod, možete da zanemarite ovu e-poruku.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
