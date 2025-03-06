import {
  ApplicationEmailData,
  ContactEmailData,
} from "../interface/aplication.interfaces";
import transporter from "../config/nodemailer.config";

export const sendApplicationEmail = async (
  data: ApplicationEmailData
): Promise<{ success: boolean; message?: string; error?: any }> => {
  const { name, email, message, portfolioLink, jobName } = data;

  const mailOptions = {
    to: "eduardohairescampos@gmail.com",
    subject: `Application for job name: ${jobName}`,
    text: `  
      Name: ${name}  
      E-mail: ${email}  
      Message: ${message}  
      Portfolio: ${portfolioLink || "Not provided"}   

      Application for job Name: ${jobName}  
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    return { success: false, error };
  }
};

export const sendContactEmail = async (
  data: ContactEmailData
): Promise<{ success: boolean; message?: string; error?: any }> => {
  const { email, message } = data;

  const mailOptions = {
    to: "eduardohairescampos@gmail.com",
    subject: "Contact Form Message",
    text: `  
      E-mail: ${email}  
      Message: ${message}  
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Contact email sent successfully!" };
  } catch (error) {
    return { success: false, error };
  }
};
