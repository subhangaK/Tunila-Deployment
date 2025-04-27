import Contact from "../models/contactModel.js";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { ADMIN_REPLY_TEMPLATE } from "../config/emailTemplates.js";

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { userId, name, email, subject, message } = req.body;

    const newContact = new Contact({
      user: userId || null,
      name,
      email,
      subject,
      message,
    });

    await newContact.save();
    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contact messages (Admin only)
export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().populate(
      "user",
      "name email profilePicture"
    );
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send reply to contact message (Admin only)
export const replyToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { replyMessage } = req.body;

    const contactMessage = await Contact.findById(messageId);
    if (!contactMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Send email to user
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: contactMessage.email,
      subject: `Re: ${contactMessage.subject}`,
      html: ADMIN_REPLY_TEMPLATE.replace("{{userName}}", contactMessage.name)
        .replace("{{originalMessage}}", contactMessage.message)
        .replace("{{adminReply}}", replyMessage),
    };

    await transporter.sendMail(mailOptions);

    // Update contact message with admin reply
    contactMessage.adminReply = {
      message: replyMessage,
      repliedAt: new Date(),
    };
    await contactMessage.save();

    res.status(200).json({ success: true, message: "Reply sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
