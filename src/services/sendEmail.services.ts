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
    to: "Hex@playthedarkwest.com",
    subject: `Application for job name: ${jobName}`,
    text: `  
      Name: ${name}  
      E-mail: ${email}  
      Portfolio: ${portfolioLink || "Not provided"}   
      Message: ${message}  

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
  const { name, email, message, portfolioLink } = data;

  const mailOptions = {
    to: "Hex@playthedarkwest.com",
    subject: "Contact Form Message",
    text: `  
      Name: ${name}  
      E-mail: ${email}
      Portfolio: ${portfolioLink || "Not provided"}      
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

export const getGameEmail = async (
  data: ContactEmailData
): Promise<{ success: boolean; message?: string; error?: any }> => {
  const { name, email, message, portfolioLink } = data;

  const mailOptions = {
    to: "Hex@playthedarkwest.com",
    subject: "Game Form Message",
    text: `  
    ${name.charAt(0).toUpperCase() + name.slice(1)} has joined the hunters!  
    
    E-mail: ${email}  
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Contact email sent successfully!" };
  } catch (error) {
    return { success: false, error };
  }
};
